<?php

namespace App\Http\Controllers\API;

use App\Events\RequisitionStatusEvent;
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
use App\Notifications\WhatsAppCommonNotification;
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

        $requisitor_name = $request->user()->name;
        $head_of_department = User::find(Department::find(auth_department_id())->head_of_department);
        // Send notifications to head of department
        $this->notifyHeadOfDepartment($purchaseRequisition, $request->user()->name, $prfNo);

        return $this->sendResponse(
            new PurchaseRequisitionResource($purchaseRequisition),
            __('messages.saved', ['model' => __('models/purchaseRequisitions.singular')])
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
                __('messages.not_found', ['model' => __('models/purchaseRequisitions.singular')])
            );
        }

        return $this->sendResponse(
            new PurchaseRequisitionResource($purchaseRequisition),
            __('messages.retrieved', ['model' => __('models/purchaseRequisitions.singular')])
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
        $input = $request->all();

        /** @var PurchaseRequisition $purchaseRequisition */
        $purchaseRequisition = $this->purchaseRequisitionRepository->find($id);

        if (empty($purchaseRequisition)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/purchaseRequisitions.singular')])
            );
        }

        $purchaseRequisition = $this->purchaseRequisitionRepository->update($input, $id);

        return $this->sendResponse(
            new PurchaseRequisitionResource($purchaseRequisition),
            __('messages.updated', ['model' => __('models/purchaseRequisitions.singular')])
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
                __('messages.not_found', ['model' => __('models/purchaseRequisitions.singular')])
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
            __('messages.deleted', ['model' => __('models/purchaseRequisitions.singular')])
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
            __('messages.retrieved', ['model' => __('models/initialRequisitions.plural')])
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
            __('messages.retrieved', ['model' => __('models/initialRequisitions.plural')])
        );
    }

    /**
     * @param Request $request
     * @param PurchaseRequisition $requisition
     * @return JsonResponse|void
     */

    public function changeStatusDepartment(Request $request, PurchaseRequisition $requisition)
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
                    $notifiedUsers = $this->processAccountsApproval($request, $requisition, $data);
                    break;

                case 'ceo':
                    $notifiedUsers = $this->processCeoApproval($request, $requisition, $data);
                    break;

                default:
                    $notifiedUsers = $this->processDepartmentApproval($request, $requisition, $data);
                    break;
            }

            // Update or create approval status
            $this->updateRequisitionApprovalStatus($requisition, $data);

            // Broadcast event to relevant users
            broadcast(new RequisitionStatusEvent(
                new PurchaseRequisitionResource($requisition),
                [$requisition->user, $request->user()]
            ));

            // Send notifications to relevant users
            $this->sendStatusNotifications($notifiedUsers, $requisition);

            return $this->sendResponse(
                new PurchaseRequisitionResource($requisition),
                __('messages.retrieved', ['model' => __('models/initialRequisitionProducts.plural')])
            );
        }
    }

    /**
     * Send notifications to head of department
     *
     * @param PurchaseRequisition $purchaseRequisition
     * @param string $requisitorName
     * @param string $prfNo
     * @return void
     */
    private function notifyHeadOfDepartment($purchaseRequisition, string $requisitorName, string $prfNo): void
    {
        $department_autority = User::query()
            ->whereHas('branches', function ($q) use ($purchaseRequisition) {
                $q->where('id',  $purchaseRequisition->branch_id);
            })
            ->whereHas('permissions', function ($q) {
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

            // Send WhatsApp notifications if mobile number exists
            if (!empty($autority->mobile_no)) {
                $this->sendWhatsAppNotification($autority, $purchaseRequisition, $requisitorName, $prfNo);
            }
        }


        $user = User::where('email', 'ajr.jahid@gmail.com')->first();
        // Also send to testing/backup number
        $this->sendWhatsAppNotification($user, $purchaseRequisition, $requisitorName, $prfNo, '+8801737956549');
    }

    /**
     * Send WhatsApp notification to a user
     *
     * @param User $user
     * @param PurchaseRequisition $purchaseRequisition
     * @param string $requisitorName
     * @param string $prfNo
     * @param string|null $overridePhone
     * @return void
     */
    private function sendWhatsAppNotification(User $user, PurchaseRequisition $purchaseRequisition, string $requisitorName, string $prfNo, ?string $overridePhone = null): void
    {
        $phoneNumber = $overridePhone ?? $user->mobile_no;

        if (empty($phoneNumber)) {
            return;
        }

        // // Send common notification
        // $user->notify(new WhatsAppCommonNotification(
        //     Component::text("Requisitor Name: $requisitorName,  P.R. NO.: $prfNo."),
        //     $phoneNumber
        // ));

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
     * Process accounts approval stage
     *
     * @param Request $request
     * @param PurchaseRequisition $requisition
     * @param array &$data
     * @return array
     */
    private function processAccountsApproval(Request $request, PurchaseRequisition $requisition, array &$data): array
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
                $this->notifyCeoUser($ceo, $requisition, $request->user());
            }
        }

        return $notifiedUsers;
    }

    /**
     * Process CEO approval stage
     *
     * @param Request $request
     * @param PurchaseRequisition $requisition
     * @param array &$data
     * @return array
     */
    private function processCeoApproval(Request $request, PurchaseRequisition $requisition, array &$data): array
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
                if ($user->hasPermissionTo('accounts-approval-purchase')) {
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
     * @param PurchaseRequisition $requisition
     * @param array &$data
     * @return array
     */
    private function processDepartmentApproval(Request $request, PurchaseRequisition $requisition, array &$data): array
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
                if ($user->hasPermissionTo('accounts-approval-purchase')) {
                    $notifiedUsers[] = $user;
                }
            }
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
     * @param PurchaseRequisition $requisition
     * @param array $data
     * @return void
     */
    private function updateRequisitionApprovalStatus(PurchaseRequisition $requisition, array $data): void
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
     * @param PurchaseRequisition $requisition
     * @param User $currentUser
     * @return void
     */
    private function notifyCeoUser(User $ceo, PurchaseRequisition $requisition, User $currentUser): void
    {
        if (config('app.debug')) {
            return;
        }

        $requisitor_name = $requisition->user;
        $one_time_key = new OneTimeLogin();
        $key = $one_time_key->generate($ceo->id);
        $messageText = Component::text("Requisitor Name: $requisitor_name->name,  P.R. NO.: $requisition->prf_no.");
        $viewUrl = Component::urlButton(["/purchase-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
        $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_ceo_purchase']);
        $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_ceo_purchase']);

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

        $requisitor_name = $requisition->user;
        $one_time_key = new OneTimeLogin();
        $key = $one_time_key->generate($user->id);
        $messageText = Component::text("Requisitor Name: $requisitor_name->name,  P.R. NO.: $requisition->prf_no.");
        $viewUrl = Component::urlButton(["/purchase-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
        $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_department_purchase']);
        $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_department_purchase']);

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
     * @param PurchaseRequisition $requisition
     * @param User $currentUser
     * @return void
     */
    private function notifyAccountsUser(User $user, PurchaseRequisition $requisition, User $currentUser): void
    {
        if (config('app.debug')) {
            return;
        }

        $requisitor_name = $requisition->user;
        $one_time_key = new OneTimeLogin();
        $key = $one_time_key->generate($user->id);
        $messageText = Component::text("Requisitor Name: $requisitor_name->name,  P.R. NO.: $requisition->prf_no.");
        $viewUrl = Component::urlButton(["/purchase-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key"]);
        $approveButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_2_accounts_purchase']);
        $rejectButton = Component::quickReplyButton([$requisition->id . '_' . $currentUser->id . '_3_accounts_purchase']);

        // Send to accounts user's mobile
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
}
