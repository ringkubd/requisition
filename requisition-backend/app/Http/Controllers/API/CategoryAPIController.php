<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateCategoryAPIRequest;
use App\Http\Requests\API\UpdateCategoryAPIRequest;
use App\Models\Category;
use App\Repositories\CategoryRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\CategoryResource;

/**
 * Class CategoryController
 */

class CategoryAPIController extends AppBaseController
{
    /** @var  CategoryRepository */
    private $categoryRepository;

    public function __construct(CategoryRepository $categoryRepo)
    {
        $this->categoryRepository = $categoryRepo;
        $this->middleware('auth:sanctum');
        $this->middleware('role_or_permission:Super Admin|view_categories', ['only' => ['index']]);
        $this->middleware('role_or_permission:Super Admin|update_categories', ['only' => ['show', 'update']]);
        $this->middleware('role_or_permission:Super Admin|create_categories', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_categories', ['only' => ['delete']]);
    }

    /**
     * @OA\Get(
     *      path="/categories",
     *      summary="getCategoryList",
     *      tags={"Category"},
     *      description="Get all Categories",
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
     *                  @OA\Items(ref="#/components/schemas/Category")
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
        $categories = $this->categoryRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            CategoryResource::collection($categories),
            __('messages.retrieved', ['model' => __('models/categories.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/categories",
     *      summary="createCategory",
     *      tags={"Category"},
     *      description="Create Category",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Category")
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
     *                  ref="#/components/schemas/Category"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateCategoryAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $category = $this->categoryRepository->create($input);

        return $this->sendResponse(
            new CategoryResource($category),
            __('messages.saved', ['model' => __('models/categories.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/categories/{id}",
     *      summary="getCategoryItem",
     *      tags={"Category"},
     *      description="Get Category",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Category",
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
     *                  ref="#/components/schemas/Category"
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
        /** @var Category $category */
        $category = $this->categoryRepository->find($id);

        if (empty($category)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/categories.singular')])
            );
        }

        return $this->sendResponse(
            new CategoryResource($category),
            __('messages.retrieved', ['model' => __('models/categories.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/categories/{id}",
     *      summary="updateCategory",
     *      tags={"Category"},
     *      description="Update Category",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Category",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Category")
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
     *                  ref="#/components/schemas/Category"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateCategoryAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Category $category */
        $category = $this->categoryRepository->find($id);

        if (empty($category)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/categories.singular')])
            );
        }

        $category = $this->categoryRepository->update($input, $id);

        return $this->sendResponse(
            new CategoryResource($category),
            __('messages.updated', ['model' => __('models/categories.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/categories/{id}",
     *      summary="deleteCategory",
     *      tags={"Category"},
     *      description="Delete Category",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Category",
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
        /** @var Category $category */
        $category = $this->categoryRepository->find($id);

        if (empty($category)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/categories.singular')])
            );
        }

        $category->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/categories.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/categories/{parent_category}",
     *      summary="getCategoryList",
     *      tags={"Category"},
     *      description="Get all Sub-category Categories",
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
     *                  @OA\Items(ref="#/components/schemas/Category")
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */

    public function subCategory(Request $request, $parent): JsonResponse
    {
        $categories = $this->categoryRepository->allQuery(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        )->where('parent_id', $parent)->get();

        return $this->sendResponse(
            CategoryResource::collection($categories),
            __('messages.retrieved', ['model' => __('models/categories.plural')])
        );
    }
}
