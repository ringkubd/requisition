<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateVehicleAPIRequest;
use App\Http\Requests\API\UpdateVehicleAPIRequest;
use App\Models\Vehicle;
use App\Repositories\VehicleRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\VehicleResource;

/**
 * Class VehicleController
 */

class VehicleAPIController extends AppBaseController
{
    /** @var  VehicleRepository */
    private $vehicleRepository;

    public function __construct(VehicleRepository $vehicleRepo)
    {
        $this->vehicleRepository = $vehicleRepo;
    }

    /**
     * @OA\Get(
     *      path="/vehicles",
     *      summary="getVehicleList",
     *      tags={"Vehicle"},
     *      description="Get all Vehicles",
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
     *                  @OA\Items(ref="#/components/schemas/Vehicle")
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
        $vehicles = $this->vehicleRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            VehicleResource::collection($vehicles),
            __('messages.retrieved', ['model' => __('models/vehicles.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/vehicles",
     *      summary="createVehicle",
     *      tags={"Vehicle"},
     *      description="Create Vehicle",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Vehicle")
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
     *                  ref="#/components/schemas/Vehicle"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateVehicleAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $vehicle = $this->vehicleRepository->create($input);

        return $this->sendResponse(
            new VehicleResource($vehicle),
            __('messages.saved', ['model' => __('models/vehicles.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/vehicles/{id}",
     *      summary="getVehicleItem",
     *      tags={"Vehicle"},
     *      description="Get Vehicle",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Vehicle",
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
     *                  ref="#/components/schemas/Vehicle"
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
        /** @var Vehicle $vehicle */
        $vehicle = $this->vehicleRepository->find($id);

        if (empty($vehicle)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/vehicles.singular')])
            );
        }

        return $this->sendResponse(
            new VehicleResource($vehicle),
            __('messages.retrieved', ['model' => __('models/vehicles.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/vehicles/{id}",
     *      summary="updateVehicle",
     *      tags={"Vehicle"},
     *      description="Update Vehicle",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Vehicle",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Vehicle")
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
     *                  ref="#/components/schemas/Vehicle"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateVehicleAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Vehicle $vehicle */
        $vehicle = $this->vehicleRepository->find($id);

        if (empty($vehicle)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/vehicles.singular')])
            );
        }

        $vehicle = $this->vehicleRepository->update($input, $id);

        return $this->sendResponse(
            new VehicleResource($vehicle),
            __('messages.updated', ['model' => __('models/vehicles.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/vehicles/{id}",
     *      summary="deleteVehicle",
     *      tags={"Vehicle"},
     *      description="Delete Vehicle",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Vehicle",
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
        /** @var Vehicle $vehicle */
        $vehicle = $this->vehicleRepository->find($id);

        if (empty($vehicle)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/vehicles.singular')])
            );
        }

        $vehicle->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/vehicles.singular')])
        );
    }
}
