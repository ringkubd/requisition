<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateBrandAPIRequest;
use App\Http\Requests\API\UpdateBrandAPIRequest;
use App\Models\Brand;
use App\Repositories\BrandRepository;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\BrandResource;

/**
 * Class BrandController
 */

class BrandAPIController extends AppBaseController
{
    /** @var  BrandRepository */
    private $brandRepository;

    public function __construct(BrandRepository $brandRepo)
    {
        $this->brandRepository = $brandRepo;
    }

    /**
     * @OA\Get(
     *      path="/brands",
     *      summary="getBrandList",
     *      tags={"Brand"},
     *      description="Get all Brands",
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
     *                  @OA\Items(ref="#/components/schemas/Brand")
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
        $brands = $this->brandRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            BrandResource::collection($brands),
            __('messages.retrieved', ['model' => __('models/brands.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/brands",
     *      summary="createBrand",
     *      tags={"Brand"},
     *      description="Create Brand",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Brand")
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
     *                  ref="#/components/schemas/Brand"
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
            $logo->move(public_path('brands_logo'), "$name");
            $input['logo'] = url("/brands_logo/$name");
        };
        $brand = $this->brandRepository->create($input);

        return $this->sendResponse(
            new BrandResource($brand),
            __('messages.saved', ['model' => __('models/brands.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/brands/{id}",
     *      summary="getBrandItem",
     *      tags={"Brand"},
     *      description="Get Brand",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Brand",
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
     *                  ref="#/components/schemas/Brand"
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
        /** @var Brand $brand */
        $brand = $this->brandRepository->find($id);

        if (empty($brand)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/brands.singular')])
            );
        }

        return $this->sendResponse(
            new BrandResource($brand),
            __('messages.retrieved', ['model' => __('models/brands.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/brands/{id}",
     *      summary="updateBrand",
     *      tags={"Brand"},
     *      description="Update Brand",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Brand",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Brand")
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
     *                  ref="#/components/schemas/Brand"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateBrandAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Brand $brand */
        $brand = $this->brandRepository->find($id);

        if (empty($brand)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/brands.singular')])
            );
        }

        $brand = $this->brandRepository->update($input, $id);

        return $this->sendResponse(
            new BrandResource($brand),
            __('messages.updated', ['model' => __('models/brands.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/brands/{id}",
     *      summary="deleteBrand",
     *      tags={"Brand"},
     *      description="Delete Brand",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Brand",
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
        /** @var Brand $brand */
        $brand = $this->brandRepository->find($id);

        if (empty($brand)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/brands.singular')])
            );
        }

        $brand->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/brands.singular')])
        );
    }
}
