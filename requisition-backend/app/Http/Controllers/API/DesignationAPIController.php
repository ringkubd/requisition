<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateDesignationAPIRequest;
use App\Http\Requests\API\UpdateDesignationAPIRequest;
use App\Models\Designation;
use App\Repositories\DesignationRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\DesignationResource;

/**
 * Class DesignationController
 */

class DesignationAPIController extends AppBaseController
{
    /** @var  DesignationRepository */
    private $designationRepository;

    public function __construct(DesignationRepository $designationRepo)
    {
        $this->designationRepository = $designationRepo;
        $this->middleware('auth:sanctum');
//        $this->middleware('role_or_permission:Super Admin|view_designations', ['only' => ['index']]);
        $this->middleware('role_or_permission:Super Admin|update_designations', ['only' => ['show', 'update']]);
        $this->middleware('role_or_permission:Super Admin|create_designations', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_designations', ['only' => ['delete']]);
    }

    /**
     * @OA\Get(
     *      path="/designations",
     *      summary="getDesignationList",
     *      tags={"Designation"},
     *      description="Get all Designations",
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
     *                  @OA\Items(ref="#/components/schemas/Designation")
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
        $designations = $this->designationRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            DesignationResource::collection($designations),
            __('messages.retrieved', ['model' => __('models/designations.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/designations",
     *      summary="createDesignation",
     *      tags={"Designation"},
     *      description="Create Designation",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Designation")
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
     *                  ref="#/components/schemas/Designation"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateDesignationAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $designation = $this->designationRepository->create($input);

        return $this->sendResponse(
            new DesignationResource($designation),
            __('messages.saved', ['model' => __('models/designations.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/designations/{id}",
     *      summary="getDesignationItem",
     *      tags={"Designation"},
     *      description="Get Designation",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Designation",
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
     *                  ref="#/components/schemas/Designation"
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
        /** @var Designation $designation */
        $designation = $this->designationRepository->find($id);

        if (empty($designation)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/designations.singular')])
            );
        }

        return $this->sendResponse(
            new DesignationResource($designation),
            __('messages.retrieved', ['model' => __('models/designations.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/designations/{id}",
     *      summary="updateDesignation",
     *      tags={"Designation"},
     *      description="Update Designation",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Designation",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Designation")
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
     *                  ref="#/components/schemas/Designation"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateDesignationAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Designation $designation */
        $designation = $this->designationRepository->find($id);

        if (empty($designation)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/designations.singular')])
            );
        }

        $designation = $this->designationRepository->update($input, $id);

        return $this->sendResponse(
            new DesignationResource($designation),
            __('messages.updated', ['model' => __('models/designations.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/designations/{id}",
     *      summary="deleteDesignation",
     *      tags={"Designation"},
     *      description="Delete Designation",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Designation",
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
        /** @var Designation $designation */
        $designation = $this->designationRepository->find($id);

        if (empty($designation)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/designations.singular')])
            );
        }

        $designation->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/designations.singular')])
        );
    }

    public function getDesignationByBranchOrganization(Request $request){
        $departments = DesignationResource::collection(Designation::where('organization_id', $request->organization_id)->where('branch_id', $request->branch_id)->get());
        return $this->sendResponse(
            $departments,
            __('messages.deleted', ['model' => __('models/designations.plurals')])
        );
    }
}
