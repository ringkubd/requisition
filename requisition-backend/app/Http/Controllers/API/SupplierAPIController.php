<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\UpdateSupplierAPIRequest;
use App\Http\Resources\SupplierGeneralResource;
use App\Models\Supplier;
use App\Repositories\SupplierRepository;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\SupplierResource;
use OpenApi\Annotations as OA;

/**
 * Class SupplierController
 */

class SupplierAPIController extends AppBaseController
{
    /** @var  SupplierRepository */
    private $supplierRepository;

    public function __construct(SupplierRepository $supplierRepo)
    {
        $this->supplierRepository = $supplierRepo;

        $this->middleware('auth:sanctum');
//        $this->middleware('role_or_permission:Super Admin|view_suppliers', ['only' => ['index']]);
//        $this->middleware('role_or_permission:Super Admin|update_suppliers', ['only' => ['show', 'update']]);
//        $this->middleware('role_or_permission:Super Admin|create_suppliers', ['only' => ['store']]);
//        $this->middleware('role_or_permission:Super Admin|delete_suppliers', ['only' => ['delete']]);
    }

    /**
     * @OA\Get(
     *      path="/suppliers",
     *      summary="getSupplierList",
     *      tags={"Supplier"},
     *      description="Get all Suppliers",
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
     *                  @OA\Items(ref="#/components/schemas/Supplier")
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
        $suppliers = Supplier::query()
            ->when($request->name, function ($q, $v){
                $q->where('name', 'like', "%$v%")
                    ->orWhere('address', 'like', "%$v%")
                    ->orWhere('contact', 'like', "%$v%");
            })->paginate();

        return response()->json([
                'data' => SupplierGeneralResource::collection($suppliers),
                "number_of_rows" => $suppliers->total(),
                "message" => __('messages.retrieved', ['model' => __('models/products.plural')]),
            ]);
    }

    /**
     * @OA\Post(
     *      path="/suppliers",
     *      summary="createSupplier",
     *      tags={"Supplier"},
     *      description="Create Supplier",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Supplier")
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
     *                  ref="#/components/schemas/Supplier"
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
        if($request->hasFile('logo')){
            $logo = $request->file('logo');
            $extension = $logo->getClientOriginalExtension();
            $currentDateTime = Carbon::now()->format("Y-m-d_h_i");
            $name = str_replace(" ", "",$request->name)."_".$currentDateTime.".".$extension;
            $logo->move(public_path('supliers_logo'), "$name");
            $input['logo'] = url("/supliers_logo/$name");
        };
        $supplier = $this->supplierRepository->create($input);

        return $this->sendResponse(
            new SupplierResource($supplier),
            __('messages.saved', ['model' => __('models/suppliers.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/suppliers/{id}",
     *      summary="getSupplierItem",
     *      tags={"Supplier"},
     *      description="Get Supplier",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Supplier",
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
     *                  ref="#/components/schemas/Supplier"
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
        /** @var Supplier $supplier */
        $supplier = $this->supplierRepository->find($id);

        if (empty($supplier)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/suppliers.singular')])
            );
        }

        return $this->sendResponse(
            new SupplierResource($supplier),
            __('messages.retrieved', ['model' => __('models/suppliers.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/suppliers/{id}",
     *      summary="updateSupplier",
     *      tags={"Supplier"},
     *      description="Update Supplier",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Supplier",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Supplier")
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
     *                  ref="#/components/schemas/Supplier"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateSupplierAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Supplier $supplier */
        $supplier = $this->supplierRepository->find($id);

        if (empty($supplier)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/suppliers.singular')])
            );
        }

        $supplier = $this->supplierRepository->update($input, $id);

        return $this->sendResponse(
            new SupplierResource($supplier),
            __('messages.updated', ['model' => __('models/suppliers.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/suppliers/{id}",
     *      summary="deleteSupplier",
     *      tags={"Supplier"},
     *      description="Delete Supplier",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Supplier",
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
        /** @var Supplier $supplier */
        $supplier = $this->supplierRepository->find($id);

        if (empty($supplier)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/suppliers.singular')])
            );
        }

        $supplier->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/suppliers.singular')])
        );
    }
}
