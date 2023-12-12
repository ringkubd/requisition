<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateCashRequisitionAPIRequest;
use App\Http\Requests\API\UpdateCashRequisitionAPIRequest;
use App\Models\CashRequisition;
use App\Repositories\CashRequisitionRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\CashRequisitionResource;
use OpenApi\Annotations as OA;

/**
 * Class CashRequisitionController
 */

class CashRequisitionAPIController extends AppBaseController
{
    /** @var  CashRequisitionRepository */
    private $cashRequisitionRepository;

    public function __construct(CashRequisitionRepository $cashRequisitionRepo)
    {
        $this->cashRequisitionRepository = $cashRequisitionRepo;
    }

    /**
     * @OA\Get(
     *      path="/cash-requisitions",
     *      summary="getCashRequisitionList",
     *      tags={"CashRequisition"},
     *      description="Get all CashRequisitions",
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
     *                  @OA\Items(ref="#/components/schemas/CashRequisition")
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
        $cashRequisitions = $this->cashRequisitionRepository->allQuery(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        )
            ->when($request->date, function ($q, $date){
                $q->whereRaw("date(created_at) = '$date'");
            })
            ->latest()
            ->get();

        return $this->sendResponse(
            CashRequisitionResource::collection($cashRequisitions),
            __('messages.retrieved', ['model' => __('models/cashRequisitions.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/cash-requisitions",
     *      summary="createCashRequisition",
     *      tags={"CashRequisition"},
     *      description="Create CashRequisition",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/CashRequisition")
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
     *                  ref="#/components/schemas/CashRequisition"
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
        $prf_no = $this->newPRFNO();
        $cashRequisition = $this->cashRequisitionRepository->create([
            'ir_no' => 5,
            'prf_no' => $prf_no,
            'total_cost' => collect($input)->sum('cost'),
            'user_id' => $request->user()->id,
            'branch_id' => auth_branch_id(),
            'department_id' => auth_department_id()
        ]);
        $newItems =collect($input)->map(function ($a) {
            return collect($a)->except(['cost']);
        });
        $cashRequisition->cashRequisitionItems()->createMany($newItems->toArray());
        $cashRequisition->prfNOS()->create([
            'prf_no' => $prf_no,
            'total' => collect($input)->sum('cost')
        ]);

        return $this->sendResponse(
            new CashRequisitionResource($cashRequisition),
            __('messages.saved', ['model' => __('models/cashRequisitions.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/cash-requisitions/{id}",
     *      summary="getCashRequisitionItem",
     *      tags={"CashRequisition"},
     *      description="Get CashRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashRequisition",
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
     *                  ref="#/components/schemas/CashRequisition"
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
        /** @var CashRequisition $cashRequisition */
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($cashRequisition)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/cashRequisitions.singular')])
            );
        }

        return $this->sendResponse(
            new CashRequisitionResource($cashRequisition),
            __('messages.retrieved', ['model' => __('models/cashRequisitions.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/cash-requisitions/{id}",
     *      summary="updateCashRequisition",
     *      tags={"CashRequisition"},
     *      description="Update CashRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashRequisition",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/CashRequisition")
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
     *                  ref="#/components/schemas/CashRequisition"
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
        $input = $request->all();

        /** @var CashRequisition $cashRequisition */
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($cashRequisition)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/cashRequisitions.singular')])
            );
        }

        $cashRequisition = $this->cashRequisitionRepository->update([
            'total_cost' => collect($input)->sum('cost')
        ], $id);

        $newItems =collect($input)->map(function ($a) {
            return collect($a)->except(['cost']);
        });

        if ($cashRequisition){
            $cashRequisition->cashRequisitionItems()->delete();
            $cashRequisition->cashRequisitionItems()->createMany($newItems->toArray());
        }

        return $this->sendResponse(
            new CashRequisitionResource($cashRequisition),
            __('messages.updated', ['model' => __('models/cashRequisitions.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/cash-requisitions/{id}",
     *      summary="deleteCashRequisition",
     *      tags={"CashRequisition"},
     *      description="Delete CashRequisition",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashRequisition",
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
        /** @var CashRequisition $cashRequisition */
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($cashRequisition)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/cashRequisitions.singular')])
            );
        }

        $cashRequisition->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/cashRequisitions.singular')])
        );
    }
}
