<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateProductOptionAPIRequest;
use App\Http\Requests\API\UpdateProductOptionAPIRequest;
use App\Models\ProductOption;
use App\Repositories\ProductOptionRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;

/**
 * Class ProductOptionController
 */

class ProductOptionAPIController extends AppBaseController
{
    private ProductOptionRepository $productOptionRepository;

    public function __construct(ProductOptionRepository $productOptionRepo)
    {
        $this->productOptionRepository = $productOptionRepo;

        $this->middleware('auth:sanctum');
//        $this->middleware('role_or_permission:Super Admin|view_product-options', ['only' => ['index']]);
        $this->middleware('role_or_permission:Super Admin|update_product-options', ['only' => ['show', 'update']]);
        $this->middleware('role_or_permission:Super Admin|create_product-options', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_product-options', ['only' => ['delete']]);
    }

    /**
     * @OA\Get(
     *      path="/product-options",
     *      summary="getProductOptionList",
     *      tags={"ProductOption"},
     *      description="Get all ProductOptions",
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
     *                  @OA\Items(ref="#/components/schemas/ProductOption")
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
        $productOptions = $this->productOptionRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse($productOptions->toArray(), 'Product Options retrieved successfully');
    }

    /**
     * @OA\Post(
     *      path="/product-options",
     *      summary="createProductOption",
     *      tags={"ProductOption"},
     *      description="Create ProductOption",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/ProductOption")
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
     *                  ref="#/components/schemas/ProductOption"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateProductOptionAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $productOption = $this->productOptionRepository->create($input);

        return $this->sendResponse($productOption->toArray(), 'Product Option saved successfully');
    }

    /**
     * @OA\Get(
     *      path="/product-options/{id}",
     *      summary="getProductOptionItem",
     *      tags={"ProductOption"},
     *      description="Get ProductOption",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of ProductOption",
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
     *                  ref="#/components/schemas/ProductOption"
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
        /** @var ProductOption $productOption */
        $productOption = $this->productOptionRepository->find($id);

        if (empty($productOption)) {
            return $this->sendError('Product Option not found');
        }

        return $this->sendResponse($productOption->toArray(), 'Product Option retrieved successfully');
    }

    /**
     * @OA\Put(
     *      path="/product-options/{id}",
     *      summary="updateProductOption",
     *      tags={"ProductOption"},
     *      description="Update ProductOption",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of ProductOption",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/ProductOption")
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
     *                  ref="#/components/schemas/ProductOption"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateProductOptionAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var ProductOption $productOption */
        $productOption = $this->productOptionRepository->find($id);

        if (empty($productOption)) {
            return $this->sendError('Product Option not found');
        }

        $productOption = $this->productOptionRepository->update($input, $id);

        return $this->sendResponse($productOption->toArray(), 'ProductOption updated successfully');
    }

    /**
     * @OA\Delete(
     *      path="/product-options/{id}",
     *      summary="deleteProductOption",
     *      tags={"ProductOption"},
     *      description="Delete ProductOption",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of ProductOption",
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
        /** @var ProductOption $productOption */
        $productOption = $this->productOptionRepository->find($id);

        if (empty($productOption)) {
            return $this->sendError('Product Option not found');
        }

        $productOption->delete();

        return $this->sendSuccess('Product Option deleted successfully');
    }
}
