<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\CreateOptionAPIRequest;
use App\Http\Requests\API\UpdateOptionAPIRequest;
use App\Models\Option;
use App\Repositories\OptionRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;

/**
 * Class OptionAPIController
 */
class OptionAPIController extends AppBaseController
{
    private OptionRepository $optionRepository;

    public function __construct(OptionRepository $optionRepo)
    {
        $this->optionRepository = $optionRepo;
    }

    /**
     * Display a listing of the Options.
     * GET|HEAD /options
     */
    public function index(Request $request): JsonResponse
    {
        $options = $this->optionRepository->all(
            $request->except(['skip', 'limit']),
            $request->get('skip'),
            $request->get('limit')
        );

        return $this->sendResponse($options->toArray(), 'Options retrieved successfully');
    }

    /**
     * Store a newly created Option in storage.
     * POST /options
     */
    public function store(CreateOptionAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        $option = $this->optionRepository->create($input);

        return $this->sendResponse($option->toArray(), 'Option saved successfully');
    }

    /**
     * Display the specified Option.
     * GET|HEAD /options/{id}
     */
    public function show($id): JsonResponse
    {
        /** @var Option $option */
        $option = $this->optionRepository->find($id);

        if (empty($option)) {
            return $this->sendError('Option not found');
        }

        return $this->sendResponse($option->toArray(), 'Option retrieved successfully');
    }

    /**
     * Update the specified Option in storage.
     * PUT/PATCH /options/{id}
     */
    public function update($id, UpdateOptionAPIRequest $request): JsonResponse
    {
        $input = $request->all();

        /** @var Option $option */
        $option = $this->optionRepository->find($id);

        if (empty($option)) {
            return $this->sendError('Option not found');
        }

        $option = $this->optionRepository->update($input, $id);

        return $this->sendResponse($option->toArray(), 'Option updated successfully');
    }

    /**
     * Remove the specified Option from storage.
     * DELETE /options/{id}
     *
     * @throws \Exception
     */
    public function destroy($id): JsonResponse
    {
        /** @var Option $option */
        $option = $this->optionRepository->find($id);

        if (empty($option)) {
            return $this->sendError('Option not found');
        }

        $option->delete();

        return $this->sendSuccess('Option deleted successfully');
    }
}
