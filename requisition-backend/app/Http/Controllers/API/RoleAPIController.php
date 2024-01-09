<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateRoleAPIRequest;
use App\Http\Requests\API\UpdateRoleAPIRequest;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use App\Models\Role;
use App\Repositories\RoleRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\RoleResource;

/**
 * Class RoleController
 */

class RoleAPIController extends AppBaseController
{
    /** @var  RoleRepository */
    private $roleRepository;

    public function __construct(RoleRepository $roleRepo)
    {
        $this->roleRepository = $roleRepo;

        $this->middleware('auth:sanctum');
//        $this->middleware('role_or_permission:Super Admin|view_roles', ['only' => ['index']]);
        $this->middleware('role_or_permission:Super Admin|update_roles', ['only' => ['show', 'update']]);
        $this->middleware('role_or_permission:Super Admin|create_roles', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_roles', ['only' => ['delete']]);
    }

    /**
     * @OA\Get(
     *      path="/roles",
     *      summary="getRoleList",
     *      tags={"Role"},
     *      description="Get all Roles",
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
     *                  @OA\Items(ref="#/components/schemas/Role")
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
        $roles = $this->roleRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            RoleResource::collection($roles),
            __('messages.retrieved', ['model' => __('models/roles.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/roles",
     *      summary="createRole",
     *      tags={"Role"},
     *      description="Create Role",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Role")
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
     *                  ref="#/components/schemas/Role"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateRoleAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $role = $this->roleRepository->create($input);

        return $this->sendResponse(
            new RoleResource($role),
            __('messages.saved', ['model' => __('models/roles.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/roles/{id}",
     *      summary="getRoleItem",
     *      tags={"Role"},
     *      description="Get Role",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Role",
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
     *                  ref="#/components/schemas/Role"
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
        /** @var Role $role */
        $role = $this->roleRepository->find($id);

        if (empty($role)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/roles.singular')])
            );
        }

        return $this->sendResponse(
            new RoleResource($role),
            __('messages.retrieved', ['model' => __('models/roles.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/roles/{id}",
     *      summary="updateRole",
     *      tags={"Role"},
     *      description="Update Role",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Role",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Role")
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
     *                  ref="#/components/schemas/Role"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateRoleAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Role $role */
        $role = $this->roleRepository->find($id);

        if (empty($role)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/roles.singular')])
            );
        }

        $role = $this->roleRepository->update($input, $id);

        return $this->sendResponse(
            new RoleResource($role),
            __('messages.updated', ['model' => __('models/roles.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/roles/{id}",
     *      summary="deleteRole",
     *      tags={"Role"},
     *      description="Delete Role",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Role",
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
        /** @var Role $role */
        $role = $this->roleRepository->find($id);

        if (empty($role)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/roles.singular')])
            );
        }

        $role->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/roles.singular')])
        );
    }

    public function permissions(){
        $permissions = Permission::all()->groupBy('module');
        return $this->sendResponse(
            $permissions,
            __('messages.updated', ['model' => __('models/roles.singular')])
        );
    }

    public function rolePermissionUpdate(Role $role, Request $request){
        if ($request->update_type == "attach"){
            $role->permissions()->attach($request->permission);
        }else{
            $role->permissions()->detach($request->permission);
        }
        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
        return $this->sendResponse(
            new RoleResource($role),
            __('messages.updated', ['model' => __('models/roles.singular')])
        );
    }
}
