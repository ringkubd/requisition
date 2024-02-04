<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreatePurchaseAPIRequest;
use App\Http\Requests\API\UpdatePurchaseAPIRequest;
use App\Http\Resources\PurchaseRequisitionResource;
use App\Http\Resources\SupplierResource;
use App\Models\ProductOption;
use App\Models\Purchase;
use App\Models\PurchaseRequisition;
use App\Models\PurchaseRequisitionProduct;
use App\Models\Supplier;
use App\Repositories\PurchaseRepository;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\PurchaseResource;
use Illuminate\Support\Facades\DB;
use OpenApi\Annotations as OA;
use Ramsey\Uuid\Nonstandard\Uuid;

/**
 * Class PurchaseController
 */

class PurchaseAPIController extends AppBaseController
{
    /** @var  PurchaseRepository */
    private $purchaseRepository;

    public function __construct(PurchaseRepository $purchaseRepo)
    {
        $this->purchaseRepository = $purchaseRepo;

        $this->middleware('auth:sanctum');
//        $this->middleware('role_or_permission:Super Admin|view_purchases', ['only' => ['index']]);
        $this->middleware('role_or_permission:Super Admin|update_purchases', ['only' => ['update']]);
        $this->middleware('role_or_permission:Super Admin|create_purchases', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_purchases', ['only' => ['delete']]);
        $this->middleware('role_or_permission:Super Admin|view_purchases|update_purchases|create_purchases|delete_purchases', ['only' => ['suppliers', 'purchaseRequisition']]);
    }

    /**
     * @OA\Get(
     *      path="/purchases",
     *      summary="getPurchaseList",
     *      tags={"Purchase"},
     *      description="Get all Purchases",
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
     *                  @OA\Items(ref="#/components/schemas/Purchase")
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
        $purchases = $this->purchaseRepository->allQuery(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        )
            ->when($request->department_id, function ($q, $v){
                $q->whereHas('purchaseRequisition', function ($r) use ($v){
                    $r->where('department_id', $v);
                });
            })
            ->when($request->dateRange, function ($q, $v){
                $dateRange = json_decode($v);
                $q->whereRaw("date(purchase_date) between '$dateRange->startDate' and '$dateRange->endDate'");
            })
            ->when($request->search, function ($q, $v){
                $q->whereHas('product', function ($b) use ($v){
                    $b->where('title', "like", "%$v%");
                });
            })
            ->latest('purchase_date')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'data' => PurchaseResource::collection($purchases),
            'total_rows' => $purchases->total()
        ]);
    }

    /**
     * @OA\Post(
     *      path="/purchases",
     *      summary="createPurchase",
     *      tags={"Purchase"},
     *      description="Create Purchase",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Purchase")
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
     *                  ref="#/components/schemas/Purchase"
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
        DB::transaction(function () use ($request){
            $input = $request->all();
            $uuid = Uuid::uuid4();
            foreach ($input as $item){
                $item['user_id'] = $request->user()->id;
                $item['uuid'] = $uuid;
                $product_option = ProductOption::query()->find($item['product_option_id']);
                $item['old_balance'] = $product_option->stock;
                $stock = (float)$item['qty'] + $product_option->stock;
                $update = $product_option->update(['stock' => $stock]);
                $purchase = $this->purchaseRepository->create($item);
                $purchaseRequisitionProduct = PurchaseRequisitionProduct::query()
                    ->where('purchase_requisition_id', $item['purchase_requisition_id'])
                    ->where('product_id', $item['product_id'])
                    ->where('product_option_id', $item['product_option_id'])
                    ->first();
                $purchaseRequisitionProduct->update(['actual_purchase' => $purchaseRequisitionProduct->actual_purchase + $item['qty']]);
            }

        });

        return $this->sendResponse(
            $request->all(),
            __('messages.saved', ['model' => __('models/purchases.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/purchases/{id}",
     *      summary="getPurchaseItem",
     *      tags={"Purchase"},
     *      description="Get Purchase",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Purchase",
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
     *                  ref="#/components/schemas/Purchase"
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
        /** @var Purchase $purchase */
        $purchase = $this->purchaseRepository->find($id);

        if (empty($purchase)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/purchases.singular')])
            );
        }

        return $this->sendResponse(
            new PurchaseResource($purchase),
            __('messages.retrieved', ['model' => __('models/purchases.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/purchases/{id}",
     *      summary="updatePurchase",
     *      tags={"Purchase"},
     *      description="Update Purchase",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Purchase",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Purchase")
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
     *                  ref="#/components/schemas/Purchase"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdatePurchaseAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Purchase $purchase */
        $purchase = $this->purchaseRepository->find($id);
        $oldQty = $purchase->qty;
        if (empty($purchase)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/purchases.singular')])
            );
        }

        $purchase = $this->purchaseRepository->update($input, $id);

        if ($purchase){
            $product_option = ProductOption::query()
                ->find($input['product_option_id']);
            $product_option->unit_price = $input['unit_price'];
            $product_option->stock = (float)$input['qty'] + $product_option->stock - $oldQty;
            $product_option->save();
        }

        return $this->sendResponse(
            new PurchaseResource($purchase),
            __('messages.updated', ['model' => __('models/purchases.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/purchases/{id}",
     *      summary="deletePurchase",
     *      tags={"Purchase"},
     *      description="Delete Purchase",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Purchase",
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
        /** @var Purchase $purchase */
        $purchase = $this->purchaseRepository->find($id);

        if (empty($purchase)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/purchases.singular')])
            );
        }

        if ($purchase->delete()){
            $product_option = ProductOption::query()
                ->find($purchase->product_option_id);
            $product_option->stock = $product_option->stock - $purchase->qty;
            $product_option->save();

            $purchaseRequisitionProduct = PurchaseRequisitionProduct::query()
                ->where('purchase_requisition_id', $purchase->purchase_requisition_id)
                ->where('product_id', $purchase->product_id)
                ->where('product_option_id', $purchase->product_option_id)
                ->first();
            $purchaseRequisitionProduct->update(['actual_purchase' => $purchaseRequisitionProduct->actual_purchase - $purchase->qty]);
        }
        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/purchases.singular')])
        );
    }

    /**
     * Extra Options
     */
    /**
     * @param Request $request
     * @return JsonResponse
     */

    public function suppliers(Request $request){
        $start = ((int)$request->page - 1) * 10;
        $end = ((int)$request->page) * 10;

        $suppliers = SupplierResource::collection(Supplier::query()
            ->where('name', 'like', "%$request->search%")
            ->skip($start)
            ->limit($end)
            ->get());

        return $this->sendResponse(
            $suppliers,
            __('messages.retrieved', ['model' => __('models/initialRequisitions.plural')])
        );
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function purchaseRequisition(Request $request){
        $start = ((int)$request->page - 1) * 10;
        $end = ((int)$request->page) * 10;

        $day_before_15_days = Carbon::now()->subDays(30)->toDateString();
        $purchase_requisition = PurchaseRequisitionResource::collection(PurchaseRequisition::query()
            ->where(function ($q) use($request, $day_before_15_days){
                $q->where('irf_no', 'like', "%$request->search%")
                    ->orWhere('ir_no', 'like', "%$request->search%")
                    ->orWhere('prf_no', 'like', "%$request->search%")
                    ->whereRaw("date(created_at) <= '$day_before_15_days'");
            })

            ->with(['purchaseRequisitionProducts' => function ($q) {
                $q->whereRaw('`actual_purchase` < `quantity_to_be_purchase`');
            }])
            ->whereHas('purchaseRequisitionProducts', function ($q) {
                $q->whereRaw('actual_purchase < quantity_to_be_purchase');
            })
            ->whereHas('approval_status', function ($q){
                $q->where('ceo_status', 2);
            })
            ->where('branch_id', auth_branch_id())
            ->skip($start)
            ->limit($end)
            ->latest('purchase_requisitions.created_at')
            ->get());

        return $this->sendResponse(
            $purchase_requisition,
            __('messages.retrieved', ['model' => __('models/initialRequisitions.plural')])
        );
    }
}
