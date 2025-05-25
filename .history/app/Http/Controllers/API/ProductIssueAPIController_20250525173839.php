<?php

namespace App\Http\Controllers\API;

use App\Http\Resources\ProductIssueItemsResource;
use App\Models\ProductIssue;
use App\Models\ProductIssueItems;
use App\Models\ProductOption;
use App\Models\Purchase;
use App\Models\User;
use App\Repositories\ProductIssueRepository;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ProductIssueResource;
use App\Models\Department;
use App\Models\OneTimeLogin;
use App\Notifications\WhatsAppIssueButtonNotification;
use App\Notifications\WhatsAppIssueNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use NotificationChannels\WhatsApp\Component;
use NotificationChannels\WhatsApp\Component\QuickReplyButton;
use OpenApi\Annotations as OA;
use Ramsey\Uuid\Nonstandard\Uuid;

/**
 * Class ProductIssueController
 */

class ProductIssueAPIController extends AppBaseController
{
    /** @var  ProductIssueRepository */
    private $productIssueRepository;

    public function __construct(ProductIssueRepository $productIssueRepo)
    {
        $this->productIssueRepository = $productIssueRepo;

        $this->middleware('auth:sanctum');
        //        $this->middleware('role_or_permission:Super Admin|view_product-issues', ['only' => ['index']]);
        $this->middleware('role_or_permission:Super Admin|update_product-issues', ['only' => ['update']]);
        $this->middleware('role_or_permission:Super Admin|create_product-issues', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_product-issues', ['only' => ['delete']]);
        $this->middleware('role_or_permission:Super Admin|Store Manager|update_product-issues', ['only' => ['updateQuantity']]);
    }

    /**
     * @OA\Get(
     *      path="/product-issues",
     *      summary="getProductIssueList",
     *      tags={"ProductIssue"},
     *      description="Get all ProductIssues",
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
     *                  @OA\Items(ref="#/components/schemas/ProductIssue")
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
        $storeManager = $request->user()->hasRole('Store Manager') ? 'TRUE' : 'FALSE';

        $productIssues = $this->productIssueRepository->allQuery(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        )
            ->where(function ($q) use ($request, $storeManager) {
                $q->where(function ($q) use ($request) {
                    $q->whereHas('receiverBranch', function ($branch) use ($request) {
                        $branch->when($request->branch_id, function ($q) use ($request) {
                            $q->where('id', $request->branch_id);
                        }, function ($q) {
                            $q->where('id', auth_branch_id());
                        });
                    })->whereHas('receiverDepartment', function ($department) use ($request) {
                        $department->when($request->department_id, function ($q, $d) {
                            $q->where('id', $d);
                        }, function ($q) {
                            $q->where('id', auth_department_id());
                        });
                    });
                })
                    ->orWhere(function ($q) use ($storeManager) {
                        $q->whereRaw("true = $storeManager")
                            ->where('department_status', 1);
                    });
            })
            ->when($request->issuer_department_id, function ($q, $v) {
                $q->where('issuer_department_id', $v);
            })

            ->when($request->search, function ($q, $v) {
                $q->whereHas('items', function ($q) use ($v) {
                    $q->whereHas('product', function ($r) use ($v) {
                        $r->where('title', 'like', "%$v%");
                    });
                })->orWhere('id', 'like', "%$v%");
            })
            ->when($request->dateRange, function ($q, $v) {
                $dateRange = json_decode($v);
                $q->whereRaw("date(created_at) between '$dateRange->startDate' and '$dateRange->endDate'");
            })
            ->latest()
            ->paginate();

        return response()->json([
            'product_issue' =>  ProductIssueResource::collection($productIssues),
            'number_of_rows' => $productIssues->total()
        ]);
    }

    /**
     * @OA\Post(
     *      path="/product-issues",
     *      summary="createProductIssue",
     *      tags={"ProductIssue"},
     *      description="Create ProductIssue",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/ProductIssue")
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
     *                  ref="#/components/schemas/ProductIssue"
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
        $uuid = Uuid::uuid4();

        $productIssue = new ProductIssue();
        if (!empty($input)) {
            DB::transaction(function () use ($uuid, $request, $input) {
                $productIssue = ProductIssue::create([
                    'uuid' => $uuid,
                    'issuer_id' => $request->user()->id,
                    'issuer_branch_id' => auth_branch_id(),
                    'issuer_department_id' => auth_department_id(),
                    'receiver_id' => $input[0]['receiver_id'],
                    'receiver_branch_id' => auth_branch_id(),
                    'receiver_department_id' => auth_department_id(),
                ]);

                $input = array_map(function ($it) use ($uuid, $productIssue) {
                    $it['uuid'] = $uuid;
                    $it['product_issue_id'] = $productIssue->id;
                    $it['use_date'] =   Carbon::parse($it['issue_time'])->toDateTimeString();
                    return $it;
                }, $input);

                $productIssue->items()->createMany($input);

                // $head_of_department = User::find(Department::find(auth_department_id())->head_of_department);
                $requisitor_name = $request->user()->name;

                $department_autority = User::query()
                    ->whereHas('branches', function ($q) use ($productIssue) {
                        $q->where('id',  auth_branch_id());
                    })
                    // ->whereHas('permissions', function ($q) {
                    //     $q->where('name', 'approve_department_issue');
                    // })
                    ->with('permissions')
                    ->get();
                Log::info('department_authority', [
                    "authority" => $department_autority,
                    "requisitor_name" => $requisitor_name,
                    "branch_id" => auth_branch_id(),

                ]);
                // $requisition->id . '_' . $requisitor_name->id . '_2_ceo_purchase'

                // foreach ($department_autority as $authority) {
                //     if (!empty($authority->mobile_no)) {
                //         $no = auth_department_name() . '/' . $productIssue->id;
                //         $one_time_key = new OneTimeLogin();
                //         $key = $one_time_key->generate($authority->id);
                //         $authority->notify(new WhatsAppIssueButtonNotification(
                //             Component::text($requisitor_name),
                //             Component::text($no),
                //             Component::quickReplyButton([$productIssue->id . '_' . $authority->id . '_1_department_issue']),
                //             Component::quickReplyButton([$productIssue->id . '_' . $authority->id . '_2_department_issue']),
                //             Component::urlButton(["/issue/$uuid/whatsapp_view?auth_key=$key->auth_key"]),
                //             $authority->mobile_no
                //         ));
                //         $request->user()->notify(new WhatsAppIssueButtonNotification(
                //             Component::text($requisitor_name),
                //             Component::text($no),
                //             Component::quickReplyButton([$productIssue->id . '_' . $authority->id . '_1_department_issue']),
                //             Component::quickReplyButton([$productIssue->id . '_' . $authority->id . '_2_department_issue']),
                //             Component::urlButton(["/issue/$uuid/whatsapp_view?auth_key=$key->auth_key"]),
                //             '+8801737956549'
                //         ));
                //     }
                // }
            }, 2);
        }
        return $this->sendResponse(
            new ProductIssueResource($productIssue),
            __('messages.saved', ['model' => __('models/productIssues.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/product-issues/{id}",
     *      summary="getProductIssueItem",
     *      tags={"ProductIssue"},
     *      description="Get ProductIssue",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of ProductIssue",
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
     *                  ref="#/components/schemas/ProductIssue"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function show($uuid): JsonResponse
    {
        /** @var ProductIssue $productIssue */
        $productIssue = $this->productIssueRepository->allQuery()->where('uuid', $uuid)->first();

        if (empty($productIssue)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/productIssues.singular')])
            );
        }

        return $this->sendResponse(
            new ProductIssueResource($productIssue),
            __('messages.retrieved', ['model' => __('models/productIssues.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/product-issues/{id}",
     *      summary="updateProductIssue",
     *      tags={"ProductIssue"},
     *      description="Update ProductIssue",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of ProductIssue",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/ProductIssue")
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
     *                  ref="#/components/schemas/ProductIssue"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($uuid, Request $request): JsonResponse
    {
        $input = $request->all();

        /** @var ProductIssue $productIssues */
        $productIssues = ProductIssue::where('uuid', $uuid)->first();

        if (empty($productIssues)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/productIssues.singular')])
            );
        }
        if ($request->has('department')) {
            switch ($request->department) {
                case 'both':
                    $input['department_status'] = $request->status;
                    $input['department_approved_by'] = $request->user()->id;
                    $input['department_approved_at'] = now();
                    $input['store_status'] = $request->status;;
                    $input['store_approved_by'] = $request->user()->id;
                    $input['store_approved_at'] = now();
                    break;
                case 'department':
                    $input['department_status'] = $request->status;;
                    $input['department_approved_by'] = $request->user()->id;
                    $input['department_approved_at'] = now();
                    break;
                case 'store':
                    $input['store_status'] = $request->status;;
                    $input['store_approved_by'] = $request->user()->id;
                    $input['store_approved_at'] = now();
                    break;
            };
        }
        unset($input['department']);
        unset($input['status']);

        DB::transaction(function () use ($productIssues, $input, $uuid, $request) {
            try {
                // TODO check is it store person or not if yes then reduce the stock;
                foreach ($productIssues->items as $productIssue) {

                    $productOption = ProductOption::find($productIssue->product_option_id);
                    Log::info($productIssues->store_status);

                    if ($request->user()->hasRole('Store Manager') && $request->status == 1 && (float)$productIssue->quantity <= (float)$productOption->stock && $productIssues->store_status != 1 && $productIssues->department_status == 1) {

                        if ($productIssue->balance_before_issue != null && $productIssue->balance_after_issue != null) {
                            continue;
                        }

                        $productIssue->update([
                            'balance_before_issue' => $productOption->stock,
                            'balance_after_issue' => (float)$productOption->stock - (float)$productIssue->quantity
                        ]);

                        $productOption->stock = (float)$productOption->stock - (float)$productIssue->quantity;
                        $productOption->save();

                        $purchase_history = Purchase::query()
                            ->where('product_id', $productIssue->product_id)
                            ->where('product_option_id', $productIssue->product_option_id)
                            ->where('available_qty', '>', 0)
                            ->oldest()
                            ->get();

                        $request_quantity = (float)$productIssue->quantity;
                        $qty = $request_quantity;
                        $purchase_log = [];
                        foreach ($purchase_history as $purchase) {
                            if ($qty > 0) {
                                $purchase_log[] = [
                                    'product_id' => $purchase->product_id,
                                    'product_option_id' => $purchase->product_option_id,
                                    'purchase_id' => $purchase->id,
                                    'qty' => min($request_quantity, $purchase->available_qty),
                                    'unit_price' => $purchase->unit_price,
                                    'total_price' => min($request_quantity, $purchase->available_qty) * $purchase->unit_price,
                                    'purchase_date' => $purchase->purchase_date,
                                ];
                                $qty = $qty <= $purchase->available_qty ? 0 : $qty - $purchase->available_qty;
                                $purchase->available_qty = $request_quantity <= $purchase->available_qty ? $purchase->available_qty - $request_quantity : 0;
                                $request_quantity = $qty;
                                $purchase->save();
                                continue;
                            } else {
                                break;
                            }
                        }
                        $productIssue->rateLog()->createMany($purchase_log);
                    } else if ($request->user()->hasRole('Store Manager') && $request->status == 1 && $productIssues->department_status == 1) {
                        $product_title = $productOption?->product?->title;
                        throw new \Exception("Kindly ensure that the product '$product_title' is updated. Current balance- $productOption->stock. Request Quantity- $productIssue->quantity", 413);
                    }
                }
                $productIssues->update($input);
            } catch (\PDOException $exception) {
                Log::error('product issue update error', (array)$exception);
            }
        }, 2);
        return $this->sendResponse(
            new ProductIssueResource($productIssues),
            __('messages.updated', ['model' => __('models/productIssues.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/product-issues/{id}",
     *      summary="deleteProductIssue",
     *      tags={"ProductIssue"},
     *      description="Delete ProductIssue",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of ProductIssue",
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
    public function destroy($uuid): JsonResponse
    {
        /** @var ProductIssue $productIssues */
        $productIssues = ProductIssue::query()
            ->with('items')
            ->where('uuid', $uuid)
            ->first();
        if (empty($productIssues)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/productIssues.singular')])
            );
        }

        DB::transaction(function () use ($productIssues, $uuid) {
            try {
                if ($productIssues->store_status == 1) {
                    foreach ($productIssues->items as $item) {
                        $productOptionId = $item->product_option_id;
                        $quantity = $item->quantity;

                        if (!empty($item)) {
                            $productOption = ProductOption::find($productOptionId);
                            $productOption->stock = (float)$productOption->stock + (float)$quantity;
                            $productOption->save();
                            foreach ($item->rateLog as $rl) {
                                $purchase = Purchase::find($rl->purchase_id);
                                $purchase->available_qty = $purchase->available_qty + $rl->qty;
                                $purchase->save();
                            }
                            $item->rateLog()->delete();
                        }
                    }
                }
                $productIssues->items()->delete();
                $productIssues->delete();
            } catch (\PDOException $exception) {
                Log::error('product issue update error', $exception->getMessage());
            }
        }, 2);

        return $this->sendResponse(
            $uuid,
            __('messages.deleted', ['model' => __('models/productIssues.singular')])
        );
    }

    /**
     * @param $id
     * @param Request $request
     * @return JsonResponse
     *
     */

    public function updateQuantity($id, Request $request): JsonResponse
    {
        $issue =  ProductIssueItems::find($id);
        if (empty($issue)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/productIssues.singular')])
            );
        }
        DB::transaction(function () use ($request, $id, $issue) {
            try {

                if ($request->has('quantity')) {
                    if ($issue->productIssue->store_status == 1) {
                        $productOption = ProductOption::find($issue->product_option_id);

                        $productOption->stock = $issue->balance_before_issue - $request->quantity;
                        $productOption->save();
                        $issue_rate_log = $issue->rateLog;
                        foreach ($issue_rate_log as $rl) {
                            $purchase = Purchase::find($rl->purchase_id);
                            $purchase->available_qty = $purchase->available_qty + $rl->qty;
                            $purchase->save();
                        }
                        $purchase_history = Purchase::query()
                            ->where('product_id', $issue->product_id)
                            ->where('product_option_id', $issue->product_option_id)
                            ->where('available_qty', '>', 0)
                            ->oldest()
                            ->get();

                        $qty = $request->quantity;
                        $purchase_log = [];
                        $request_quantity = (float)$request->quantity;
                        foreach ($purchase_history as $purchase) {
                            if ($qty > 0) {
                                $purchase_log[] = [
                                    'product_id' => $purchase->product_id,
                                    'product_option_id' => $purchase->product_option_id,
                                    'purchase_id' => $purchase->id,
                                    'qty' => min($request_quantity, $purchase->available_qty),
                                    'unit_price' => $purchase->unit_price,
                                    'total_price' => min($request_quantity, $purchase->available_qty) * $purchase->unit_price,
                                    'purchase_date' => $purchase->purchase_date,
                                ];
                                $qty = $qty <= $purchase->available_qty ? 0 : $qty - $purchase->available_qty;
                                $purchase->available_qty = $request_quantity <= $purchase->available_qty ? $purchase->available_qty - $request_quantity : 0;
                                $request_quantity = $qty;
                                $purchase->save();
                                continue;
                            } else {
                                break;
                            }
                        }
                        $issue->rateLog()->delete();
                        $issue->rateLog()->createMany($purchase_log);
                        $issue->update([
                            'quantity' => $request->quantity,
                            'balance_before_issue' => $issue->balance_before_issue,
                            'balance_after_issue' => (float)$issue->balance_before_issue - (float)$request->quantity
                        ]);
                    } else {
                        $issue->update([
                            'quantity' => $request->quantity,
                        ]);
                    }
                }
            } catch (\PDOException $exception) {
            }
        });

        return $this->sendResponse(
            new ProductIssueItemsResource($issue),
            __('messages.updated', ['model' => __('models/productIssues.singular')])
        );
    }
}
