<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateProductAPIRequest;
use App\Http\Requests\API\UpdateProductAPIRequest;
use App\Http\Resources\ProductPurchaseHistoryResource;
use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ProductResource;

/**
 * Class ProductController
 */

class ProductAPIController extends AppBaseController
{
    /** @var  ProductRepository */
    private $productRepository;

    public function __construct(ProductRepository $productRepo)
    {
        $this->productRepository = $productRepo;
    }

    /**
     * @OA\Get(
     *      path="/products",
     *      summary="getProductList",
     *      tags={"Product"},
     *      description="Get all Products",
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
     *                  @OA\Items(ref="#/components/schemas/Product")
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
        $products = $this->productRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            ProductResource::collection($products),
            __('messages.retrieved', ['model' => __('models/products.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/products",
     *      summary="createProduct",
     *      tags={"Product"},
     *      description="Create Product",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Product")
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
     *                  ref="#/components/schemas/Product"
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
        $basic = $input['basic'];
        $metas = $input['metas'];
        $productOptions = $input['productOptions'];
//        $basic['status'] = 'Active';
        $validate = new CreateProductAPIRequest($basic);
        $product = $this->productRepository->create($basic);
        $product->productMetas()->createMany($metas);
        $product->productOptions()->createMany($productOptions);

        return $this->sendResponse(
            new ProductResource($product),
            __('messages.saved', ['model' => __('models/products.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/products/{id}",
     *      summary="getProductItem",
     *      tags={"Product"},
     *      description="Get Product",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Product",
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
     *                  ref="#/components/schemas/Product"
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
        /** @var Product $product */
        $product = $this->productRepository->find($id);

        if (empty($product)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/products.singular')])
            );
        }

        return $this->sendResponse(
            new ProductResource($product),
            __('messages.retrieved', ['model' => __('models/products.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/products/{id}",
     *      summary="updateProduct",
     *      tags={"Product"},
     *      description="Update Product",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Product",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Product")
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
     *                  ref="#/components/schemas/Product"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      ): JsonResponse
     * )
     */
    public function update($id, Request $request)
    {
        $input = $request->all();
        /** @var Product $product */
        $product = $this->productRepository->find($id);

        if (empty($product)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/products.singular')])
            );
        }
        $base = $input['basic'];
        $metas = $input['metas'];
        $productOptions = $input['productOptions'];
        $product = $this->productRepository->update($base, $id);
        $product->productMetas()->associate($metas);
        $product->productOptions()->associate($productOptions);

        return $this->sendResponse(
            new ProductResource($product),
            __('messages.updated', ['model' => __('models/products.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/products/{id}",
     *      summary="deleteProduct",
     *      tags={"Product"},
     *      description="Delete Product",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Product",
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
        /** @var Product $product */
        $product = $this->productRepository->find($id);

        if (empty($product)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/products.singular')])
            );
        }

        $product->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/products.singular')])
        );
    }
}
