<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateInitialRequisitionAPIRequest;
use App\Http\Requests\API\UpdateInitialRequisitionAPIRequest;
use App\Http\Resources\ProductResource;
use App\Models\Department;
use App\Models\InitialRequisition;
use App\Models\InitialRequisitionProduct;
use App\Models\Product;
use App\Models\PurchaseRequisitionProduct;
use App\Repositories\InitialRequisitionRepository;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\InitialRequisitionResource;
use OpenApi\Annotations as OA;

/**
 * Class InitialRequisitionController
 */

class InitialRequisitionAPIController extends AppBaseController
{
    /** @var  InitialRequisitionRepository */
    private $initialRequisitionRepository;

    public function __construct(InitialRequisitionRepository $initialRequisitionRepo)
    {
        $this->initialRequisitionRepository = $initialRequisitionRepo;

        $this->middleware('auth:sanctum');
        $this->middleware('role_or_permission:Super Admin|view_initial-requisitions', ['only' => ['index']]);
        $this->middleware('role_or_permission:Super Admin|update_initial-requisitions', ['only' => ['show', 'update']]);
        $this->middleware('role_or_permission:Super Admin|create_initial-requisitions', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_initial-requisitions', ['only' => ['delete']]);
    }

    /**
     * @OA\Get(
     *      path="/initial-requisitions",
     *      summary="getInitialRequisitionList",
     *      tags={"InitialRequisition"},
     *      description="Get all InitialRequisitions",
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
     *                  @OA\Items(ref="#/components/schemas/InitialRequisition")
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function index(Request $request) : JsonResponse
    {
        $initialRequisitions = $this->initialRequisitionRepository->allQuery(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        )
            ->where('department_id', auth_department_id())
            ->where('branch_id', auth_branch_id())
            ->latest()
            ->get();
        return $this->sendResponse(
            InitialRequisitionResource::collection($initialRequisitions),
            __('messages.retrieved', ['model' => __('models/initialRequisitions.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/initial-requisitions",
     *      summary="createInitialRequisition",
     *      tags={"InitialRequisition"},
     *      description="Create InitialRequisition",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/InitialRequisition")
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
     *                  ref="#/components/schemas/InitialRequisition"
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
        $lastRequisition = InitialRequisition::latest()->first();
        $year = Carbon::now()->format('y');
        $irf_no = ($lastRequisition?->id ?? 0 + 1) .'/'.$year.'/'.auth_department_name();
        $allProduct = $request->all();
        $estimated_cost = collect($allProduct)->sum('estimated_cost');

        $initialRequisition = InitialRequisition::create([
            'user_id' => $request->user()->id,
            'department_id' => auth_department_id(),
            'branch_id' => auth_branch_id(),
            'irf_no' => $irf_no,
            'ir_no' => 5,
            'estimated_cost' => $estimated_cost
        ]);
        $allProduct = array_map(function($p){
            unset($p['estimated_cost']);
            if (array_key_exists('last_purchase_date', $p) && ($p['last_purchase_date'] == "" || $p['last_purchase_date'] == null)){
                $p['last_purchase_date'] = null;
            }
            if (!array_key_exists('last_purchase_date', $p)){
                $p['last_purchase_date'] = null;
            }
            return $p;
        }, $allProduct);
        $initialRequisition->initialRequisitionProducts()->createMany($allProduct);

        return $this->sendResponse(
            new InitialRequisitionResource($initialRequisition),
            __('messages.saved', ['model' => __('models/initialRequisitions.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/initial-requisitions/{id}",
     *      summary="getInitialRequisitionItem",
     *      tags={"InitialRequisition"},
     *      description="Get InitialRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of InitialRequisition",
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
     *                  ref="#/components/schemas/InitialRequisition"
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
        /** @var InitialRequisition $initialRequisition */
        $initialRequisition = $this->initialRequisitionRepository->find($id);

        if (empty($initialRequisition)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/initialRequisitions.singular')])
            );
        }

        return $this->sendResponse(
            new InitialRequisitionResource($initialRequisition),
            __('messages.retrieved', ['model' => __('models/initialRequisitions.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/initial-requisitions/{id}",
     *      summary="updateInitialRequisition",
     *      tags={"InitialRequisition"},
     *      description="Update InitialRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of InitialRequisition",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/InitialRequisition")
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
     *                  ref="#/components/schemas/InitialRequisition"
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
        /** @var InitialRequisition $initialRequisition */
        $initialRequisition = $this->initialRequisitionRepository->find($id);

        if (empty($initialRequisition)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/initialRequisitions.singular')])
            );
        }
        $user = $request->user();
        $department = Department::find(auth_department_id());
        if ($initialRequisition->user_id !== $user->id && !$user->hasRole('Super Admin') && !$user->hasRole('Store Manager') && $department->head_of_department !=  $user->id){
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/initialRequisitions.singular')])
            );
        }

        $allProduct = $request->all();
        $estimated_cost = collect($allProduct)->sum('estimated_cost');

        $initialRequisition = $this->initialRequisitionRepository->update([
            'user_id' => $user->id,
            'estimated_cost' => $estimated_cost
        ], $id);

        $allProduct = array_map(function($p){
            unset($p['estimated_cost']);
            unset($p['title']);
            unset($p['id']);
            unset($p['product']);
            unset($p['product_option']);
            unset($p['stock']);
            if (array_key_exists('last_purchase_date', $p) && ($p['last_purchase_date'] == "" || $p['last_purchase_date'] == null)){
                $p['last_purchase_date'] = Carbon::now()->toDateString();
            }else{
                $p['last_purchase_date'] = Carbon::parse($p['last_purchase_date'])->toDateString();
            }
            if (!array_key_exists('last_purchase_date', $p)){
                $p['last_purchase_date'] = Carbon::now()->toDateString();
            }
            return $p;
        }, $allProduct);
        $initialRequisition->initialRequisitionProducts()->delete();
        $initialRequisition->initialRequisitionProducts()->createMany($allProduct);

        return $this->sendResponse(
            new InitialRequisitionResource($initialRequisition),
            __('messages.updated', ['model' => __('models/initialRequisitions.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/initial-requisitions/{id}",
     *      summary="deleteInitialRequisition",
     *      tags={"InitialRequisition"},
     *      description="Delete InitialRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of InitialRequisition",
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
        /** @var InitialRequisition $initialRequisition */
        $initialRequisition = $this->initialRequisitionRepository->find($id);

        if (empty($initialRequisition)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/initialRequisitions.singular')])
            );
        }

        $initialRequisition->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/initialRequisitions.singular')])
        );
    }
    /**
     * Extra Options
     */
    /**
     * @param Request $request
     * @return void
     */

    public function products(Request $request){
        $start = ((int)$request->page - 1) * 10;
        $end = ((int)$request->page) * 10;

        $products = ProductResource::collection(Product::query()
            ->where('title', 'like', "%$request->search%")
            ->skip($start)
            ->limit($end)
            ->get());

        return $this->sendResponse(
            ProductResource::collection($products),
            __('messages.retrieved', ['model' => __('models/initialRequisitions.plural')])
        );
    }

    public function lastPurchase(Request $request){
        $request->validate([
            'product_id' => $request->product_id,
            'product_option_id' => $request->product_option_id
        ]);
        $requisition = PurchaseRequisitionProduct::query()
            ->where('product_id', $request->product_id)
            ->where('product_option_id', $request->product_option_id)
            ->where('status', 1)
            ->latest()
            ->get();
        return $this->sendResponse(
            PurchaseRequisitionProduct::collection($requisition),
            __('messages.retrieved', ['model' => __('models/purchaseRequisitions.plural')])
        );
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */

    public function purposeSuggestions(Request $request): JsonResponse
    {
        $initialProducts = InitialRequisitionProduct::query()
            ->where('product_id', $request->product_id)
            ->where('product_option_id', $request->product_option_id)
            ->selectRaw('DISTINCT purpose')
            ->get();
        return $this->sendResponse(
            $initialProducts,
            __('messages.retrieved', ['model' => __('models/initialRequisitionProducts.plural')])
        );
    }
}
