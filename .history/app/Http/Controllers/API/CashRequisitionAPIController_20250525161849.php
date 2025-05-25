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
            __('messages.retrieved', ['model' => __('models/cashRequisitions.plural')])
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
            __('messages.saved', ['model' => __('models/cashRequisitions.singular')])
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
                __('messages.not_found', ['model' => __('models/cashRequisitions.singular')])
            );
        }

        return $this->sendResponse(
            new CashRequisitionResource($cashRequisition),
            __('messages.retrieved', ['model' => __('models/cashRequisitions.singular')])
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
                __('messages.not_found', ['model' => __('models/cashRequisitions.singular')])
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
            __('messages.updated', ['model' => __('models/cashRequisitions.singular')])
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
                __('messages.not_found', ['model' => __('models/cashRequisitions.singular')])
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
            __('messages.deleted', ['model' => __('models/cashRequisitions.singular')])
        );
    }
}
