<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateBranchAPIRequest;
use App\Http\Requests\API\UpdateBranchAPIRequest;
use App\Models\Branch;
use App\Repositories\BranchRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\BranchResource;

/**
 * Class BranchController
 */

class BranchAPIController extends AppBaseController
{
    /** @var  BranchRepository */
    private $branchRepository;

    public function __construct(BranchRepository $branchRepo)
    {
        $this->branchRepository = $branchRepo;
        $this->middleware('auth:sanctum');
        $this->middleware('role_or_permission:Super Admin|view_branches', ['only' => ['index']]);
        $this->middleware('role_or_permission:Super Admin|update_branches', ['only' => ['show', 'update']]);
        $this->middleware('role_or_permission:Super Admin|create_branches', ['only' => ['store']]);
        $this->middleware('role_or_permission:Super Admin|delete_branches', ['only' => ['delete']]);
    }

    /**
     * @OA\Get(
     *      path="/branches",
     *      summary="getBranchList",
     *      tags={"Branch"},
     *      description="Get all Branches",
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
     *                  @OA\Items(ref="#/components/schemas/Branch")
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
        $branches = $this->branchRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse(
            BranchResource::collection($branches),
            __('messages.retrieved', ['model' => __('models/branches.plural')])
        );
    }

    /**
     * @OA\Post(
     *      path="/branches",
     *      summary="createBranch",
     *      tags={"Branch"},
     *      description="Create Branch",
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Branch")
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
     *                  ref="#/components/schemas/Branch"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function store(CreateBranchAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $branch = $this->branchRepository->create($input);

        return $this->sendResponse(
            new BranchResource($branch),
            __('messages.saved', ['model' => __('models/branches.singular')])
        );
    }

    /**
     * @OA\Get(
     *      path="/branches/{id}",
     *      summary="getBranchItem",
     *      tags={"Branch"},
     *      description="Get Branch",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Branch",
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
     *                  ref="#/components/schemas/Branch"
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
        /** @var Branch $branch */
        $branch = $this->branchRepository->find($id);

        if (empty($branch)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/branches.singular')])
            );
        }

        return $this->sendResponse(
            new BranchResource($branch),
            __('messages.retrieved', ['model' => __('models/branches.singular')])
        );
    }

    /**
     * @OA\Put(
     *      path="/branches/{id}",
     *      summary="updateBranch",
     *      tags={"Branch"},
     *      description="Update Branch",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Branch",
     *           @OA\Schema(
     *             type="integer"
     *          ),
     *          required=true,
     *          in="path"
     *      ),
     *      @OA\RequestBody(
     *        required=true,
     *        @OA\JsonContent(ref="#/components/schemas/Branch")
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
     *                  ref="#/components/schemas/Branch"
     *              ),
     *              @OA\Property(
     *                  property="message",
     *                  type="string"
     *              )
     *          )
     *      )
     * )
     */
    public function update($id, UpdateBranchAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Branch $branch */
        $branch = $this->branchRepository->find($id);

        if (empty($branch)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/branches.singular')])
            );
        }

        $branch = $this->branchRepository->update($input, $id);

        return $this->sendResponse(
            new BranchResource($branch),
            __('messages.updated', ['model' => __('models/branches.singular')])
        );
    }

    /**
     * @OA\Delete(
     *      path="/branches/{id}",
     *      summary="deleteBranch",
     *      tags={"Branch"},
     *      description="Delete Branch",
     *      @OA\Parameter(
     *          name="id",
     *          description="id of Branch",
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
        /** @var Branch $branch */
        $branch = $this->branchRepository->find($id);

        if (empty($branch)) {
            return $this->sendError(
                __('messages.not_found', ['model' => __('models/branches.singular')])
            );
        }

        $branch->delete();

        return $this->sendResponse(
            $id,
            __('messages.deleted', ['model' => __('models/branches.singular')])
        );
    }
}
