<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateDesignationRequest;
use App\Http\Requests\UpdateDesignationRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\DesignationRepository;
use Illuminate\Http\Request;
use Flash;

class DesignationController extends AppBaseController
{
    /** @var DesignationRepository $designationRepository*/
    private $designationRepository;

    public function __construct(DesignationRepository $designationRepo)
    {
        $this->designationRepository = $designationRepo;
    }

    /**
     * Display a listing of the Designation.
     */
    public function index(Request $request)
    {
        $designations = $this->designationRepository->paginate(10);

        return view('designations.index')
            ->with('designations', $designations);
    }

    /**
     * Show the form for creating a new Designation.
     */
    public function create()
    {
        return view('designations.create');
    }

    /**
     * Store a newly created Designation in storage.
     */
    public function store(CreateDesignationRequest $request)
    {
        $input = $request->all();

        $designation = $this->designationRepository->create($input);

        Flash::success(__('messages.saved', ['model' => __('models/designations.singular')]));

        return redirect(route('designations.index'));
    }

    /**
     * Display the specified Designation.
     */
    public function show($id)
    {
        $designation = $this->designationRepository->find($id);

        if (empty($designation)) {
            Flash::error(__('models/designations.singular').' '.__('messages.not_found'));

            return redirect(route('designations.index'));
        }

        return view('designations.show')->with('designation', $designation);
    }

    /**
     * Show the form for editing the specified Designation.
     */
    public function edit($id)
    {
        $designation = $this->designationRepository->find($id);

        if (empty($designation)) {
            Flash::error(__('models/designations.singular').' '.__('messages.not_found'));

            return redirect(route('designations.index'));
        }

        return view('designations.edit')->with('designation', $designation);
    }

    /**
     * Update the specified Designation in storage.
     */
    public function update($id, UpdateDesignationRequest $request)
    {
        $designation = $this->designationRepository->find($id);

        if (empty($designation)) {
            Flash::error(__('models/designations.singular').' '.__('messages.not_found'));

            return redirect(route('designations.index'));
        }

        $designation = $this->designationRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/designations.singular')]));

        return redirect(route('designations.index'));
    }

    /**
     * Remove the specified Designation from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $designation = $this->designationRepository->find($id);

        if (empty($designation)) {
            Flash::error(__('models/designations.singular').' '.__('messages.not_found'));

            return redirect(route('designations.index'));
        }

        $this->designationRepository->delete($id);

        Flash::success(__('messages.deleted', ['model' => __('models/designations.singular')]));

        return redirect(route('designations.index'));
    }
}
