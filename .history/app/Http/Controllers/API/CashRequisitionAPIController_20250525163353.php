<?php

namespace App\Http\Controllers\API;

use App\Events\RequisitionStatusEvent;
use App\Helper\NotificationTestHelper;
use App\Models\CashRequisition;
use App\Models\Department;
use App\Models\OneTimeLogin;
use App\Models\User;
use App\Notifications\CeoMailNotification;
use App\Notifications\PushNotification;
use App\Notifications\RequisitionStatusNotification;
use App\Notifications\WhatsAppCommonNotification;
use App\Notifications\WhatsAppDepartmentNotification;
use App\Notifications\WhatsAppNotification;
use App\Repositories\CashRequisitionRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\CashRequisitionResource;
use App\Notifications\WhatsAppAccountNotification;
use Illuminate\Support\Facades\DB;
use NotificationChannels\WhatsApp\Component;
use NotificationChannels\WhatsApp\Component\QuickReplyButton;
use NotificationChannels\WhatsApp\Component\UrlButton;
use OpenApi\Annotations as OA;

/**
 * Class CashRequisitionAPIController
 *
 * Controller for handling Cash Requisition related API requests
 */
class CashRequisitionAPIController extends AppBaseController
{
    /** @var CashRequisitionRepository */
    private $cashRequisitionRepository;

    /**
     * Constructor
     *
     * @param CashRequisitionRepository $cashRequisitionRepo
     */
    public function __construct(CashRequisitionRepository $cashRequisitionRepo)
    {
        $this->cashRequisitionRepository = $cashRequisitionRepo;
    }

    /**
     * @OA\Get(
     *      path="/cash-requisitions",
     *      summary="getCashRequisitionList",
     *      tags={"CashRequisition"},
     *      description="Get all CashRequisitions",
     *      @OA\Response(
     *          response=200,
     *          description="successful operation",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(
     *                  property="success",
     *                  type="boolean"
     *              ),
     *              @OA\Property(
     *                  property="data",
     *                  type="array",
     *                  @OA\Items(ref="#/components/schemas/CashRequisition")
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $cashRequisitions = $this->cashRequisitionRepository->allQuery(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        )
            ->when($request->date, function ($q, $date) {
                $q->whereRaw("date(created_at) = ?", [$date]);
            })
            ->when($request->search, function ($q, $v) {
                $q->whereHas('cashRequisitionItems', function ($w) use ($v) {
                    $w->where('item', 'like', "%$v%")->orWhere('purpose', 'like', "%$v%");
                });
            })
            ->where('department_id', auth_department_id())
            ->where('branch_id', auth_branch_id())
            ->latest()
            ->get();

        return $this->sendResponse(
            CashRequisitionResource::collection($cashRequisitions),
            'Cash Requisitions retrieved successfully'
        );
    }

    /**
     * @OA\Post(
     *      path="/cash-requisitions",
     *      summary="createCashRequisition",
     *      tags={"CashRequisition"},
     *      description="Create CashRequisition",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/CashRequisition")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="successful operation",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(
     *                  property="success",
     *                  type="boolean"
     *              ),
     *              @OA\Property(
     *                  property="data",
     *                  ref="#/components/schemas/CashRequisition"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $input = $request->all();
        $prf_no = $this->newPRFNO();
        $totalCost = collect($input)->sum('cost');

        // Create cash requisition
        $cashRequisition = $this->cashRequisitionRepository->create([
            'ir_no' => 5,
            'prf_no' => $prf_no,
            'total_cost' => $totalCost,
            'user_id' => $request->user()->id,
            'branch_id' => auth_branch_id(),
            'department_id' => auth_department_id()
        ]);

        // Create requisition items
        $newItems = collect($input)->map(function ($item) {
            return collect($item)->except(['cost']);
        });
        $cashRequisition->cashRequisitionItems()->createMany($newItems->toArray());

        // Create PRF record
        $cashRequisition->prfNOS()->create([
            'prf_no' => $prf_no,
            'total' => $totalCost
        ]);

        // Create initial approval status
        $cashRequisition->approval_status()->create([
            'department_id' => auth_department_id(),
            'department_status' => 1,
        ]);

        // Send notifications to head of department
        $this->notifyHeadOfDepartment($cashRequisition, $request->user()->name, $prf_no);

        return $this->sendResponse(
            new CashRequisitionResource($cashRequisition),
            'Cash Requisition saved successfully'
        );
    }

    /**
     * Send notifications to head of department
     *
     * @param CashRequisition|Model $cashRequisition
     * @param string $requisitorName
     * @param string $prfNo
     * @return void
     */
    private function notifyHeadOfDepartment($cashRequisition, string $requisitorName, string $prfNo): void
    {
        // If in test mode, only notify the test user
        if (NotificationTestHelper::isTestModeEnabled()) {
            $testUser = NotificationTestHelper::getTestUser();
            $testPhone = NotificationTestHelper::getTestPhone();

            // Send push notification
            $testUser->notify(new PushNotification(
                "A cash requisition is initiated.",
                "$requisitorName generated a cash requisition P.R. No. $prfNo. Please approve or reject it."
            ));

            // Send email notification
            $testUser->notify(new RequisitionStatusNotification($cashRequisition));

            // Send WhatsApp notification to test phone
            $this->sendWhatsAppNotification($testUser, $cashRequisition, $requisitorName, $prfNo, $testPhone);

            return;
        }

        // Normal notification flow
        $department_autority = User::query()
            ->whereHas('branches', function ($q) use ($cashRequisition) {
                $q->where('id',  $cashRequisition->branch_id);
            })
            ->whereHas('permissions', function ($q) {
                $q->where('name', 'approve_department_cash');
            })
            ->get();

        if (empty($department_autority)) {
            return;
        }

        foreach ($department_autority as $authority) {
            // Send push notification
            $authority->notify(new PushNotification(
                "A cash requisition is initiated.",
                "$requisitorName generated a cash requisition P.R. No. $prfNo. Please approve or reject it."
            ));

            // Send email notification
            $authority->notify(new RequisitionStatusNotification($cashRequisition));

            // Send WhatsApp notifications if mobile number exists
            if (!empty($authority->mobile_no)) {
                $this->sendWhatsAppNotification($authority, $cashRequisition, $requisitorName, $prfNo);
            }
        }

        $user = User::where('email', 'ajr.jahid@gmail.com')->first();
        if ($user) {
            // Also send to testing/backup number
            $this->sendWhatsAppNotification($user, $cashRequisition, $requisitorName, $prfNo, '+8801737956549');
        }
    }

    /**
     * Send WhatsApp notification to a user
     *
     * @param User $user
     * @param CashRequisition $cashRequisition
     * @param string $requisitorName
     * @param string $prfNo
     * @param string|null $overridePhone
     * @return void
     */
    private function sendWhatsAppNotification(User $user, CashRequisition $cashRequisition, string $requisitorName, string $prfNo, ?string $overridePhone = null): void
    {
        $phoneNumber = $overridePhone ?? $user->mobile_no;

        if (empty($phoneNumber)) {
            return;
        }

        // Generate one-time login key
        $one_time_key = new OneTimeLogin();
        $key = $one_time_key->generate($user->id);

        // Send department notification with action buttons
        $user->notify(
            new WhatsAppDepartmentNotification(
                Component::text($requisitorName),
                Component::text($cashRequisition->prf_no),
                Component::quickReplyButton([$cashRequisition->id . '_' . $user->id . '_2_department_cash']),
                Component::quickReplyButton([$cashRequisition->id . '_' . $user->id . '_3_department_cash']),
                Component::urlButton(["/cash-requisition/$cashRequisition->id/whatsapp_view?auth_key=" . $key->auth_key]),
                $phoneNumber
            )
        );
    }

    /**
     * @OA\Get(
     *      path="/cash-requisitions/{id}",
     *      summary="getCashRequisitionItem",
     *      tags={"CashRequisition"},
     *      description="Get CashRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashRequisition",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="successful operation",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(
     *                  property="success",
     *                  type="boolean"
     *              ),
     *              @OA\Property(
     *                  property="data",
     *                  ref="#/components/schemas/CashRequisition"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function show($id): JsonResponse
    {
        /** @var CashRequisition $cashRequisition */
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($cashRequisition)) {
            return $this->sendError(
                'Cash Requisition not found'
            );
        }

        return $this->sendResponse(
            new CashRequisitionResource($cashRequisition),
            'Cash Requisition retrieved successfully'
        );
    }

    /**
     * @OA\Put(
     *      path="/cash-requisitions/{id}",
     *      summary="updateCashRequisition",
     *      tags={"CashRequisition"},
     *      description="Update CashRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashRequisition",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/CashRequisition")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="successful operation",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(
     *                  property="success",
     *                  type="boolean"
     *              ),
     *              @OA\Property(
     *                  property="data",
     *                  ref="#/components/schemas/CashRequisition"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, Request $request): JsonResponse
    {
        $input = $request->all();
        /** @var CashRequisition $cashRequisition */
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($cashRequisition)) {
            return $this->sendError(
                'Cash Requisition not found'
            );
        }

        DB::transaction(function () use ($id, $input, $cashRequisition) {
            $totalCost = collect($input)->sum('cost');

            // Update cash requisition
            $this->cashRequisitionRepository->update([
                'total_cost' => $totalCost,
            ], $id);

            // Update requisition items
            $cashRequisition->cashRequisitionItems()->delete();
            $newItems = collect($input)->map(function ($item) {
                return collect($item)->except(['cost']);
            });
            $cashRequisition->cashRequisitionItems()->createMany($newItems->toArray());

            // Update PRF record
            $cashRequisition->prfNOS()->update(['total' => $totalCost]);
        });

        return $this->sendResponse(
            new CashRequisitionResource($cashRequisition->fresh()),
            'Cash Requisition updated successfully'
        );
    }

    /**
     * @OA\Delete(
     *      path="/cash-requisitions/{id}",
     *      summary="deleteCashRequisition",
     *      tags={"CashRequisition"},
     *      description="Delete CashRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashRequisition",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="successful operation",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(
     *                  property="success",
     *                  type="boolean"
     *              ),
     *              @OA\Property(
     *                  property="data",
     *                  type="string"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function destroy($id): JsonResponse
    {
        /** @var CashRequisition $cashRequisition */
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($cashRequisition)) {
            return $this->sendError(
                'Cash Requisition not found'
            );
        }

        DB::transaction(function () use ($cashRequisition) {
            $cashRequisition->cashRequisitionItems()->delete();
            $cashRequisition->prfNOS()->delete();
            $cashRequisition->approval_status()->delete();
            $cashRequisition->delete();
        });

        return $this->sendResponse(
            $id,
            'Cash Requisition deleted successfully'
        );
    }

    /**
     * Change approval status for a requisition
     *
     * @param Request $request
     * @param CashRequisition $requisition
     * @return JsonResponse|null
     */
    public function changeStatusDepartment(Request $request, CashRequisition $requisition): ?JsonResponse
    {
        $head_of_department = $requisition->department?->head_of_department;

        // Base approval data
        $data = [
            'department_id' => $requisition->department_id,
            'notes' => $request->notes
        ];

        $notifiedUsers = [];

        // Process based on approval stage
        switch ($request->stage) {
            case 'accounts':
                $notifiedUsers = $this->processAccountsApproval($request, $requisition, $data);
                // Notify accounts users
                $accountsUsers = $this->findAccountsDepartmentUsers();
                foreach ($accountsUsers as $user) {
                    if ($user->hasPermissionTo('accounts-approval-cash')) {
                        $this->notifyAccountsUser($user, $requisition, $request->user());
                    }
                }
                break;

            case 'ceo':
                $notifiedUsers = $this->processCeoApproval($request, $requisition, $data);
                // Notify CEO
                $ceo = $this->findCeoUser();
                if ($ceo) {
                    $this->notifyCeoUser($ceo, $requisition, $request->user());
                }
                break;

            default:
                $notifiedUsers = $this->processDepartmentApproval($request, $requisition, $data);
                // Notify department head
                $departmentHead = User::find($head_of_department);
                if ($departmentHead) {
                    $this->notifyDepartmentUser($departmentHead, $requisition, $request->user());
                }
                break;
        }

        // Update or create approval status
        $this->updateRequisitionApprovalStatus($requisition, $data);

        // Broadcast event to relevant users
        broadcast(new RequisitionStatusEvent(
            new CashRequisitionResource($requisition),
            [$requisition->user, $request->user()]
        ));

        // Send notifications to relevant users
        $this->sendStatusNotifications($notifiedUsers, $requisition);

        return $this->sendResponse(
            new CashRequisitionResource($requisition),
            'Cash Requisition processed successfully'
        );
    }

    /**
     * Process accounts approval stage
     *
     * @param Request $request
     * @param CashRequisition $requisition
     * @param array &$data
     * @return array
     */
    private function processAccountsApproval(Request $request, CashRequisition $requisition, array &$data): array
    {
        $notifiedUsers = [];

        $data['accounts_status'] = $request->status;

        if ($request->status == 2) {
            $data['accounts_approved_by'] = $request->user()->id;
            $data['ceo_status'] = 1;
            $data['accounts_approved_at'] = now();

            // Find CEO and add to notified users
            $ceo = $this->findCeoUser();
            if ($ceo) {
                $notifiedUsers[] = $ceo;
            }
        }

        return $notifiedUsers;
    }

    /**
     * Process CEO approval stage
     *
     * @param Request $request
     * @param CashRequisition $requisition
     * @param array &$data
     * @return array
     */
    private function processCeoApproval(Request $request, CashRequisition $requisition, array &$data): array
    {
        $notifiedUsers = [];

        $data['ceo_status'] = $request->status;

        if ($request->status == 2) {
            $data['ceo_approved_at'] = now();

            // Find and notify both requisitor and store manager
            $storeManager = $this->findStoreManager();

            // Make sure we're adding valid users to notification list
            if ($requisition->user) {
                $notifiedUsers[] = $requisition->user;
            }

            if ($storeManager) {
                $notifiedUsers[] = $storeManager;
            }

            // Also notify the accounts department about CEO approval
            $accountsUsers = $this->findAccountsDepartmentUsers();
            foreach ($accountsUsers as $user) {
                if ($user->hasPermissionTo('accounts-approval-cash')) {
                    $notifiedUsers[] = $user;
                }
            }
        }

        return $notifiedUsers;
    }

    /**
     * Process department approval stage
     *
     * @param Request $request
     * @param CashRequisition $requisition
     * @param array &$data
     * @return array
     */
    private function processDepartmentApproval(Request $request, CashRequisition $requisition, array &$data): array
    {
        $notifiedUsers = [];

        $data['department_status'] = $request->status;

        if ($request->status == 2) {
            $data['department_approved_by'] = $request->user()->id;
            $data['department_approved_at'] = now();
            $data['accounts_status'] = 1;

            // Find accounts department users with permission
            $accountsUsers = $this->findAccountsDepartmentUsers();

            foreach ($accountsUsers as $user) {
                if ($user->hasPermissionTo('accounts-approval-cash')) {
                    $notifiedUsers[] = $user;
                }
            }
            $notifiedUsers[] = User::where('email', 'ajr.jahid@gmail.com')->first();
        }

        return $notifiedUsers;
    }

    /**
     * Find the CEO user
     *
     * @return User|null
     */
    private function findCeoUser(): ?User
    {
        return User::query()
            ->whereHas('organizations', function ($q) {
                $q->where('id', auth_organization_id());
            })
            ->whereHas('designations', function ($q) {
                $q->where('name', 'CEO');
            })
            ->first();
    }

    /**
     * Find the Store Manager user
     *
     * @return User|null
     */
    private function findStoreManager(): ?User
    {
        return User::whereHas('organizations', function ($q) {
            $q->where('id', auth_organization_id());
        })
            ->whereHas('roles', function ($q) {
                $q->where('name', 'Store Manager');
            })
            ->first();
    }

    /**
     * Find users in the Accounts department
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function findAccountsDepartmentUsers()
    {
        $department = Department::query()
            ->where('branch_id', auth_branch_id())
            ->where('name', 'Accounts')
            ->with('users')
            ->first();

        return $department ? $department->users : collect();
    }

    /**
     * Update or create requisition approval status
     *
     * @param CashRequisition $requisition
     * @param array $data
     * @return void
     */
    private function updateRequisitionApprovalStatus(CashRequisition $requisition, array $data): void
    {
        if ($requisition->approval_status) {
            $requisition->approval_status()->update($data);
        } else {
            $requisition->approval_status()->updateOrCreate($data);
        }
    }

    /**
     * Send notifications to CEO user
     *
     * @param User $ceo
     * @param CashRequisition $requisition
     * @param User $currentUser
     * @return void
     */
    private function notifyCeoUser(User $ceo, CashRequisition $requisition, User $currentUser): void
    {
        if (config('app.debug')) {
            return;
        }

        $requisitor_name = $requisition->user;
        $one_time_key = new OneTimeLogin();

        // If in test mode, redirect notifications to test user
        if (NotificationTestHelper::isTestModeEnabled()) {
            $testUser = NotificationTestHelper::getTestUser();
            $testPhone = NotificationTestHelper::getTestPhone();
            $key = $one_time_key->generate($testUser->id);

            $messageText = Component::text("Requisitor Name: $requisitor_name->name,  P.R. NO.: $requisition->prf_no.");
            $viewUrl = Component::urlButton(["/cash-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
            $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_ceo_cash']);
            $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_ceo_cash']);

            // Send email notification to test user
            $testUser->notify(new CeoMailNotification($requisition));
            $testUser->notify(new RequisitionStatusNotification($requisition));

            // Send WhatsApp to test number
            $testUser->notify(new WhatsAppNotification(
                $messageText,
                $testPhone,
                $viewUrl,
                $approveButton,
                $rejectButton
            ));

            return;
        }

        // Regular notification flow
        $key = $one_time_key->generate($ceo->id);
        $messageText = Component::text("Requisitor Name: $requisitor_name->name,  P.R. NO.: $requisition->prf_no.");
        $viewUrl = Component::urlButton(["/cash-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
        $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_ceo_cash']);
        $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_ceo_cash']);

        // Send email notification using both notification types
        $ceo->notify(new CeoMailNotification($requisition));
        $ceo->notify(new RequisitionStatusNotification($requisition));

        // Send to backup numbers in non-production environments
        $backupNumbers = ['+8801725271724', '+8801737956549'];

        foreach ($backupNumbers as $number) {
            $ceo->notify(new WhatsAppNotification(
                $messageText,
                $number,
                $viewUrl,
                $approveButton,
                $rejectButton
            ));
        }
    }

    /**
     * Send notifications to department user
     *
     * @param User $user
     * @param CashRequisition $requisition
     * @param User $currentUser
     * @return void
     */
    private function notifyDepartmentUser(User $user, CashRequisition $requisition, User $currentUser): void
    {
        if (config('app.debug')) {
            return;
        }

        $requisitor_name = $requisition->user;
        $one_time_key = new OneTimeLogin();

        // If in test mode, redirect notifications to test user
        if (NotificationTestHelper::isTestModeEnabled()) {
            $testUser = NotificationTestHelper::getTestUser();
            $testPhone = NotificationTestHelper::getTestPhone();
            $key = $one_time_key->generate($testUser->id);

            $messageText = Component::text("Requisitor Name: $requisitor_name->name,  P.R. NO.: $requisition->prf_no.");
            $viewUrl = Component::urlButton(["/cash-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
            $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_department_cash']);
            $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_department_cash']);

            // Send email notification
            $testUser->notify(new RequisitionStatusNotification($requisition));

            // Send WhatsApp to test number
            $testUser->notify(new WhatsAppNotification(
                $messageText,
                $testPhone,
                $viewUrl,
                $approveButton,
                $rejectButton
            ));

            return;
        }

        // Regular notification flow
        $key = $one_time_key->generate($user->id);
        $messageText = Component::text("Requisitor Name: $requisitor_name->name,  P.R. NO.: $requisition->prf_no.");
        $viewUrl = Component::urlButton(["/cash-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
        $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_department_cash']);
        $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_department_cash']);

        // Send email notification
        $user->notify(new RequisitionStatusNotification($requisition));

        // Send to department head's mobile
        if ($user->mobile_no) {
            $user->notify(new WhatsAppNotification(
                $messageText,
                $user->mobile_no,
                $viewUrl,
                $approveButton,
                $rejectButton
            ));
        }

        // Send to backup numbers in non-production environments
        if (!app()->environment('production', 'staging')) {
            $backupNumbers = ['+8801737956549'];

            foreach ($backupNumbers as $number) {
                $user->notify(new WhatsAppNotification(
                    $messageText,
                    $number,
                    $viewUrl,
                    $approveButton,
                    $rejectButton
                ));
            }
        }
    }

    /**
     * Send notifications to accounts user
     *
     * @param User $user
     * @param CashRequisition $requisition
     * @param User $currentUser
     * @return void
     */
    private function notifyAccountsUser(User $user, CashRequisition $requisition, User $currentUser): void
    {
        if (config('app.debug')) {
            return;
        }

        $requisitor_name = $requisition->user;
        $one_time_key = new OneTimeLogin();

        // If in test mode, redirect notifications to test user
        if (NotificationTestHelper::isTestModeEnabled()) {
            $testUser = NotificationTestHelper::getTestUser();
            $testPhone = NotificationTestHelper::getTestPhone();
            $key = $one_time_key->generate($testUser->id);

            $departmentComponent = Component::text($requisition->department->name ?? 'Unknown Department');
            $nameComponent = Component::text($requisitor_name->name);
            $prfComponent = Component::text($requisition->prf_no);
            $viewUrl = Component::urlButton(["/cash-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
            $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_accounts_cash']);
            $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_accounts_cash']);

            // Send email notification
            $testUser->notify(new RequisitionStatusNotification($requisition));

            // Send WhatsApp to test number - Using WhatsAppAccountNotification for accounts users
            $testUser->notify(new WhatsAppAccountNotification(
                $departmentComponent,
                $nameComponent,
                $prfComponent,
                $approveButton,
                $rejectButton,
                $viewUrl,
                $testPhone
            ));

            return;
        }

        // Regular notification flow
        $key = $one_time_key->generate($user->id);
        $departmentComponent = Component::text($requisition->department->name ?? 'Unknown Department');
        $nameComponent = Component::text($requisitor_name->name);
        $prfComponent = Component::text($requisition->prf_no);
        $viewUrl = Component::urlButton(["/cash-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
        $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_accounts_cash']);
        $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_accounts_cash']);

        // Send email notification
        $user->notify(new RequisitionStatusNotification($requisition));

        // Send to accounts user's mobile - Using WhatsAppAccountNotification for accounts users
        if ($user->mobile_no) {
            $user->notify(new WhatsAppAccountNotification(
                $departmentComponent,
                $nameComponent,
                $prfComponent,
                $approveButton,
                $rejectButton,
                $viewUrl,
                $user->mobile_no
            ));
        }

        // Send to backup numbers in non-production environments
        if (!app()->environment('production', 'staging')) {
            $backupNumbers = ['+8801737956549'];

            foreach ($backupNumbers as $number) {
                $user->notify(new WhatsAppAccountNotification(
                    $departmentComponent,
                    $nameComponent,
                    $prfComponent,
                    $approveButton,
                    $rejectButton,
                    $viewUrl,
                    $number
                ));
            }
        }
    }

    /**
     * Copy an existing requisition
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function copy($id, Request $request): JsonResponse
    {
        // Get the original requisition
        $originalRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($originalRequisition)) {
            return $this->sendError(
                'Cash Requisition not found'
            );
        }

        // Generate new PRF number
        $prf_no = $this->newPRFNO();

        // Create a new requisition based on the original
        $newRequisition = $this->cashRequisitionRepository->create([
            'ir_no' => 5,
            'prf_no' => $prf_no,
            'total_cost' => $originalRequisition->total_cost,
            'user_id' => $request->user()->id,
            'branch_id' => auth_branch_id(),
            'department_id' => auth_department_id()
        ]);

        // Copy items from the original requisition
        $newItems = $originalRequisition->cashRequisitionItems->map(function ($item) {
            return [
                'item' => $item->item,
                'unit' => $item->unit,
                'required_unit' => $item->required_unit,
                'unit_price' => $item->unit_price,
                'purpose' => $item->purpose,
            ];
        });

        // Create requisition items, PRF record, and initial approval status
        $newRequisition->cashRequisitionItems()->createMany($newItems->toArray());
        $newRequisition->prfNOS()->create([
            'prf_no' => $prf_no,
            'total' => $newRequisition->total_cost
        ]);
        $newRequisition->approval_status()->create([
            'department_id' => auth_department_id(),
            'department_status' => 1,
        ]);

        return $this->sendResponse(
            new CashRequisitionResource($newRequisition),
            'Cash Requisition copied successfully'
        );
    }

    /**
     * Send status notifications to relevant users
     *
     * @param array $users
     * @param CashRequisition $requisition
     * @return void
     */
    private function sendStatusNotifications(array $users, CashRequisition $requisition): void
    {
        foreach ($users as $user) {
            if (!$user) {
                continue;
            }

            $requisitor = $requisition->user->name;
            $prfNo = $requisition->prf_no;

            // Send push notification
            $user->notify(new PushNotification(
                "A cash requisition status has been updated.",
                "$requisitor's cash requisition P.R. NO. $prfNo has been updated. Please review."
            ));

            // Send requisition status notification (email)
            $user->notify(new RequisitionStatusNotification($requisition));

            // Skip WhatsApp notifications in debug mode
            if (config('app.debug')) {
                continue;
            }

            // Generate one-time login key
            $one_time_key = new OneTimeLogin();
            $key = $one_time_key->generate($user->id);

            // Generate WhatsApp components
            $messageText = Component::text("Requisitor Name: $requisitor, P.R. NO.: $prfNo.");
            $viewUrl = Component::urlButton(["/cash-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);

            // Determine if user is from accounts department and set appropriate buttons
            $isAccountsUser = $user->default_department_name === 'Accounts' || $user->hasPermissionTo('accounts-approval-cash');

            if ($isAccountsUser) {
                // Accounts approval buttons - Using WhatsAppAccountNotification for accounts users
                $approveButton = Component::quickReplyButton([$requisition->id . '_' . $user->id . '_2_accounts_cash']);
                $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $user->id . '_3_accounts_cash']);
                if ($user->mobile_no) {
                    $user->notify(new WhatsAppAccountNotification(
                        $messageText,
                        $user->mobile_no,
                        $viewUrl,
                        $approveButton,
                        $rejectButton
                    ));
                }
            } else {
                // Department approval buttons
                $approveButton = Component::quickReplyButton([$requisition->id . '_' . $user->id . '_2_department_cash']);
                $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $user->id . '_3_department_cash']);
                if ($user->mobile_no) {
                    $user->notify(new WhatsAppNotification(
                        $messageText,
                        $user->mobile_no,
                        $viewUrl,
                        $approveButton,
                        $rejectButton
                    ));
                }
            }

            // Also send to backup numbers in non-production environments
            if (!app()->environment('production', 'staging')) {
                $backupNumbers = ['+8801737956549']; // Add only the test number here

                foreach ($backupNumbers as $number) {
                    if ($isAccountsUser) {
                        $user->notify(new WhatsAppAccountNotification(
                            $messageText,
                            $number,
                            $viewUrl,
                            $approveButton,
                            $rejectButton
                        ));
                    } else {
                        $user->notify(new WhatsAppNotification(
                            $messageText,
                            $number,
                            $viewUrl,
                            $approveButton,
                            $rejectButton
                        ));
                    }
                }
            }
        }
    }
}
