<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateInitialRequisitionRequest;
use App\Http\Requests\UpdateInitialRequisitionRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\InitialRequisitionRepository;
use Illuminate\Http\Request;
use Flash;

class InitialRequisitionController extends AppBaseController
{
    /** @var InitialRequisitionRepository $initialRequisitionRepository*/
    private $initialRequisitionRepository;

    public function __construct(InitialRequisitionRepository $initialRequisitionRepo)
    {
        $this->initialRequisitionRepository = $initialRequisitionRepo;
    }

    /**
     * Display a listing of the InitialRequisition.
     */
    public function index(Request $request)
    {
        $initialRequisitions = $this->initialRequisitionRepository->paginate(10);

        return view('initial_requisitions.index')
            ->with('initialRequisitions', $initialRequisitions);
    }

    /**
     * Show the form for creating a new InitialRequisition.
     */
    public function create()
    {
        return view('initial_requisitions.create');
    }

    /**
     * Store a newly created InitialRequisition in storage.
     */
    public function store(CreateInitialRequisitionRequest $request)
    {
        $input = $request->all();

        $initialRequisition = $this->initialRequisitionRepository->create($input);

        Flash::success(__('messages.saved', ['model' => __('models/initialRequisitions.singular')]));

        return redirect(route('initialRequisitions.index'));
    }

    /**
     * Display the specified InitialRequisition.
     */
    public function show($id)
    {
        $initialRequisition = $this->initialRequisitionRepository->find($id);

        if (empty($initialRequisition)) {
            Flash::error(__('models/initialRequisitions.singular').' '.__('messages.not_found'));

            return redirect(route('initialRequisitions.index'));
        }

        return view('initial_requisitions.show')->with('initialRequisition', $initialRequisition);
    }

    /**
     * Show the form for editing the specified InitialRequisition.
     */
    public function edit($id)
    {
        $initialRequisition = $this->initialRequisitionRepository->find($id);

        if (empty($initialRequisition)) {
            Flash::error(__('models/initialRequisitions.singular').' '.__('messages.not_found'));

            return redirect(route('initialRequisitions.index'));
        }

        return view('initial_requisitions.edit')->with('initialRequisition', $initialRequisition);
    }

    /**
     * Update the specified InitialRequisition in storage.
     */
    public function update($id, UpdateInitialRequisitionRequest $request)
    {
        $initialRequisition = $this->initialRequisitionRepository->find($id);

        if (empty($initialRequisition)) {
            Flash::error(__('models/initialRequisitions.singular').' '.__('messages.not_found'));

            return redirect(route('initialRequisitions.index'));
        }

        $initialRequisition = $this->initialRequisitionRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/initialRequisitions.singular')]));

        return redirect(route('initialRequisitions.index'));
    }

    /**
     * Remove the specified InitialRequisition from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $initialRequisition = $this->initialRequisitionRepository->find($id);

        if (empty($initialRequisition)) {
            Flash::error(__('models/initialRequisitions.singular').' '.__('messages.not_found'));

            return redirect(route('initialRequisitions.index'));
        }

        $this->initialRequisitionRepository->delete($id);

        Flash::success(__('messages.deleted', ['model' => __('models/initialRequisitions.singular')]));

        return redirect(route('initialRequisitions.index'));
    }
}
