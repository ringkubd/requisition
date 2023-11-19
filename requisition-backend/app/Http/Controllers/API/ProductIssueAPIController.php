<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateProductIssueAPIRequest;
use App\Http\Requests\API\UpdateProductIssueAPIRequest;
use App\Models\ProductIssue;
use App\Models\ProductOption;
use App\Models\Purchase;
use App\Repositories\ProductIssueRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ProductIssueResource;
use Illuminate\Support\Facades\Log;

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
        $productIssues = $this->productIssueRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            ProductIssueResource::collection($productIssues),
            __('messages.retrieved', ['model' => __('models/productIssues.plural')])
        );
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
    public function store(CreateProductIssueAPIRequest $request): JsonResponse
    {
        $input = $request->all();
        $input['issuer_id'] = $request->user()->id;
        $input['issue_time'] = now()->toDateTimeString();
        $productOptionId = $input['product_option_id'];
        $quantity = $input['quantity'];

        $productIssue = $this->productIssueRepository->create($input);
        if ($productIssue){
            $productOption = ProductOption::find($productOptionId);
            $productOption->stock = (double)$productOption->stock - (double)$quantity;
            $productOption->save();
        }

        $purchase_history = Purchase::query()
            ->where('product_id', $input['product_id'])
            ->where('product_option_id', $productOptionId)
            ->where('available_qty', '>', 0)
            ->oldest()
            ->get();

        $qty = $quantity;
        foreach ($purchase_history as $purchase){
            if ($qty > 0){
                $purchase->available_qty = $quantity > $purchase->available_qty ? $quantity - $purchase->available_qty : $purchase->available_qty - $quantity;
                $qty = $purchase->available_qty;
                $purchase->save();
                continue;
            }else{
                break;
            }
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
    public function show($id): JsonResponse
    {
        /** @var ProductIssue $productIssue */
        $productIssue = $this->productIssueRepository->find($id);

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
    public function update($id, UpdateProductIssueAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var ProductIssue $productIssue */
        $productIssue = $this->productIssueRepository->find($id);

        if (empty($productIssue)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/productIssues.singular')])
            );
        }

        $productIssue = $this->productIssueRepository->update($input, $id);

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
}