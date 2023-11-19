<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateCountryAPIRequest;
use App\Http\Requests\API\UpdateCountryAPIRequest;
use App\Models\Country;
use App\Repositories\CountryRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\CountryResource;

/**
 * Class CountryController
 */

class CountryAPIController extends AppBaseController
{
    /** @var  CountryRepository */
    private $countryRepository;

    public function __construct(CountryRepository $countryRepo)
    {
        $this->countryRepository = $countryRepo;
    }

    /**
     * @OA\Get(
     *      path="/countries",
     *      summary="getCountryList",
     *      tags={"Country"},
     *      description="Get all Countries",
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
     *                  @OA\Items(ref="#/components/schemas/Country")
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
        $countries = $this->countryRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            CountryResource::collection($countries),
            __('messages.retrieved', ['model' => __('models/countries.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/countries",
     *      summary="createCountry",
     *      tags={"Country"},
     *      description="Create Country",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Country")
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
     *                  ref="#/components/schemas/Country"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateCountryAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $country = $this->countryRepository->create($input);

        return $this->sendResponse(
            new CountryResource($country),
            __('messages.saved', ['model' => __('models/countries.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/countries/{id}",
     *      summary="getCountryItem",
     *      tags={"Country"},
     *      description="Get Country",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Country",
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
     *                  ref="#/components/schemas/Country"
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
        /** @var Country $country */
        $country = $this->countryRepository->find($id);

        if (empty($country)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/countries.singular')])
            );
        }

        return $this->sendResponse(
            new CountryResource($country),
            __('messages.retrieved', ['model' => __('models/countries.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/countries/{id}",
     *      summary="updateCountry",
     *      tags={"Country"},
     *      description="Update Country",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Country",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Country")
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
     *                  ref="#/components/schemas/Country"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateCountryAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Country $country */
        $country = $this->countryRepository->find($id);

        if (empty($country)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/countries.singular')])
            );
        }

        $country = $this->countryRepository->update($input, $id);

        return $this->sendResponse(
            new CountryResource($country),
            __('messages.updated', ['model' => __('models/countries.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/countries/{id}",
     *      summary="deleteCountry",
     *      tags={"Country"},
     *      description="Delete Country",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Country",
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
        /** @var Country $country */
        $country = $this->countryRepository->find($id);

        if (empty($country)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/countries.singular')])
            );
        }

        $country->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/countries.singular')])
        );
    }
}
