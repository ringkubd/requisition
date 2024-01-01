<?php

namespace App\Http\Controllers\API;

use App\Models\ProductIssue;
use App\Models\ProductOption;
use App\Models\Purchase;
use App\Models\User;
use App\Repositories\ProductIssueRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ProductIssueResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
        $this->middleware('role_or_permission:Super Admin|update_product-issues', ['only' => ['show', 'update']]);
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
            ->where(function ($q) use($request){
                $q->whereHas('receiverBranch', function($branch) use ($request){
                    $branch->when($request->branch_id, function ($q) use ($request){
                        $q->where('id', $request->branch_id);
                    }, function ($q){
                        $q->where('id', auth_branch_id());
                    });
                })->whereHas('receiverDepartment', function ($department)use ($request){
                    $department->when($request->department_id, function ($q, $d){
                        $q->where('id', $d);
                    }, function ($q){
                        $q->where('id', auth_department_id());
                    });
                });
            })
            ->orWhere(function ($q) use ($storeManager){
                $q->whereRaw("true = $storeManager")->where('department_status', 1);
            })

            ->latest()
            ->paginate(\request()->per_page ?? 10);

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

        foreach ($input as $item){
            $item['uuid'] = $uuid;
            $item['issuer_id'] = $request->user()->id;
            $item['issuer_branch_id'] = auth_branch_id();
            $item['issuer_department_id'] = auth_department_id();
            $item['issue_time'] = now()->toDateTimeString();
            $receiver = User::find($item['receiver_id']);
            $item['receiver_branch_id'] = $receiver->branches()->first()->id;
            $item['receiver_department_id'] = $receiver->departments()->first()->id;

            $productIssue = $this->productIssueRepository->create($item);
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
        $productIssue = $this->productIssueRepository->allQuery()->where('uuid', $uuid)->get();

        if (empty($productIssue)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/productIssues.singular')])
            );
        }

        return $this->sendResponse(
            ProductIssueResource::collection($productIssue),
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
    public function update($id, Request $request): JsonResponse
    {
        $input = $request->all();

        /** @var ProductIssue $productIssue */
        $productIssue = $this->productIssueRepository->find($id);

        if (empty($productIssue)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/productIssues.singular')])
            );
        }
        if ($request->has('department')){
            switch ($request->department){
                case 'both':
                    $input['department_status'] = 1;
                    $input['department_approved_by'] = $request->user()->id;
                    $input['store_status'] = 1;
                    $input['store_approved_by'] = $request->user()->id;
                    break;
                case 'department':
                    $input['department_status'] = 1;
                    $input['department_approved_by'] = $request->user()->id;
                    break;
                case 'store':
                    $input['store_status'] = 1;
                    $input['store_approved_by'] = $request->user()->id;
                    break;
            };
        }
        unset($input['department']);
        unset($input['status']);

        DB::transaction(function () use($productIssue, $input, $id, $request){
            try {
                $productIssue = $this->productIssueRepository->update($input, $id);
                // TODO check is it store person or not if yes then reduce the stock;
                if (!$request->user()->hasRole('Store Manager')) return;

                $productOption = ProductOption::find($productIssue->product_option_id);
                $productOption->stock = (double)$productOption->stock - (double)$productIssue->quantity;
                $productOption->save();

                $purchase_history = Purchase::query()
                    ->where('product_id', $productIssue->product_id)
                    ->where('product_option_id', $productIssue->product_option_id)
                    ->where('available_qty', '>', 0)
                    ->oldest()
                    ->get();

                $request_quantity = (double)$productIssue->quantity;
                $qty = $request_quantity;
                $purchase_log = [];
                foreach ($purchase_history as $purchase){
                    if ($qty > 0){
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
                        $purchase->available_qty = $request_quantity < $purchase->available_qty ? $purchase->available_qty - $request_quantity : 0;
                        $request_quantity = $qty;
                        $purchase->save();
                        continue;
                    }else{
                        break;
                    }
                }
                $productIssue->rateLog()->createMany($purchase_log);
            }catch (\PDOException $exception){
                Log::error('product issue update error', $exception->getMessage());
            }
        }, 2);
        return $this->sendResponse(
            new ProductIssueResource($productIssue),
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
    public function destroy($id): JsonResponse
    {
        /** @var ProductIssue $productIssue */
        $productIssue = $this->productIssueRepository->find($id);

        if (empty($productIssue)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/productIssues.singular')])
            );
        }
        $productOptionId = $productIssue-> product_option_id;
        $quantity = $productIssue->quantity;

        if ($productIssue && $productIssue->delete()){
            $productOption = ProductOption::find($productOptionId);
            $productOption->stock = (double)$productOption->stock + (double)$quantity;
            $productOption->save();
        }

        return $this->sendResponse(
            $id,
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
        $issue =  ProductIssue::find($id);
        if (empty($issue)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/productIssues.singular')])
            );
        }
        if ($request->has('quantity')){
            $issue->update([
                'quantity' => $request->quantity
            ]);
        }
        return $this->sendResponse(
            new ProductIssueResource($issue),
            __('messages.updated', ['model' => __('models/productIssues.singular')])
        );

    }
}
