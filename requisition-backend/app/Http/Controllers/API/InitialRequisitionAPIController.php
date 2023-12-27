<?php

namespace App\Http\Controllers\API;

use App\Events\InitialRequisitionEvent;
use App\Events\RequisitionStatusEvent;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Department;
use App\Models\InitialRequisition;
use App\Models\InitialRequisitionProduct;
use App\Models\Product;
use App\Models\PurchaseRequisitionProduct;
use App\Models\User;
use App\Notifications\RequisitionStatusNotification;
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
            ->when($request->date, function ($q, $date){
                $q->whereRaw("date(created_at) = '$date'");
            })
            ->where('department_id', auth_department_id())
            ->where('branch_id', auth_branch_id())
            ->latest()
            ->paginate(\request()->per_page ?? 10);;

        return response()->json([
            'initial' =>  InitialRequisitionResource::collection($initialRequisitions),
            'number_of_rows' => $initialRequisitions->total()
        ]);
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
        $irf_no = $this->newIRFNO();
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
        $initialRequisition->irfNos()->create([
            'irf_no' => $irf_no
        ]);
        $approval_status = $initialRequisition->approval_status()->create([
            'department_id' => auth_department_id(),
            'department_status' => 1,
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
        broadcast(new InitialRequisitionEvent(new InitialRequisitionResource($initialRequisition)));

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

    public function category(Request $request): JsonResponse
    {
        $start = ((int)$request->page - 1) * 10;
        $categories = CategoryResource::collection(Category::query()
            ->when($request->search, function ($q, $s){
                $q->where('title', 'like', "%$s%")
                    ->orWhere('code', 'like', "%$s%");
            })
            ->skip($start)
            ->limit(20)
            ->get()
        );
        $count = Category::query()
                ->when($request->search, function ($q, $s){
                    $q->where('title', 'like', "%$s%")
                        ->orWhere('code', 'like', "%$s%");
                })
                ->count() - $start;
        return $this->sendResponse(
            [ "categories" => $categories, 'count' => $count],
            __('messages.retrieved', ['model' => __('models/initialRequisitions.plural')]));
    }

    /**
     * Extra Options
     */
    /**
     * @param Request $request
     * @return JsonResponse
     */

    public function products(Request $request): JsonResponse
    {
        $start = ((int)$request->page - 1) * 10;

        $products = ProductResource::collection(Product::query()
            ->when($request->search, function ($q, $s){
                $q->where('title', 'like', "%$s%");
            })
            ->when($request->category_id, function ($q, $v){
                $q->where('category_id', $v);
            })
            ->with('category')
            ->skip($start)
            ->limit(20)
            ->get());
        $count = Product::query()
                ->when($request->search, function ($q, $s){
                    $q->where('title', 'like', "%$s%");
                })
                ->when($request->category_id, function ($q, $v){
                    $q->where('category_id', $v);
                })
                ->count() - $start;

        return $this->sendResponse(
            [ "products" => $products, 'count' => $count],
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

    /**
     * @param Request $request
     * @param InitialRequisition $requisition
     * @return JsonResponse|void
     */

    public function changeStatusDepartment(Request $request,InitialRequisition $requisition){
        $head_of_department = $requisition->department?->head_of_department;
        $head_of_department_user = User::find($head_of_department);
        if ($head_of_department){
            $data = [
                'department_id' => $requisition->department_id,
                'notes' => $request->notes
            ];
            switch ($request->stage){
                case 'accounts':
                    $data['accounts_status'] = $request->status;
                    $data['accounts_approved_by'] = \request()->user()->id;
                    if ($request->status == 2){
                        $data['ceo_status'] = 1;
                    }
                    $data['accounts_approved_at'] = now();
                    break;
                case 'ceo':
                    $data['ceo_status'] = $request->status;
                    $data['ceo_approved_at'] = now();
                    break;
                default:
                    $data['department_status'] = $request->status;
                    $data['department_approved_by'] = \request()->user()->id;
                    $data['department_approved_at'] = now();
            }
            if ($requisition->approval_status){
                $status = $requisition->approval_status()->update($data);
            }else{
                $status = $requisition->approval_status()->updateOrCreate($data);
            }

            broadcast(new RequisitionStatusEvent(new InitialRequisitionResource($requisition), [$requisition->user, $request->user()]));

            if ($request->status == 1){
                $head_of_department_user->notify(new RequisitionStatusNotification($status));
            }else{
                $request->user()->notify(new RequisitionStatusNotification($status));
            }
            return $this->sendResponse(
                $status,
                __('messages.retrieved', ['model' => __('models/initialRequisitionProducts.plural')])
            );
        }
    }
}
