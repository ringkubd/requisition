<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateProductAPIRequest;
use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ProductResource;
use OpenApi\Annotations as OA;
use Spatie\Activitylog\Facades\LogBatch;

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

        $this->middleware('auth:sanctum');
        $this->middleware('role_or_permission:Super Admin|view_products', ['only' => ['index']]);
        $this->middleware('role_or_permission:Super Admin|update_products', ['only' => ['show', 'update']]);
        $this->middleware('role_or_permission:Super Admin|create_products', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_products', ['only' => ['delete']]);
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
        $products = $this->productRepository->allQuery(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        )->when($request->search, function ($q, $v){
            $q->where('title', 'like', "%$v%")
                ->orWhereHas('category', function ($q) use($v){
                    $q->where('title', 'like', "%$v%");
                });
        })
            ->latest()
            ->get();

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
        LogBatch::startBatch();
        $input = $request->all();
        $basic = $input['basic'];
        $metas = $input['metas'];
        $productOptions = $input['productOptions'];
//        $basic['status'] = 'Active';
        $validate = new CreateProductAPIRequest($basic);
        $product = $this->productRepository->create($basic);
        $product->productMetas()->createMany($metas);
        $product->productOptions()->createMany($productOptions);
        LogBatch::endBatch();
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
     *      )
     * )
     */
    public function update($id, Request $request): JsonResponse
    {
        LogBatch::startBatch();
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
        $product->productMetas()->createUpdateOrDelete($metas, ['id']);
        $product->productOptions()->createUpdateOrDelete($productOptions, ['id']);
        LogBatch::endBatch();
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
