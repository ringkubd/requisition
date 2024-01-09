<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateUserAPIRequest;
use App\Http\Requests\API\UpdateUserAPIRequest;
use App\Models\OneTimeLogin;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

//        $this->middleware('auth:sanctum');
//        $this->middleware('role_or_permission:Super Admin|view_users', ['only' => ['index']]);
//        $this->middleware('role_or_permission:Super Admin|update_users', ['only' => ['show', 'update']]);
        $this->middleware('role_or_permission:Super Admin|create_users', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_users', ['only' => ['delete']]);
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
        $user = \request()->user();
        $user->can('Super Admin');
        $users = User::query()
            ->whereHas('branches', function($branch) use ($request, $user){
                $branch->when($request->branch_id, function ($q) use ($request){
                    $q->where('id', $request->branch_id);
                }, function ($q){
                    $q->where('id', auth_branch_id());
                });
            })
            ->whereHas('departments', function ($department)use ($request, $user){
                $department->when($request->department_id, function ($q, $d){
                    $q->where('id', $d);
                }, function ($q){
                    $q->where('id', auth_department_id());
                });
            })
            ->get();
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

        if ($request->default_department_id === "" or $request->default_department_id == null){
            $input['default_department_id'] = $request->department_id[0];
        }
        if ($request->default_branch_id === "" or $request->default_branch_id == null){
            $input['default_branch_id'] = $request->branch_id[0];
        }
        if ($request->default_organization_id === "" or $request->default_organization_id == null){
            $input['default_organization_id'] = $request->organization_id[0];
        }

        $user = $this->userRepository->create($input);
        $user->organizations()->sync($request->organization_id);
        $user->branches()->sync($request->branch_id);
        $user->departments()->sync($request->department_id);
        $user->designations()->sync($request->designation_id);

        if ($request->has('roles')){
            $user->roles()->sync($request->roles);
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
        }

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
        if ($request->has('organization_id')){
            $user->organizations()->sync($request->organization_id);
        }
        if ($request->has('branch_id')){
            $user->branches()->sync($request->branch_id);
        }
        if ($request->has('department_id')){
            $user->departments()->sync($request->department_id);
        }
        if ($request->has('designation_id')){
            $user->designations()->sync($request->designation_id);
        }

        if ($request->has('default_department_id') && ($request->default_department_id === "" or $request->default_department_id == null)){
            $input['default_department_id'] = $request->department_id[0];
        }
        if ($request->has('default_branch_id') && ($request->default_branch_id === "" or $request->default_branch_id == null)){
            $input['default_branch_id'] = $request->branch_id[0];
        }
        if ($request->has('default_branch_id') && ($request->default_organization_id === "" or $request->default_organization_id == null)){
            $input['default_organization_id'] = $request->organization_id[0];
        }

        if ($request->has('roles')){
            $user->roles()->sync($request->roles);
        }
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

    public function userByBranch(){

    }

    public function oneTimeLogin(Request $request){
        if ($request->has('auth_key')){
            $tokenExist = OneTimeLogin::where('auth_key', $request->auth_key)->with('user')->first();
            if (!empty($tokenExist)){
                $user = User::find($tokenExist->user_id);
                Auth::login($user);
                $token = $user->createToken($tokenExist->user_id);
                return response()->json([
                    'token' => $token->plainTextToken,
                    'user' => new UserResource(auth()->user())
                ]);
            }
        }
    }
}
