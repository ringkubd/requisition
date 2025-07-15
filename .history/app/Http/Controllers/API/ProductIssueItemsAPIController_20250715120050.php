<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateProductIssueItemsAPIRequest;
use App\Http\Requests\API\UpdateProductIssueItemsAPIRequest;
use App\Models\ProductIssueItems;
use App\Repositories\ProductIssueItemsRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ProductIssueItemsResource;

/**
 * Class ProductIssueItemsController
 */

class ProductIssueItemsAPIController extends AppBaseController
{
    /** @var  ProductIssueItemsRepository */
    private $productIssueItemsRepository;

    public function __construct(ProductIssueItemsRepository $productIssueItemsRepo)
    {
        $this->productIssueItemsRepository = $productIssueItemsRepo;
    }

    /**
     * @OA\Get(
     *      path="/product-issue-items",
     *      summary="getProductIssueItemsList",
     *      tags={"ProductIssueItems"},
     *      description="Get all ProductIssueItems",
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
     *                  @OA\Items(ref="#/components/schemas/ProductIssueItems")
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
        $productIssueItems = $this->productIssueItemsRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            ProductIssueItemsResource::collection($productIssueItems),
            __('messages.retrieved', ['model' => __('models/productIssueItems.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/product-issue-items",
     *      summary="createProductIssueItems",
     *      tags={"ProductIssueItems"},
     *      description="Create ProductIssueItems",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/ProductIssueItems")
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
     *                  ref="#/components/schemas/ProductIssueItems"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateProductIssueItemsAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $productIssueItems = $this->productIssueItemsRepository->create($input);

        return $this->sendResponse(
            new ProductIssueItemsResource($productIssueItems),
            __('messages.saved', ['model' => __('models/productIssueItems.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/product-issue-items/{id}",
     *      summary="getProductIssueItemsItem",
     *      tags={"ProductIssueItems"},
     *      description="Get ProductIssueItems",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of ProductIssueItems",
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
     *                  ref="#/components/schemas/ProductIssueItems"
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
        /** @var ProductIssueItems $productIssueItems */
        $productIssueItems = $this->productIssueItemsRepository->find($id);

        if (empty($productIssueItems)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/productIssueItems.singular')])
            );
        }

        return $this->sendResponse(
            new ProductIssueItemsResource($productIssueItems),
            __('messages.retrieved', ['model' => __('models/productIssueItems.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/product-issue-items/{id}",
     *      summary="updateProductIssueItems",
     *      tags={"ProductIssueItems"},
     *      description="Update ProductIssueItems",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of ProductIssueItems",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/ProductIssueItems")
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
     *                  ref="#/components/schemas/ProductIssueItems"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    // Compare with the previous items and, remove, update the items that are not in the new list
    // This is a placeholder comment to indicate where the logic would go
    // The actual implementation would depend on the specific requirements of the application
    // and how the ProductIssueItems are structured and related.
    // The logic would typically involve comparing the existing items with the new input,
    public function update($id, UpdateProductIssueItemsAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var ProductIssueItems $productIssueItems */
        $productIssueItems = $this->productIssueItemsRepository->find($id);

        if (empty($productIssueItems)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/productIssueItems.singular')])
            );
        }
        // Compare with the previous items and, remove, update the items that are not in the new lis

        $productIssueItems = $this->productIssueItemsRepository->update($input, $id);

        return $this->sendResponse(
            new ProductIssueItemsResource($productIssueItems),
            __('messages.updated', ['model' => __('models/productIssueItems.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/product-issue-items/{id}",
     *      summary="deleteProductIssueItems",
     *      tags={"ProductIssueItems"},
     *      description="Delete ProductIssueItems",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of ProductIssueItems",
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
        /** @var ProductIssueItems $productIssueItems */
        $productIssueItems = $this->productIssueItemsRepository->find($id);

        if (empty($productIssueItems)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/productIssueItems.singular')])
            );
        }

        $productIssueItems->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/productIssueItems.singular')])
        );
    }
}
