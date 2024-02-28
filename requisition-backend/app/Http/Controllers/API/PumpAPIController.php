<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreatePumpAPIRequest;
use App\Http\Requests\API\UpdatePumpAPIRequest;
use App\Models\Pump;
use App\Repositories\PumpRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\PumpResource;

/**
 * Class PumpController
 */

class PumpAPIController extends AppBaseController
{
    /** @var  PumpRepository */
    private $pumpRepository;

    public function __construct(PumpRepository $pumpRepo)
    {
        $this->pumpRepository = $pumpRepo;
    }

    /**
     * @OA\Get(
     *      path="/pumps",
     *      summary="getPumpList",
     *      tags={"Pump"},
     *      description="Get all Pumps",
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
     *                  @OA\Items(ref="#/components/schemas/Pump")
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
        $pumps = $this->pumpRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            PumpResource::collection($pumps),
            __('messages.retrieved', ['model' => __('models/pumps.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/pumps",
     *      summary="createPump",
     *      tags={"Pump"},
     *      description="Create Pump",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Pump")
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
     *                  ref="#/components/schemas/Pump"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreatePumpAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $pump = $this->pumpRepository->create($input);

        return $this->sendResponse(
            new PumpResource($pump),
            __('messages.saved', ['model' => __('models/pumps.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/pumps/{id}",
     *      summary="getPumpItem",
     *      tags={"Pump"},
     *      description="Get Pump",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Pump",
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
     *                  ref="#/components/schemas/Pump"
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
        /** @var Pump $pump */
        $pump = $this->pumpRepository->find($id);

        if (empty($pump)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/pumps.singular')])
            );
        }

        return $this->sendResponse(
            new PumpResource($pump),
            __('messages.retrieved', ['model' => __('models/pumps.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/pumps/{id}",
     *      summary="updatePump",
     *      tags={"Pump"},
     *      description="Update Pump",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Pump",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Pump")
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
     *                  ref="#/components/schemas/Pump"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdatePumpAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Pump $pump */
        $pump = $this->pumpRepository->find($id);

        if (empty($pump)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/pumps.singular')])
            );
        }

        $pump = $this->pumpRepository->update($input, $id);

        return $this->sendResponse(
            new PumpResource($pump),
            __('messages.updated', ['model' => __('models/pumps.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/pumps/{id}",
     *      summary="deletePump",
     *      tags={"Pump"},
     *      description="Delete Pump",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Pump",
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
        /** @var Pump $pump */
        $pump = $this->pumpRepository->find($id);

        if (empty($pump)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/pumps.singular')])
            );
        }

        $pump->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/pumps.singular')])
        );
    }
}
