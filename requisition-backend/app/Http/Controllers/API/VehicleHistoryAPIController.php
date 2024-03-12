<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateVehicleHistoryAPIRequest;
use App\Http\Requests\API\UpdateVehicleHistoryAPIRequest;
use App\Http\Resources\CashRequisitionResource;
use App\Models\CashRequisition;
use App\Models\CashRequisitionItem;
use App\Models\VehicleHistory;
use App\Repositories\VehicleHistoryRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\VehicleHistoryResource;
use OpenApi\Annotations as OA;

/**
 * Class VehicleHistoryController
 */

class VehicleHistoryAPIController extends AppBaseController
{
    /** @var  VehicleHistoryRepository */
    private $vehicleHistoryRepository;

    public function __construct(VehicleHistoryRepository $vehicleHistoryRepo)
    {
        $this->vehicleHistoryRepository = $vehicleHistoryRepo;
    }

    /**
     * @OA\Get(
     *      path="/vehicle-histories",
     *      summary="getVehicleHistoryList",
     *      tags={"VehicleHistory"},
     *      description="Get all VehicleHistories",
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
     *                  @OA\Items(ref="#/components/schemas/VehicleHistory")
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
        $vehicleHistories = $this->vehicleHistoryRepository->allQuery(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        )
            ->latest()
            ->paginate();
        return response()->json([
            'data' => VehicleHistoryResource::collection($vehicleHistories),
            "number_of_rows" => $vehicleHistories->total(),
            "message" => __('messages.retrieved', ['model' => __('models/vehicleHistories.plural')]),
        ]);
    }

    /**
     * @OA\Post(
     *      path="/vehicle-histories",
     *      summary="createVehicleHistory",
     *      tags={"VehicleHistory"},
     *      description="Create VehicleHistory",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/VehicleHistory")
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
     *                  ref="#/components/schemas/VehicleHistory"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateVehicleHistoryAPIRequest $request): JsonResponse
    {
        $input = $request->all();
        $input['user_id'] = $request->user()->id;
        $input['cash_requisition_item_id'] = CashRequisitionItem::query()
            ->where('cash_requisition_id', $request->cash_requisition_id)
            ->whereHas('item', function ($q) use ($request){
                $q->where('id', $request->cash_requisition_item_id);
            })->first()?->id;

        $vehicleHistory = $this->vehicleHistoryRepository->create($input);

        return $this->sendResponse(
            new VehicleHistoryResource($vehicleHistory),
            __('messages.saved', ['model' => __('models/vehicleHistories.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/vehicle-histories/{id}",
     *      summary="getVehicleHistoryItem",
     *      tags={"VehicleHistory"},
     *      description="Get VehicleHistory",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of VehicleHistory",
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
     *                  ref="#/components/schemas/VehicleHistory"
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
        /** @var VehicleHistory $vehicleHistory */
        $vehicleHistory = $this->vehicleHistoryRepository->find($id);

        if (empty($vehicleHistory)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/vehicleHistories.singular')])
            );
        }

        return $this->sendResponse(
            new VehicleHistoryResource($vehicleHistory),
            __('messages.retrieved', ['model' => __('models/vehicleHistories.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/vehicle-histories/{id}",
     *      summary="updateVehicleHistory",
     *      tags={"VehicleHistory"},
     *      description="Update VehicleHistory",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of VehicleHistory",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/VehicleHistory")
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
     *                  ref="#/components/schemas/VehicleHistory"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateVehicleHistoryAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var VehicleHistory $vehicleHistory */
        $vehicleHistory = $this->vehicleHistoryRepository->find($id);

        if (empty($vehicleHistory)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/vehicleHistories.singular')])
            );
        }

        $vehicleHistory = $this->vehicleHistoryRepository->update($input, $id);

        return $this->sendResponse(
            new VehicleHistoryResource($vehicleHistory),
            __('messages.updated', ['model' => __('models/vehicleHistories.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/vehicle-histories/{id}",
     *      summary="deleteVehicleHistory",
     *      tags={"VehicleHistory"},
     *      description="Delete VehicleHistory",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of VehicleHistory",
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
        /** @var VehicleHistory $vehicleHistory */
        $vehicleHistory = $this->vehicleHistoryRepository->find($id);

        if (empty($vehicleHistory)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/vehicleHistories.singular')])
            );
        }

        $vehicleHistory->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/vehicleHistories.singular')])
        );
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function cashRequisitionSelect(Request $request): JsonResponse
    {
        $requisition = CashRequisition::query()
            ->whereHas('cashRequisitionItems', function ($q) use($request){
                $q->whereHas('item', function ($q) use($request){
                    $q->where('id', $request->cash_item);
                })->doesntHave('vehicleHistory');
            })
            ->whereHas('approval_status', function ($q){
                $q->where('ceo_status', 2);
            })
            ->latest()
            ->get();
        return $this->sendResponse(
            CashRequisitionResource::collection($requisition),
            __('messages.deleted', ['model' => __('models/cashRequisition.singular')])
        );
    }
}
