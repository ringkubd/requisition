<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateCashRequisitionItemAPIRequest;
use App\Http\Requests\API\UpdateCashRequisitionItemAPIRequest;
use App\Models\CashRequisitionItem;
use App\Repositories\CashRequisitionItemRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\CashRequisitionItemResource;

/**
 * Class CashRequisitionItemController
 */

class CashRequisitionItemAPIController extends AppBaseController
{
    /** @var  CashRequisitionItemRepository */
    private $cashRequisitionItemRepository;

    public function __construct(CashRequisitionItemRepository $cashRequisitionItemRepo)
    {
        $this->cashRequisitionItemRepository = $cashRequisitionItemRepo;
    }

    /**
     * @OA\Get(
     *      path="/cash-requisition-items",
     *      summary="getCashRequisitionItemList",
     *      tags={"CashRequisitionItem"},
     *      description="Get all CashRequisitionItems",
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
     *                  @OA\Items(ref="#/components/schemas/CashRequisitionItem")
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
        $cashRequisitionItems = $this->cashRequisitionItemRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            CashRequisitionItemResource::collection($cashRequisitionItems),
            __('messages.retrieved', ['model' => __('models/cashRequisitionItems.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/cash-requisition-items",
     *      summary="createCashRequisitionItem",
     *      tags={"CashRequisitionItem"},
     *      description="Create CashRequisitionItem",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/CashRequisitionItem")
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
     *                  ref="#/components/schemas/CashRequisitionItem"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateCashRequisitionItemAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $cashRequisitionItem = $this->cashRequisitionItemRepository->create($input);

        return $this->sendResponse(
            new CashRequisitionItemResource($cashRequisitionItem),
            __('messages.saved', ['model' => __('models/cashRequisitionItems.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/cash-requisition-items/{id}",
     *      summary="getCashRequisitionItemItem",
     *      tags={"CashRequisitionItem"},
     *      description="Get CashRequisitionItem",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashRequisitionItem",
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
     *                  ref="#/components/schemas/CashRequisitionItem"
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
        /** @var CashRequisitionItem $cashRequisitionItem */
        $cashRequisitionItem = $this->cashRequisitionItemRepository->find($id);

        if (empty($cashRequisitionItem)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/cashRequisitionItems.singular')])
            );
        }

        return $this->sendResponse(
            new CashRequisitionItemResource($cashRequisitionItem),
            __('messages.retrieved', ['model' => __('models/cashRequisitionItems.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/cash-requisition-items/{id}",
     *      summary="updateCashRequisitionItem",
     *      tags={"CashRequisitionItem"},
     *      description="Update CashRequisitionItem",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashRequisitionItem",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/CashRequisitionItem")
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
     *                  ref="#/components/schemas/CashRequisitionItem"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateCashRequisitionItemAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var CashRequisitionItem $cashRequisitionItem */
        $cashRequisitionItem = $this->cashRequisitionItemRepository->find($id);

        if (empty($cashRequisitionItem)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/cashRequisitionItems.singular')])
            );
        }

        $cashRequisitionItem = $this->cashRequisitionItemRepository->update($input, $id);

        return $this->sendResponse(
            new CashRequisitionItemResource($cashRequisitionItem),
            __('messages.updated', ['model' => __('models/cashRequisitionItems.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/cash-requisition-items/{id}",
     *      summary="deleteCashRequisitionItem",
     *      tags={"CashRequisitionItem"},
     *      description="Delete CashRequisitionItem",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashRequisitionItem",
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
        /** @var CashRequisitionItem $cashRequisitionItem */
        $cashRequisitionItem = $this->cashRequisitionItemRepository->find($id);

        if (empty($cashRequisitionItem)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/cashRequisitionItems.singular')])
            );
        }

        $cashRequisitionItem->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/cashRequisitionItems.singular')])
        );
    }
}
