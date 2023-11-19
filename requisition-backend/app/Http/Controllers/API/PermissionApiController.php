<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreatePermissionAPIRequest;
use App\Http\Requests\API\UpdatePermissionAPIRequest;
use App\Models\Permission;
use App\Repositories\PermissionRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\PermissionResource;

/**
 * Class PermissionController
 */

class PermissionAPIController extends AppBaseController
{
    /** @var  PermissionRepository */
    private $permissionRepository;

    public function __construct(PermissionRepository $permissionRepo)
    {
        $this->permissionRepository = $permissionRepo;
    }

    /**
     * @OA\Get(
     *      path="/permissions",
     *      summary="getPermissionList",
     *      tags={"Permission"},
     *      description="Get all Permissions",
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
     *                  @OA\Items(ref="#/components/schemas/Permission")
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
        $permissions = $this->permissionRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            PermissionResource::collection($permissions),
            __('messages.retrieved', ['model' => __('models/permissions.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/permissions",
     *      summary="createPermission",
     *      tags={"Permission"},
     *      description="Create Permission",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Permission")
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
     *                  ref="#/components/schemas/Permission"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreatePermissionAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $permission = $this->permissionRepository->create($input);

        return $this->sendResponse(
            new PermissionResource($permission),
            __('messages.saved', ['model' => __('models/permissions.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/permissions/{id}",
     *      summary="getPermissionItem",
     *      tags={"Permission"},
     *      description="Get Permission",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Permission",
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
     *                  ref="#/components/schemas/Permission"
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
        /** @var Permission $permission */
        $permission = $this->permissionRepository->find($id);

        if (empty($permission)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/permissions.singular')])
            );
        }

        return $this->sendResponse(
            new PermissionResource($permission),
            __('messages.retrieved', ['model' => __('models/permissions.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/permissions/{id}",
     *      summary="updatePermission",
     *      tags={"Permission"},
     *      description="Update Permission",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Permission",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Permission")
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
     *                  ref="#/components/schemas/Permission"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdatePermissionAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Permission $permission */
        $permission = $this->permissionRepository->find($id);

        if (empty($permission)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/permissions.singular')])
            );
        }

        $permission = $this->permissionRepository->update($input, $id);

        return $this->sendResponse(
            new PermissionResource($permission),
            __('messages.updated', ['model' => __('models/permissions.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/permissions/{id}",
     *      summary="deletePermission",
     *      tags={"Permission"},
     *      description="Delete Permission",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Permission",
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
        /** @var Permission $permission */
        $permission = $this->permissionRepository->find($id);

        if (empty($permission)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/permissions.singular')])
            );
        }

        $permission->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/permissions.singular')])
        );
    }
}
