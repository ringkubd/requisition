<?php

namespace App\Http\Controllers;

use App\Models\CashRequisition;
use App\Models\Department;
use App\Models\OneTimeLogin;
use App\Models\ProductIssue;
use App\Models\PurchaseRequisition;
use App\Models\User;
use App\Notifications\PushNotification;
use App\Notifications\RequisitionStatusNotification;
use App\Notifications\WhatsAppAccountNotification;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use NotificationChannels\WhatsApp\Component;
use stdClass;

class WhatsAppWebhookController extends Controller
{
    /**
     * Parsed message data from WhatsApp
     *
     * @var stdClass
     */
    private stdClass $messages;

    /**
     * WhatsApp webhook verification token
     *
     * @var string
     */
    private const VERIFICATION_TOKEN = "verification_token";

    /**
     * Handle WhatsApp webhook verification and process incoming messages
     *
     * @param Request $request
     * @return mixed
     */
    public function verify(Request $request)
    {
        // Store raw webhook data for debugging
        Storage::put("whatsapp_" . uniqid() . '.txt', json_encode($request->all()));

        // Handle webhook verification from WhatsApp
        if ($this->isVerificationRequest($request)) {
            return $request->hub_challenge;
        }

        // Verify webhook signature
        if (!$this->verifySignature($request)) {
            return response()->json(['error' => 'Invalid signature'], Response::HTTP_UNAUTHORIZED);
        }

        // Process button messages
        $message = $this->parseMessage($request->entry);
        if ($message->message_type === "button") {
            $this->processButtonMessage($message);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Check if the request is a verification request from WhatsApp
     *
     * @param Request $request
     * @return bool
     */
    private function isVerificationRequest(Request $request): bool
    {
        return $request->isMethod('GET') &&
            $request->has('hub_verify_token') &&
            $request->hub_verify_token === self::VERIFICATION_TOKEN;
    }

    /**
     * Verify the signature of the incoming request
     *
     * @param Request $request
     * @return bool
     */
    private function verifySignature(Request $request): bool
    {
        $body = $request->getContent();
        $requestHash = 'sha256=' . hash_hmac('sha256', $body, config('services.whatsapp.app_secret'));

        return hash_equals($requestHash, $request->header('X-Hub-Signature-256', ''));
    }

    /**
     * Parse the incoming message from WhatsApp
     *
     * @param array $entry
     * @return stdClass
     */
    private function parseMessage($entry): stdClass
    {
        $this->messages = new stdClass();

        if (!empty($entry)) {
            $firstEntry = collect(json_decode(json_encode($entry), true)[0]);
            $this->messages->id = $firstEntry['id'];
            $this->messages->changes = $firstEntry['changes'];
            $this->messages->first_change = collect($this->messages->changes[0]);
            $this->messages->message_value = collect($this->messages->first_change['value']);
            $this->messages->metadata = $this->messages->message_value['metadata'] ?? [];
            $this->messages->contacts = $this->messages->message_value['contacts'] ?? [];
            $this->messages->messages = $this->messages->message_value['messages'] ?? [];
            $this->messages->first_message = collect($this->messages->messages[0] ?? []) ?? [];
            $this->messages->message_type = $this->messages->first_message['type'] ?? '';
            $this->messages->context = $this->messages->first_message['context'] ?? "";
            $this->messages->from = $this->messages->first_message['from'] ?? "";
            $this->messages->timestamp = $this->messages->first_message['timestamp'] ?? "";
            $this->messages->button = $this->messages->first_message['button'] ?? [];
        }

        return $this->messages;
    }

    /**
     * Process a button message from WhatsApp
     *
     * @param stdClass $message
     * @return void
     */
    private function processButtonMessage(stdClass $message): void
    {
        $payload = explode('_', $message->button['payload'] ?? '');
        Log::info('Button payload', ['raw' => $message->button['payload'] ?? '']);

        // Ensure we have at least the minimum required elements
        if (count($payload) < 3) {
            Log::warning('Invalid payload format', ['payload' => $payload]);
            return;
        }

        $requisitionId = $payload[0] ?? null;
        $requisitorId = $payload[1] ?? null;
        $status = $payload[2] ?? null;
        $stage = $payload[3] ?? 'ceo';
        $type = $payload[4] ?? 'purchase';

        Log::info('Parsed payload', compact('requisitionId', 'requisitorId', 'status', 'stage', 'type'));

        if ($stage === 'ceo') {
            $this->processCeoApproval($requisitionId, $status, $type);
        } elseif ($stage === 'department' && $type === 'issue') {
            $this->processIssueDepartmentApproval($requisitionId, $requisitorId, $status);
        } elseif ($stage === 'department' && $type !== 'issue') {
            $this->processDepartmentApproval($requisitionId, $requisitorId, $status, $type);
        } elseif ($stage === 'accounts') {
            // Handle accounts approval if needed
            Log::info('Accounts approval stage reached', compact('requisitionId', 'requisitorId', 'status', 'type'));
        } else {
            Log::warning('Unknown stage or type', compact('stage', 'type'));
        }
    }

    /**
     * Process CEO approval for purchase or cash requisitions
     *
     * @param int $requisitionId
     * @param string $status
     * @param string $type
     * @return void
     */
    private function processCeoApproval($requisitionId, $status, $type): void
    {
        $requisition = null;
        $updated = false;

        // Find and update the appropriate requisition type
        if ($type === 'purchase') {
            $requisition = PurchaseRequisition::find($requisitionId, ['*']);
            if ($requisition) {
                $updated = $this->updateRequisitionStatus($requisition, $status);
            }
        } elseif ($type === 'cash') {
            $requisition = CashRequisition::find($requisitionId, ['*']);
            if ($requisition) {
                $updated = $this->updateRequisitionStatus($requisition, $status);
            }
        }

        // Send notifications if update was successful
        if ($updated && $requisition) {
            $this->sendNotifications($requisition);
        }
    }

    /**
     * Update the status of a requisition
     *
     * @param mixed $requisition
     * @param string $status
     * @return bool
     */
    private function updateRequisitionStatus($requisition, $status): bool
    {
        $statusData = [
            'ceo_status' => $status,
            'ceo_approved_at' => now()
        ];

        if ($requisition->approval_status) {
            return $requisition->approval_status()->update($statusData);
        } else {
            return (bool) $requisition->approval_status()->updateOrCreate([], $statusData);
        }
    }

    /**
     * Send notifications to relevant users about requisition status
     *
     * @param mixed $requisition
     * @return void
     */
    private function sendNotifications($requisition): void
    {
        $notifiedUsers = [
            $requisition->user,
            User::query()
                ->whereHas('roles', function ($q) {
                    $q->where('name', 'Store Manager');
                })
                ->first()
        ];

        foreach ($notifiedUsers as $notifiedUser) {
            if (!$notifiedUser) continue;

            $requisitor = $requisition->user->name;
            $messageTitle = "A purchase requisition has been generated and for your approval.";
            $messageBody = "$requisitor is generated an requisition P.R. NO. $requisition->prf_no against I.R.F. NO. $requisition->irf_no. Please review and approve.";

            $notifiedUser->notify(new PushNotification($messageTitle, $messageBody));
            $notifiedUser->notify(new RequisitionStatusNotification($requisition));
        }
    }

    /**
     * Process department approval for product issue
     *
     * @param int $issueId
     * @param int $requisitorId
     * @param string $status
     * @return void
     */
    private function processIssueDepartmentApproval($issueId, $requisitorId, $status): void
    {
        $issue = ProductIssue::find($issueId, ['*']);

        if ($issue) {
            $issue->update([
                'department_status' => $status,
                'department_approved_by' => $requisitorId,
                'department_approved_at' => now()
            ]);
        }
    }


    /**
     * Process department approval for purchase or cash requisitions
     *
     * @param int $requisitionId
     * @param int $requisitorId
     * @param string $status
     * @param string $type
     * @return void
     */
    private function processDepartmentApproval($requisitionId, $requisitorId, $status, $type): void
    {
        // Get requisition based on type
        $requisition = $type === 'cash'
            ? CashRequisition::find($requisitionId, ['*'])
            : PurchaseRequisition::find($requisitionId, ['*']);

        if (!$requisition) {
            Log::warning("Requisition not found", compact('requisitionId', 'type'));
            return;
        }

        // Update approval status
        $this->updateDepartmentApprovalStatus($requisition, $requisitorId, $status);

        // Send notifications to accounts department users
        $this->notifyAccountsDepartment($requisition, $requisitorId, $type);
    }

    /**
     * Update department approval status for a requisition
     *
     * @param mixed $requisition
     * @param int $requisitorId
     * @param string $status
     * @return bool
     */
    private function updateDepartmentApprovalStatus($requisition, $requisitorId, $status): bool
    {
        $statusData = [
            'department_approved_by' => $requisitorId,
            'department_approved_at' => now(),
            'accounts_status' => $status
        ];

        if ($requisition->approval_status) {
            return $requisition->approval_status()->update($statusData);
        }

        return (bool) $requisition->approval_status()->updateOrCreate([], $statusData);
    }

    /**
     * Send notifications to accounts department users
     *
     * @param mixed $requisition
     * @param int $requisitorId
     * @param string $type
     * @return void
     */
    private function notifyAccountsDepartment($requisition, $requisitorId, $type): void
    {
        $department = Department::query()
            ->where('branch_id', $requisition->branch_id)
            ->where('name', 'Accounts')
            ->with('users')
            ->first();

        if (empty($department) || empty($department->users)) {
            return;
        }

        $isCashRequisition = $type === 'cash';
        $permissionName = $isCashRequisition
            ? 'accounts-approval-cash'
            : 'accounts-approval-purchase';
        $notificationTitle = $isCashRequisition
            ? "A cash requisition has been generated and for your approval."
            : "A purchase requisition has been generated and for your approval.";
        $notificationBody = ($isCashRequisition ? "A cash" : "A purchase")
            . " requisition P.R. NO. $requisition->prf_no against I.R.F. NO. $requisition->irf_no"
            . " is generated by {$requisition->user->name}. Please review and approve.";

        // Path for view differs based on type
        $viewRoute = $isCashRequisition
            ? "cash-requisition/$requisition->id/whatsapp_view"
            : "purchase-requisition/$requisition->id/whatsapp_view";

        foreach ($department->users as $user) {
            if (!$user->hasPermissionTo($permissionName)) {
                continue;
            }

            // Send push notification
            $user->notify(new PushNotification($notificationTitle, $notificationBody));

            // Get button payload
            $approvePayload = $requisition->id . '_' . $requisitorId . '_2_department_' . $type;
            $rejectPayload = $requisition->id . '_' . $requisitorId . '_3_department_' . $type;
            $one_time_key = new OneTimeLogin();
            $authKey = $one_time_key->generate($user->id);

            // Send WhatsApp notifications
            $this->sendWhatsAppNotification(
                $user,
                $requisition,
                $requisitorId,
                $approvePayload,
                $rejectPayload,
                $viewRoute,
                $authKey->auth_key
            );
        }
    }

    /**
     * Send WhatsApp notification to a user
     *
     * @param User $user
     * @param mixed $requisition
     * @param int $requisitorId
     * @param string $approvePayload
     * @param string $rejectPayload
     * @param string $viewRoute
     * @param string $authKey
     * @param string|null $overridePhone
     * @return void
     */
    private function sendWhatsAppNotification(
        $user,
        $requisition,
        $requisitorId,
        $approvePayload,
        $rejectPayload,
        $viewRoute,
        $authKey,
        $overridePhone = null
    ): void {
        $phoneNumber = $overridePhone ?? $user->mobile_no;

        if (empty($phoneNumber)) {
            return;
        }
        Log::info('Sending WhatsApp notification', [
            'user_id' => $user->id,
            'requisition_id' => $requisition->id,
            'phone_number' => $phoneNumber,
            'approve_payload' => $approvePayload,
            'reject_payload' => $rejectPayload,
            'view_route' => $viewRoute,
            'auth_key' => $authKey
        ]);
        $user->notify(new WhatsAppAccountNotification(
            Component::text($requisition->department->name),
            Component::text($requisition->user->name),
            Component::text($requisition->prf_no),
            Component::quickReplyButton([$approvePayload]),
            Component::quickReplyButton([$rejectPayload]),
            Component::urlButton([$viewRoute . "?auth_key=" . $authKey]),
            $phoneNumber
        ));
    }
}
