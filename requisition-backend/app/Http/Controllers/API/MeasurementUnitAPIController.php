<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateMeasurementUnitAPIRequest;
use App\Http\Requests\API\UpdateMeasurementUnitAPIRequest;
use App\Models\MeasurementUnit;
use App\Repositories\MeasurementUnitRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\MeasurementUnitResource;

/**
 * Class MeasurementUnitController
 */

class MeasurementUnitAPIController extends AppBaseController
{
    /** @var  MeasurementUnitRepository */
    private $measurementUnitRepository;

    public function __construct(MeasurementUnitRepository $measurementUnitRepo)
    {
        $this->measurementUnitRepository = $measurementUnitRepo;

        $this->middleware('auth:sanctum');
        $this->middleware('role_or_permission:Super Admin|view_measurement-units', ['only' => ['index']]);
        $this->middleware('role_or_permission:Super Admin|update_measurement-units', ['only' => ['show', 'update']]);
        $this->middleware('role_or_permission:Super Admin|create_measurement-units', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_measurement-units', ['only' => ['delete']]);
    }

    /**
     * @OA\Get(
     *      path="/measurement-units",
     *      summary="getMeasurementUnitList",
     *      tags={"MeasurementUnit"},
     *      description="Get all MeasurementUnits",
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
     *                  @OA\Items(ref="#/components/schemas/MeasurementUnit")
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
        $measurementUnits = $this->measurementUnitRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            MeasurementUnitResource::collection($measurementUnits),
            __('messages.retrieved', ['model' => __('models/measurementUnits.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/measurement-units",
     *      summary="createMeasurementUnit",
     *      tags={"MeasurementUnit"},
     *      description="Create MeasurementUnit",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/MeasurementUnit")
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
     *                  ref="#/components/schemas/MeasurementUnit"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateMeasurementUnitAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $measurementUnit = $this->measurementUnitRepository->create($input);

        return $this->sendResponse(
            new MeasurementUnitResource($measurementUnit),
            __('messages.saved', ['model' => __('models/measurementUnits.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/measurement-units/{id}",
     *      summary="getMeasurementUnitItem",
     *      tags={"MeasurementUnit"},
     *      description="Get MeasurementUnit",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of MeasurementUnit",
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
     *                  ref="#/components/schemas/MeasurementUnit"
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
        /** @var MeasurementUnit $measurementUnit */
        $measurementUnit = $this->measurementUnitRepository->find($id);

        if (empty($measurementUnit)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/measurementUnits.singular')])
            );
        }

        return $this->sendResponse(
            new MeasurementUnitResource($measurementUnit),
            __('messages.retrieved', ['model' => __('models/measurementUnits.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/measurement-units/{id}",
     *      summary="updateMeasurementUnit",
     *      tags={"MeasurementUnit"},
     *      description="Update MeasurementUnit",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of MeasurementUnit",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/MeasurementUnit")
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
     *                  ref="#/components/schemas/MeasurementUnit"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateMeasurementUnitAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var MeasurementUnit $measurementUnit */
        $measurementUnit = $this->measurementUnitRepository->find($id);

        if (empty($measurementUnit)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/measurementUnits.singular')])
            );
        }

        $measurementUnit = $this->measurementUnitRepository->update($input, $id);

        return $this->sendResponse(
            new MeasurementUnitResource($measurementUnit),
            __('messages.updated', ['model' => __('models/measurementUnits.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/measurement-units/{id}",
     *      summary="deleteMeasurementUnit",
     *      tags={"MeasurementUnit"},
     *      description="Delete MeasurementUnit",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of MeasurementUnit",
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
        /** @var MeasurementUnit $measurementUnit */
        $measurementUnit = $this->measurementUnitRepository->find($id);

        if (empty($measurementUnit)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/measurementUnits.singular')])
            );
        }

        $measurementUnit->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/measurementUnits.singular')])
        );
    }
}
