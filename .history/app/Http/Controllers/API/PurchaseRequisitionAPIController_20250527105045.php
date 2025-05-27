<?php

namespace App\Http\Controllers\API;

use App\Events\RequisitionStatusEvent;
use App\Helper\NotificationTestHelper;
use App\Http\Requests\API\UpdatePurchaseRequisitionAPIRequest;
use App\Http\Resources\InitialRequisitionResource;
use App\Http\Resources\PurchaseRequisitionIndexResource;
use App\Models\Department;
use App\Models\Designation;
use App\Models\InitialRequisition;
use App\Models\OneTimeLogin;
use App\Models\PurchaseRequisition;
use App\Models\User;
use App\Notifications\CeoMailNotification;
use App\Notifications\PushNotification;
use App\Notifications\RequisitionStatusNotification;
use App\Notifications\WhatsAppAccountNotification;
use App\Notifications\WhatsAppNotification;
use App\Notifications\WhatsAppStoreNotification;
use App\Repositories\PurchaseRequisitionRepository;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\PurchaseRequisitionResource;
use App\Notifications\WhatsAppDepartmentNotification;
use Illuminate\Support\Facades\DB;
use NotificationChannels\WhatsApp\Component;
use OpenApi\Annotations as OA;

/**
 * Class PurchaseRequisitionController
 */
class PurchaseRequisitionAPIController extends AppBaseController
{
    /** @var  PurchaseRequisitionRepository */
    private $purchaseRequisitionRepository;

    public function __construct(PurchaseRequisitionRepository $purchaseRequisitionRepo)
    {
        $this->purchaseRequisitionRepository = $purchaseRequisitionRepo;

        $this->middleware('auth:sanctum');
        //        $this->middleware('role_or_permission:Super Admin|view_purchase-requisitions', ['only' => ['index']]);
        $this->middleware('role_or_permission:Super Admin|update_purchase-requisitions', ['only' => ['update']]);
        $this->middleware('role_or_permission:Super Admin|create_purchase-requisitions', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_purchase-requisitions', ['only' => ['delete']]);
    }

    /**
     * @OA\Get(
     *      path="/purchase-requisitions",
     *      summary="getPurchaseRequisitionList",
     *      tags={"PurchaseRequisition"},
     *      description="Get all PurchaseRequisitions",
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
     *                  @OA\Items(ref="#/components/schemas/PurchaseRequisition")
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
        $purchaseRequisitions = $this->purchaseRequisitionRepository->allQuery(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        )
            ->when($request->date, function ($q, $date) {
                $q->whereRaw("date(created_at) = '$date'");
            })
            ->when($request->search, function ($r, $v) {
                $r->whereHas('purchaseRequisitionProducts', function ($q) use ($v) {
                    $q->whereHas('product', function ($p) use ($v) {
                        $p->where('title', 'like', "%$v%");
                    });
                })
                    ->orWhere('prf_no', 'like', "%$v%");
            })
            ->where('department_id', auth_department_id())
            ->where('branch_id', auth_branch_id())
            ->latest()
            ->paginate(\request()->per_page ?? 10);

        return response()->json([
            'purchase' =>  PurchaseRequisitionIndexResource::collection($purchaseRequisitions),
            'number_of_rows' => $purchaseRequisitions->total()
        ]);
    }

    /**
     * @OA\Post(
     *      path="/purchase-requisitions",
     *      summary="createPurchaseRequisition",
     *      tags={"PurchaseRequisition"},
     *      description="Create PurchaseRequisition",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/PurchaseRequisition")
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
     *                  ref="#/components/schemas/PurchaseRequisition"
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
        $prfNo = $this->newPRFNO();
        $input = $request->products;

        $input = array_map(function ($item) {
            $item['unit_price'] = (float)$item['price'];
            $item['price'] = (array_key_exists('price', $item) ? (float)$item['price'] : 0) * (float)$item['quantity_to_be_purchase'];
            return $item;
        }, $input);
        $initial_requisition_id = collect($input[0])['initial_requisition_id'];
        $initial_requisition = InitialRequisition::find($initial_requisition_id);
        $inputCollection = collect($input);
        $purchase = [
            'user_id' => auth()->user()->id,
            'prf_no' => $prfNo,
            'branch_id' => $initial_requisition->branch_id,
            'department_id' => $initial_requisition->department_id,
            'initial_requisition_id' => $initial_requisition_id,
            'irf_no' => $initial_requisition->irf_no,
            'ir_no' => $initial_requisition->ir_no,
            'estimated_total_amount' => $inputCollection->sum('price'),
            'received_amount' => 0,
            'payment_type' => $request->payment_type,
            'status' => 0,
        ];
        $purchaseProducts = array_map(function ($item) {
            return [
                'product_id' => $item['product_id'],
                'product_option_id' => $item['product_option_id'],
                'last_purchase_date' => $item['last_purchase_date'] != "" && $item['last_purchase_date'] != null ? Carbon::parse($item['last_purchase_date'])->toDateString() : null,
                'required_quantity' => $item['required_quantity'],
                'available_quantity' => $item['available_quantity'],
                'quantity_to_be_purchase' => $item['quantity_to_be_purchase'],
                'purpose' => $item['purpose'],
                'unit_price' => $item['unit_price'],
            ];
        }, $input);
        $initial_requisition->update([
            'is_purchase_requisition_generated' => 1
        ]);
        /** @var PurchaseRequisition $purchaseRequisition */
        $purchaseRequisition = $this->purchaseRequisitionRepository->create($purchase);

        $purchaseRequisition->approval_status()->create([
            'department_id' => auth_department_id(),
            'department_status' => 1,
        ]);
        $purchaseRequisition->purchaseRequisitionProducts()->createMany($purchaseProducts);
        $purchaseRequisition->prfNOS()->create([
            'prf_no' => $prfNo,
            'total' => $inputCollection->sum('price')
        ]);

        // Send notifications to head of department
        $this->notifyHeadOfDepartment($purchaseRequisition, $request->user()->name, $prfNo);

        return $this->sendResponse(
            new PurchaseRequisitionResource($purchaseRequisition),
            'Purchase Requisition saved successfully'
        );
    }

    /**
     * @OA\Get(
     *      path="/purchase-requisitions/{id}",
     *      summary="getPurchaseRequisitionItem",
     *      tags={"PurchaseRequisition"},
     *      description="Get PurchaseRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of PurchaseRequisition",
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
     *                  ref="#/components/schemas/PurchaseRequisition"
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
        /** @var PurchaseRequisition $purchaseRequisition */
        $purchaseRequisition = $this->purchaseRequisitionRepository->find($id);

        if (empty($purchaseRequisition)) {
            return $this->sendError(
                'Purchase Requisition not found'
            );
        }

        return $this->sendResponse(
            new PurchaseRequisitionResource($purchaseRequisition),
            'Purchase Requisition retrieved successfully'
        );
    }

    /**
     * @OA\Put(
     *      path="/purchase-requisitions/{id}",
     *      summary="updatePurchaseRequisition",
     *      tags={"PurchaseRequisition"},
     *      description="Update PurchaseRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of PurchaseRequisition",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/PurchaseRequisition")
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
     *                  ref="#/components/schemas/PurchaseRequisition"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdatePurchaseRequisitionAPIRequest $request): JsonResponse
    {
        $input = $request->validated();

        /** @var PurchaseRequisition $purchaseRequisition */
        $purchaseRequisition = $this->purchaseRequisitionRepository->find($id);

        if (empty($purchaseRequisition)) {
            return $this->sendError(
                'Purchase Requisition not found'
            );
        }

        $purchaseRequisition = $this->purchaseRequisitionRepository->update($input, $id);

        return $this->sendResponse(
            new PurchaseRequisitionResource($purchaseRequisition),
            'Purchase Requisition updated successfully'
        );
    }

    /**
     * @OA\Delete(
     *      path="/purchase-requisitions/{id}",
     *      summary="deletePurchaseRequisition",
     *      tags={"PurchaseRequisition"},
     *      description="Delete PurchaseRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of PurchaseRequisition",
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
        /** @var PurchaseRequisition $purchaseRequisition */
        $purchaseRequisition = $this->purchaseRequisitionRepository->find($id);

        if (empty($purchaseRequisition)) {
            return $this->sendError(
                'Purchase Requisition not found'
            );
        }
        DB::transaction(function () use ($purchaseRequisition) {
            $initialRequisition = InitialRequisition::find($purchaseRequisition->initial_requisition_id);
            $initialRequisition->update(['is_purchase_requisition_generated' => 0]);

            $purchaseRequisition->purchaseRequisitionProducts()->delete();
            $purchaseRequisition->delete();
        });

        return $this->sendResponse(
            $id,
            'Purchase Requisition deleted successfully'
        );
    }

    public function getInitialRequisition(): JsonResponse
    {
        $initialRequisition = InitialRequisition::query()
            ->whereDoesntHave('purchaseRequisitions')
            ->where('department_id', auth_department_id())
            ->whereHas('approval_status', function ($q) {
                $q->where('department_status', '!=', 3)
                    ->where('accounts_status', '!=', 3)
                    ->where('ceo_status', '!=', 3);
            })
            ->latest()
            ->get();
        return $this->sendResponse(
            InitialRequisitionResource::collection($initialRequisition),
            'Initial Requisitions retrieved successfully'
        );
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function updateProductPrice(Request $request): JsonResponse
    {
        $purchase_requisition_id = $request->purchase_requisition_id;
        $purchase_requisition_product_id = $request->product_id;
        $price = $request->price;
        $requisition = PurchaseRequisition::find($purchase_requisition_id);
        $products = $requisition->purchaseRequisitionProducts()->find($purchase_requisition_product_id);
        if ($request->has('quantity_to_be_purchase')) {
            $products->update([
                'unit_price' => $products->unit_price,
                'quantity_to_be_purchase' => $request->quantity_to_be_purchase,
                'required_quantity' => $request->required_quantity,
            ]);
        } else {
            $products->update(['unit_price' => $price]);
        }

        $totalPrice = $requisition->purchaseRequisitionProducts->map(function ($item) {
            $item->price = (float)$item->unit_price * (float)$item->quantity_to_be_purchase;
            return $item;
        })->sum('price');
        $requisition->update(['estimated_total_amount' => $totalPrice]);
        return $this->sendResponse(
            $products,
            'Product price updated successfully'
        );
    }

    /**
     * @param Request $request
     * @param PurchaseRequisition $requisition
     * @return JsonResponse
     */
    public function changeStatusDepartment(Request $request, PurchaseRequisition $requisition): JsonResponse
    {
        $head_of_department = $requisition->department?->head_of_department;
        $head_of_department_user = User::find($head_of_department);
        if ($head_of_department) {
            $data = [
                'department_id' => $requisition->department_id,
                'notes' => $request->notes
            ];
            $notifiedUsers = [];

            // Process based on approval stage
            switch ($request->stage) {
                case 'accounts':
                    // Process accounts approval
                    $data = $this->processAccountsApproval($request, $requisition, $data);
                    break;
                case 'ceo':
                    // Process CEO approval
                    $data = $this->processCeoApproval($request, $requisition, $data);
                    break;
                default:
                    // Process department approval (default)
                    $data = $this->processDepartmentApproval($request, $requisition, $data);
                    break;
            }

            // Update or create approval status
            $this->updateRequisitionApprovalStatus($requisition, $data);

            // Broadcast event to relevant users
            broadcast(new RequisitionStatusEvent($requisition, [$requisition->user, $request->user()]));

            // Send notifications to relevant users
            $this->sendStatusNotifications($notifiedUsers, $requisition);

            return $this->sendResponse(
                $requisition,
                'Status changed successfully'
            );
        }

        return $this->sendError('Department head not found');
    }

    /**
     * Send notifications to head of department
     *
     * @param PurchaseRequisition $purchaseRequisition
     * @param string $requisitorName
     * @param string $prfNo
     * @return void
     */
    private function notifyHeadOfDepartment(PurchaseRequisition $purchaseRequisition, string $requisitorName, string $prfNo): void
    {
        if (NotificationTestHelper::isTestModeEnabled()) {
            $testUser = NotificationTestHelper::getTestUser();
            $testPhone = NotificationTestHelper::getTestPhone();

            // Send push notification
            $testUser->notify(new PushNotification(
                "A purchase requisition is initiated.",
                "$requisitorName generated a purchase requisition P.R. No. $prfNo. Please approve or reject it."
            ));

            // Send email notification
            $testUser->notify(new RequisitionStatusNotification($purchaseRequisition));

            // Send WhatsApp notifications if mobile number exists
            $this->sendWhatsAppNotification($testUser, $purchaseRequisition, $requisitorName, $prfNo, $testPhone);

            return;
        }

        $department_autority = User::query()
            ->whereHas('departments', function ($q) {
                $q->where('id',  \auth_department_id());
            })
            ->whereHas('roles.permissions', function ($q) {
                $q->where('name', 'approve_department_purchase');
            })
            ->get();

        if (empty($department_autority)) {
            return;
        }

        foreach ($department_autority as $autority) {
            // Send push notification
            $autority->notify(new PushNotification(
                "A purchase requisition is initiated.",
                "$requisitorName generated a purchase requisition P.R. No. $prfNo. Please approve or reject it."
            ));

            // Send email notification
            $autority->notify(new RequisitionStatusNotification($purchaseRequisition));

            // Send WhatsApp notifications if mobile number exists
            if (!empty($autority->mobile_no)) {
                $this->sendWhatsAppNotification($autority, $purchaseRequisition, $requisitorName, $prfNo);
            }
        }

        $user = User::where('email', 'ajr.jahid@gmail.com')->first();
        if ($user) {
            // Also send to testing/backup number
            $this->sendWhatsAppNotification($user, $purchaseRequisition, $requisitorName, $prfNo, '+8801737956549');
        }
    }

    /**
     * Send WhatsApp notification to a user
     *
     * @param User $user The user to notify
     * @param PurchaseRequisition $purchaseRequisition The requisition
     * @param string $requisitorName Name of the requisitor
     * @param string $prfNo Purchase Requisition Number
     * @param string|null $overridePhone Optional phone number to override the user's phone
     * @return void
     */
    private function sendWhatsAppNotification(User $user, PurchaseRequisition $purchaseRequisition, string $requisitorName, string $prfNo, ?string $overridePhone = null): void
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
                Component::text($purchaseRequisition->prf_no),
                Component::quickReplyButton([$purchaseRequisition->id . '_' . $user->id . '_2_department_purchase']),
                Component::quickReplyButton([$purchaseRequisition->id . '_' . $user->id . '_3_department_purchase']),
                Component::urlButton(["/purchase-requisition/$purchaseRequisition->id/whatsapp_view?auth_key=" . $key->auth_key]),
                $phoneNumber
            )
        );
    }

    /**
     * Process accounts approval
     *
     * @param Request $request
     * @param PurchaseRequisition $requisition
     * @param array $data
     * @return array
     */
    private function processAccountsApproval(Request $request, PurchaseRequisition $requisition, array $data): array
    {
        $data['accounts_status'] = $request->status;
        $data['accounts_notes'] = $request->notes;
        $data['accounts_approved_at'] = now();
        $data['accounts_approved_by'] = $request->user()->id;

        if ($request->status == 2) {
            // Approved - notify CEO
            $ceo = $this->findCeoUser();
            if ($ceo) {
                $this->notifyCeoUser($ceo, $requisition, $request->user());
            }
        }

        return $data;
    }

    /**
     * Process CEO approval
     *
     * @param Request $request
     * @param PurchaseRequisition $requisition
     * @param array $data
     * @return array
     */
    private function processCeoApproval(Request $request, PurchaseRequisition $requisition, array $data): array
    {
        $data['ceo_status'] = $request->status;
        $data['ceo_notes'] = $request->notes;
        $data['ceo_approval_date'] = now();
        $data['ceo_approval_by'] = $request->user()->id;

        if ($request->status == 2) {
            // Approved - notify requisitor and store manager
            $storeManager = $this->findStoreManager();

            // Add to notified users
            $notifiedUsers = [$requisition->user];
            if ($storeManager) {
                $notifiedUsers[] = $storeManager;
                // Notify store manager about the approved requisition
                $this->notifyStoreManager($storeManager, $requisition, $request->user());
            }
        }

        return $data;
    }

    /**
     * Process department approval
     *
     * @param Request $request
     * @param PurchaseRequisition $requisition
     * @param array $data
     * @return array
     */
    private function processDepartmentApproval(Request $request, PurchaseRequisition $requisition, array $data): array
    {
        $data['department_status'] = $request->status;
        $data['department_notes'] = $request->notes;
        $data['department_approved_at'] = now();
        $data['department_approved_by'] = \auth()?->user()?->id;

        if ($request->status == 2) {
            // Approved - notify accounts department
            $accountsUsers = $this->findAccountsDepartmentUsers();

            foreach ($accountsUsers as $user) {
                $this->notifyAccountsUser($user, $requisition, $user);
            }
        }

        return $data;
    }

    /**
     * Find CEO user
     *
     * @return User|null
     */
    private function findCeoUser(): ?User
    {
        // Find CEO based on designation
        return User::whereHas('designations', function ($q) {
            $q->where('name', 'CEO')->orWhere('name', 'Chief Executive Officer');
        })->first();
    }

    /**
     * Find store manager
     *
     * @return User|null
     */
    private function findStoreManager(): ?User
    {
        // Find store manager based on designation or permissions
        return User::whereHas('designations', function ($q) {
            $q->where('name', 'Store Manager');
        })->orWhereHas('permissions', function ($q) {
            $q->where('name', 'store-management');
        })->first();
    }

    /**
     * Find accounts department users
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function findAccountsDepartmentUsers()
    {
        // Find users in accounts department who have approval permissions
        return User::whereHas('departments', function ($q) {
            $q->where('name', 'Accounts');
        })->orWhereHas('permissions', function ($q) {
            $q->where('name', 'accounts-approval-purchase');
        })->get();
    }

    /**
     * Update requisition approval status
     *
     * @param PurchaseRequisition $requisition
     * @param array $data
     * @return void
     */
    private function updateRequisitionApprovalStatus(PurchaseRequisition $requisition, array $data): void
    {
        // Update or create approval status
        if ($requisition->approval_status) {
            $requisition->approval_status->update($data);
        } else {
            $requisition->approval_status()->create($data);
        }
    }

    /**
     * Send notifications to CEO
     *
     * @param User $ceo
     * @param PurchaseRequisition $requisition
     * @param User $currentUser
     * @return void
     */
    private function notifyCeoUser(User $ceo, PurchaseRequisition $requisition, User $currentUser): void
    {
        // if (config('app.debug')) {
        //     return;
        // }

        if (NotificationTestHelper::isTestModeEnabled()) {
            $testUser = NotificationTestHelper::getTestUser();
            $testPhone = NotificationTestHelper::getTestPhone();

            $one_time_key = new OneTimeLogin();
            $key = $one_time_key->generate($testUser->id);
            $messageText = Component::text("Requisitor Name: {$requisition->user->name}, P.R. NO.: {$requisition->prf_no}.");
            $viewUrl = Component::urlButton(["/purchase-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
            $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_ceo_purchase']);
            $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_ceo_purchase']);

            // Send email notification using both notification types
            $testUser->notify(new CeoMailNotification($requisition));
            $testUser->notify(new RequisitionStatusNotification($requisition));

            // Send to test phone
            $testUser->notify(new WhatsAppNotification(
                $messageText,
                $testPhone,
                $viewUrl,
                $approveButton,
                $rejectButton
            ));

            return;
        }

        $requisitor_name = $requisition->user;
        $one_time_key = new OneTimeLogin();
        $key = $one_time_key->generate($ceo->id);
        $messageText = Component::text("Requisitor Name: $requisitor_name->name,  P.R. NO.: $requisition->prf_no.");
        $viewUrl = Component::urlButton(["/purchase-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
        $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_ceo_purchase']);
        $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_ceo_purchase']);

        // Send email notification using both notification types
        $ceo->notify(new CeoMailNotification($requisition));
        $ceo->notify(new RequisitionStatusNotification($requisition));

        // Send to CEO's mobile
        if ($ceo->mobile_no) {
            $ceo->notify(new WhatsAppNotification(
                $messageText,
                $ceo->mobile_no,
                $viewUrl,
                $approveButton,
                $rejectButton
            ));
        }

        // Send to backup numbers in non-production environments
        if (!app()->environment('production', 'staging')) {
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
    }

    /**
     * Send notifications to store manager
     *
     * @param User $storeManager
     * @param PurchaseRequisition $requisition
     * @param User $currentUser
     * @return void
     */
    private function notifyStoreManager(User $storeManager, PurchaseRequisition $requisition, User $currentUser): void
    {
        if (config('app.debug')) {
            return;
        }

        if (NotificationTestHelper::isTestModeEnabled()) {
            $testUser = NotificationTestHelper::getTestUser();
            $testPhone = NotificationTestHelper::getTestPhone();

            // Send push notification
            $testUser->notify(new PushNotification(
                "A purchase requisition has been approved.",
                "Purchase requisition P.R. NO. {$requisition->prf_no} for {$requisition->user->name} has been approved by CEO. Please process the order."
            ));

            // Send email notification
            $testUser->notify(new RequisitionStatusNotification($requisition));

            // Generate message for WhatsApp
            $messageBody = Component::text("A purchase requisition P.R. NO. {$requisition->prf_no} for {$requisition->user->name} has been approved by CEO. Please process the order.");

            // Send WhatsApp notification to test phone
            $testUser->notify(new WhatsAppStoreNotification(
                $messageBody,
                $testPhone
            ));

            return;
        }

        // Send push notification
        $storeManager->notify(new PushNotification(
            "A purchase requisition has been approved.",
            "Purchase requisition P.R. NO. {$requisition->prf_no} for {$requisition->user->name} has been approved by CEO. Please process the order."
        ));

        // Send email notification
        $storeManager->notify(new RequisitionStatusNotification($requisition));

        // Skip WhatsApp notifications in debug mode
        if (config('app.debug')) {
            return;
        }

        // Generate message for WhatsApp
        $messageBody = Component::text("A purchase requisition P.R. NO. {$requisition->prf_no} for {$requisition->user->name} has been approved by CEO. Please process the order.");

        // Send to store manager's mobile
        if ($storeManager->mobile_no) {
            $storeManager->notify(new WhatsAppStoreNotification(
                $messageBody,
                $storeManager->mobile_no
            ));
        }

        // Send to backup numbers in non-production environments
        if (!app()->environment('production', 'staging')) {
            $backupNumbers = ['+8801737956549'];

            foreach ($backupNumbers as $number) {
                $storeManager->notify(new WhatsAppStoreNotification(
                    $messageBody,
                    $number
                ));
            }
        }
    }

    /**
     * Send notifications to department user
     *
     * @param User $user
     * @param PurchaseRequisition $requisition
     * @param User $currentUser
     * @return void
     */
    private function notifyDepartmentUser(User $user, PurchaseRequisition $requisition, User $currentUser): void
    {
        if (config('app.debug')) {
            return;
        }

        if (NotificationTestHelper::isTestModeEnabled()) {
            $testUser = NotificationTestHelper::getTestUser();
            $testPhone = NotificationTestHelper::getTestPhone();

            $one_time_key = new OneTimeLogin();
            $key = $one_time_key->generate($testUser->id);
            $nameComponent = Component::text($requisition->user->name);
            $prfComponent = Component::text($requisition->prf_no);
            $viewUrl = Component::urlButton(["/purchase-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
            $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_department_purchase']);
            $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_department_purchase']);

            // Send email notification
            $testUser->notify(new RequisitionStatusNotification($requisition));

            // Send WhatsApp notification to test phone
            $testUser->notify(new WhatsAppDepartmentNotification(
                $nameComponent,
                $prfComponent,
                $approveButton,
                $rejectButton,
                $viewUrl,
                $testPhone
            ));

            return;
        }

        $requisitor_name = $requisition->user;
        $one_time_key = new OneTimeLogin();
        $key = $one_time_key->generate($user->id);
        $nameComponent = Component::text($requisitor_name->name);
        $prfComponent = Component::text($requisition->prf_no);
        $viewUrl = Component::urlButton(["/purchase-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
        $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_department_purchase']);
        $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_department_purchase']);

        // Send email notification
        $user->notify(new RequisitionStatusNotification($requisition));

        // Send to department head's mobile
        if ($user->mobile_no) {
            $user->notify(new WhatsAppDepartmentNotification(
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
                $user->notify(new WhatsAppDepartmentNotification(
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
     * Send notifications to accounts user
     *
     * @param User $user
     * @param PurchaseRequisition $requisition
     * @param User $currentUser
     * @return void
     */
    private function notifyAccountsUser(User $currentUser, PurchaseRequisition $requisition): void
    {
        // if (config('app.debug')) {
        //     return;
        // }

        if (NotificationTestHelper::isTestModeEnabled()) {
            $testUser = NotificationTestHelper::getTestUser();
            $testPhone = NotificationTestHelper::getTestPhone();

            $one_time_key = new OneTimeLogin();
            $key = $one_time_key->generate($testUser->id);
            $departmentComponent = Component::text($requisition->department->name);
            $nameComponent = Component::text($requisition->user->name);
            $prfComponent = Component::text($requisition->prf_no);
            $viewUrl = Component::urlButton(["/purchase-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
            $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_accounts_purchase']);
            $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_accounts_purchase']);

            // Send email notification
            $testUser->notify(new RequisitionStatusNotification($requisition));

            // Send WhatsApp notification to test phone
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

        $requisitor_name = $requisition->user;
        $one_time_key = new OneTimeLogin();
        $key = $one_time_key->generate($currentUser->id);
        $departmentComponent = Component::text($requisition->department->name);
        $nameComponent = Component::text($requisitor_name->name);
        $prfComponent = Component::text($requisition->prf_no);
        $viewUrl = Component::urlButton(["/purchase-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
        $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_accounts_purchase']);
        $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_accounts_purchase']);

        // Send email notification
        $user->notify(new RequisitionStatusNotification($requisition));

        // Send to accounts user's mobile
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
     * Send status notifications to relevant users
     *
     * @param array $users
     * @param PurchaseRequisition $requisition
     * @return void
     */
    private function sendStatusNotifications(array $users, PurchaseRequisition $requisition): void
    {
        if (NotificationTestHelper::isTestModeEnabled()) {
            $testUser = NotificationTestHelper::getTestUser();
            $testPhone = NotificationTestHelper::getTestPhone();

            $requisitor = $requisition->user->name;
            $prfNo = $requisition->prf_no;
            $irfNo = $requisition->irf_no ?? '';

            // Send push notification
            $testUser->notify(new PushNotification(
                "A purchase requisition status has been updated.",
                "$requisitor's purchase requisition P.R. NO. $prfNo against I.R.F. NO. $irfNo has been updated. Please review."
            ));

            // Send requisition status notification
            $testUser->notify(new RequisitionStatusNotification($requisition));

            // Generate one-time login key
            $one_time_key = new OneTimeLogin();
            $key = $one_time_key->generate($testUser->id);

            // Generate WhatsApp components for test mode
            $messageText = Component::text("Requisitor Name: $requisitor, P.R. NO.: $prfNo.");
            $viewUrl = Component::urlButton(["/purchase-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
            $approveButton = Component::quickReplyButton(['test_approve']);
            $rejectButton = Component::quickReplyButton(['test_reject']);

            // Check test notification type
            $isTestingAccountsUser = isset($_ENV['TEST_WHATSAPP_NOTIFICATION_TYPE']) &&
                $_ENV['TEST_WHATSAPP_NOTIFICATION_TYPE'] === 'accounts';
            $isTestingCeoUser = isset($_ENV['TEST_WHATSAPP_NOTIFICATION_TYPE']) &&
                $_ENV['TEST_WHATSAPP_NOTIFICATION_TYPE'] === 'ceo';

            if ($isTestingAccountsUser) {
                // For accounts user, use WhatsAppAccountNotification
                $departmentComponent = Component::text($requisition->department->name);
                $nameComponent = Component::text($requisitor);
                $prfNoComponent = Component::text($prfNo);

                $testUser->notify(new WhatsAppAccountNotification(
                    $departmentComponent,
                    $nameComponent,
                    $prfNoComponent,
                    $approveButton,
                    $rejectButton,
                    $viewUrl,
                    $testPhone
                ));
            } elseif ($isTestingCeoUser) {
                // For CEO user, use WhatsAppNotification
                $testUser->notify(new WhatsAppNotification(
                    $messageText,
                    $testPhone,
                    $viewUrl,
                    $approveButton,
                    $rejectButton
                ));
            } else {
                // For department users, use WhatsAppDepartmentNotification
                $nameComponent = Component::text($requisitor);
                $prfNoComponent = Component::text($prfNo);

                $testUser->notify(new WhatsAppDepartmentNotification(
                    $nameComponent,
                    $prfNoComponent,
                    $approveButton,
                    $rejectButton,
                    $viewUrl,
                    $testPhone
                ));
            }

            return;
        }

        foreach ($users as $user) {
            if (!$user) {
                continue;
            }

            $requisitor = $requisition->user->name;
            $prfNo = $requisition->prf_no;
            $irfNo = $requisition->irf_no ?? '';

            // Send push notification
            $user->notify(new PushNotification(
                "A purchase requisition status has been updated.",
                "$requisitor's purchase requisition P.R. NO. $prfNo against I.R.F. NO. $irfNo has been updated. Please review."
            ));

            // Send requisition status notification
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
            $viewUrl = Component::urlButton(["/purchase-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);

            // Determine user type and set appropriate notification
            $isAccountsUser = $user->default_department_name === 'Accounts' || $user->hasPermissionTo('accounts-approval-purchase');
            $isCeoUser = $user->hasRole('CEO');

            if ($isAccountsUser) {
                // Accounts approval buttons
                $approveButton = Component::quickReplyButton([$requisition->id . '_' . $user->id . '_2_accounts_purchase']);
                $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $user->id . '_3_accounts_purchase']);
                $departmentComponent = Component::text($requisition->department->name);
                $nameComponent = Component::text($requisitor);
                $prfNoComponent = Component::text($prfNo);

                $user->notify(new WhatsAppAccountNotification(
                    $departmentComponent,
                    $nameComponent,
                    $prfNoComponent,
                    $approveButton,
                    $rejectButton,
                    $viewUrl,
                    $user->mobile_no
                ));
            } elseif ($isCeoUser) {
                // CEO notification with WhatsAppNotification
                $approveButton = Component::quickReplyButton([$requisition->id . '_' . $user->id . '_2_status_update']);
                $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $user->id . '_3_status_update']);

                $user->notify(new WhatsAppNotification(
                    $messageText,
                    $user->mobile_no,
                    $viewUrl,
                    $approveButton,
                    $rejectButton
                ));
            } else {
                // Department notification with WhatsAppDepartmentNotification
                $approveButton = Component::quickReplyButton([$requisition->id . '_' . $user->id . '_2_status_update']);
                $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $user->id . '_3_status_update']);
                $nameComponent = Component::text($requisitor);
                $prfNoComponent = Component::text($prfNo);

                $user->notify(new WhatsAppDepartmentNotification(
                    $nameComponent,
                    $prfNoComponent,
                    $approveButton,
                    $rejectButton,
                    $viewUrl,
                    $user->mobile_no
                ));
            }
        }
    }
}
