<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateUserAPIRequest;
use App\Http\Requests\API\UpdateUserAPIRequest;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\UserResource;

/**
 * Class UserController
 */

class UserAPIController extends AppBaseController
{
    /** @var  UserRepository */
    private $userRepository;

    public function __construct(UserRepository $userRepo)
    {
        $this->userRepository = $userRepo;
    }

    /**
     * @OA\Get(
     *      path="/users",
     *      summary="getUserList",
     *      tags={"User"},
     *      description="Get all Users",
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
     *                  @OA\Items(ref="#/components/schemas/User")
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
        $users = User::whereHas('branches', function($branch){
            $branch->where('id', auth_branch_id());
        })->get();
        return $this->sendResponse(
            UserResource::collection($users),
            __('messages.retrieved', ['model' => __('models/users.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/users",
     *      summary="createUser",
     *      tags={"User"},
     *      description="Create User",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/User")
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
     *                  ref="#/components/schemas/User"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateUserAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $user = $this->userRepository->create($input);
        $user->organizations()->sync($request->organization_id);
        $user->branches()->sync($request->branch_id);
        $user->departments()->sync($request->department_id);
        $user->designations()->sync($request->designation_id);

        return $this->sendResponse(
            new UserResource($user),
            __('messages.saved', ['model' => __('models/users.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/users/{id}",
     *      summary="getUserItem",
     *      tags={"User"},
     *      description="Get User",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of User",
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
     *                  ref="#/components/schemas/User"
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
        /** @var User $user */
        $user = $this->userRepository->find($id);

        if (empty($user)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/users.singular')])
            );
        }

        return $this->sendResponse(
            new UserResource($user),
            __('messages.retrieved', ['model' => __('models/users.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/users/{id}",
     *      summary="updateUser",
     *      tags={"User"},
     *      description="Update User",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of User",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/User")
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
     *                  ref="#/components/schemas/User"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateUserAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var User $user */
        $user = $this->userRepository->find($id);

        if (empty($user)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/users.singular')])
            );
        }
        $user->organizations()->sync($request->organization_id);
        $user->branches()->sync($request->branch_id);
        $user->departments()->sync($request->department_id);
        $user->designations()->sync($request->designation_id);
        $user = $this->userRepository->update($input, $id);

        return $this->sendResponse(
            new UserResource($user),
            __('messages.updated', ['model' => __('models/users.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/users/{id}",
     *      summary="deleteUser",
     *      tags={"User"},
     *      description="Delete User",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of User",
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
        /** @var User $user */
        $user = $this->userRepository->find($id);

        if (empty($user)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/users.singular')])
            );
        }

        $user->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/users.singular')])
        );
    }
}