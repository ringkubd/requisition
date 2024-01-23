<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateDepartmentAPIRequest;
use App\Http\Requests\API\UpdateDepartmentAPIRequest;
use App\Models\Department;
use App\Repositories\DepartmentRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\DepartmentResource;

/**
 * Class DepartmentController
 */

class DepartmentAPIController extends AppBaseController
{
    /** @var  DepartmentRepository */
    private $departmentRepository;

    public function __construct(DepartmentRepository $departmentRepo)
    {
        $this->departmentRepository = $departmentRepo;

        $this->middleware('auth:sanctum');
//        $this->middleware('role_or_permission:Super Admin|view_departments', ['only' => ['index']]);
        $this->middleware('role_or_permission:Super Admin|update_departments', ['only' => ['show', 'update']]);
        $this->middleware('role_or_permission:Super Admin|create_departments', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_departments', ['only' => ['delete']]);
    }

    /**
     * @OA\Get(
     *      path="/departments",
     *      summary="getDepartmentList",
     *      tags={"Department"},
     *      description="Get all Departments",
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
     *                  @OA\Items(ref="#/components/schemas/Department")
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
        $departments = $this->departmentRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            DepartmentResource::collection($departments),
            __('messages.retrieved', ['model' => __('models/departments.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/departments",
     *      summary="createDepartment",
     *      tags={"Department"},
     *      description="Create Department",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Department")
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
     *                  ref="#/components/schemas/Department"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateDepartmentAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $department = $this->departmentRepository->create($input);

        return $this->sendResponse(
            new DepartmentResource($department),
            __('messages.saved', ['model' => __('models/departments.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/departments/{id}",
     *      summary="getDepartmentItem",
     *      tags={"Department"},
     *      description="Get Department",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Department",
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
     *                  ref="#/components/schemas/Department"
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
        /** @var Department $department */
        $department = $this->departmentRepository->find($id);

        if (empty($department)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/departments.singular')])
            );
        }

        return $this->sendResponse(
            new DepartmentResource($department),
            __('messages.retrieved', ['model' => __('models/departments.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/departments/{id}",
     *      summary="updateDepartment",
     *      tags={"Department"},
     *      description="Update Department",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Department",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Department")
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
     *                  ref="#/components/schemas/Department"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateDepartmentAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Department $department */
        $department = $this->departmentRepository->find($id);

        if (empty($department)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/departments.singular')])
            );
        }

        $department = $this->departmentRepository->update($input, $id);

        return $this->sendResponse(
            new DepartmentResource($department),
            __('messages.updated', ['model' => __('models/departments.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/departments/{id}",
     *      summary="deleteDepartment",
     *      tags={"Department"},
     *      description="Delete Department",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Department",
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
        /** @var Department $department */
        $department = $this->departmentRepository->find($id);

        if (empty($department)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/departments.singular')])
            );
        }

        $department->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/departments.singular')])
        );
    }

    public function getDepartmentByBranchOrganization(Request $request){
        $organization = $request->organization_id ?? auth_organization_id();
        $branch = $request->branch_id ?? auth_branch_id();
        $departments = DepartmentResource::collection(Department::where('organization_id', $organization)->where('branch_id', $branch)->get());
        return $this->sendResponse(
            $departments,
            __('messages.deleted', ['model' => __('models/departments.plurals')])
        );
    }
}
