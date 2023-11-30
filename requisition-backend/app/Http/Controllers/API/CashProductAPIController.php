<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateCashProductAPIRequest;
use App\Http\Requests\API\UpdateCashProductAPIRequest;
use App\Models\CashProduct;
use App\Repositories\CashProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\CashProductResource;

/**
 * Class CashProductController
 */

class CashProductAPIController extends AppBaseController
{
    /** @var  CashProductRepository */
    private $cashProductRepository;

    public function __construct(CashProductRepository $cashProductRepo)
    {
        $this->cashProductRepository = $cashProductRepo;
    }

    /**
     * @OA\Get(
     *      path="/cash-products",
     *      summary="getCashProductList",
     *      tags={"CashProduct"},
     *      description="Get all CashProducts",
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
     *                  @OA\Items(ref="#/components/schemas/CashProduct")
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
        $cashProducts = $this->cashProductRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            CashProductResource::collection($cashProducts),
            __('messages.retrieved', ['model' => __('models/cashProducts.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/cash-products",
     *      summary="createCashProduct",
     *      tags={"CashProduct"},
     *      description="Create CashProduct",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/CashProduct")
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
     *                  ref="#/components/schemas/CashProduct"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateCashProductAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $cashProduct = $this->cashProductRepository->create($input);

        return $this->sendResponse(
            new CashProductResource($cashProduct),
            __('messages.saved', ['model' => __('models/cashProducts.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/cash-products/{id}",
     *      summary="getCashProductItem",
     *      tags={"CashProduct"},
     *      description="Get CashProduct",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashProduct",
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
     *                  ref="#/components/schemas/CashProduct"
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
        /** @var CashProduct $cashProduct */
        $cashProduct = $this->cashProductRepository->find($id);

        if (empty($cashProduct)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/cashProducts.singular')])
            );
        }

        return $this->sendResponse(
            new CashProductResource($cashProduct),
            __('messages.retrieved', ['model' => __('models/cashProducts.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/cash-products/{id}",
     *      summary="updateCashProduct",
     *      tags={"CashProduct"},
     *      description="Update CashProduct",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashProduct",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/CashProduct")
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
     *                  ref="#/components/schemas/CashProduct"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateCashProductAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var CashProduct $cashProduct */
        $cashProduct = $this->cashProductRepository->find($id);

        if (empty($cashProduct)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/cashProducts.singular')])
            );
        }

        $cashProduct = $this->cashProductRepository->update($input, $id);

        return $this->sendResponse(
            new CashProductResource($cashProduct),
            __('messages.updated', ['model' => __('models/cashProducts.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/cash-products/{id}",
     *      summary="deleteCashProduct",
     *      tags={"CashProduct"},
     *      description="Delete CashProduct",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of CashProduct",
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
        /** @var CashProduct $cashProduct */
        $cashProduct = $this->cashProductRepository->find($id);

        if (empty($cashProduct)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/cashProducts.singular')])
            );
        }

        $cashProduct->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/cashProducts.singular')])
        );
    }
}
