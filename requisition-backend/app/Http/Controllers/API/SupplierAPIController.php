<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateSupplierAPIRequest;
use App\Http\Requests\API\UpdateSupplierAPIRequest;
use App\Models\Supplier;
use App\Repositories\SupplierRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\SupplierResource;

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
        $suppliers = $this->supplierRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            SupplierResource::collection($suppliers),
            __('messages.retrieved', ['model' => __('models/suppliers.plural')])
        );
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
     *      ) CreateSupplierAPIRequest
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $input = $request->all();
        return response()->json($request->logo);
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
