<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateMeasurementUnitRequest;
use App\Http\Requests\UpdateMeasurementUnitRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\MeasurementUnitRepository;
use Illuminate\Http\Request;
use Flash;

class MeasurementUnitController extends AppBaseController
{
    /** @var MeasurementUnitRepository $measurementUnitRepository*/
    private $measurementUnitRepository;

    public function __construct(MeasurementUnitRepository $measurementUnitRepo)
    {
        $this->measurementUnitRepository = $measurementUnitRepo;
    }

    /**
     * Display a listing of the MeasurementUnit.
     */
    public function index(Request $request)
    {
        $measurementUnits = $this->measurementUnitRepository->paginate(10);

        return view('measurement_units.index')
            ->with('measurementUnits', $measurementUnits);
    }

    /**
     * Show the form for creating a new MeasurementUnit.
     */
    public function create()
    {
        return view('measurement_units.create');
    }

    /**
     * Store a newly created MeasurementUnit in storage.
     */
    public function store(CreateMeasurementUnitRequest $request)
    {
        $input = $request->all();

        $measurementUnit = $this->measurementUnitRepository->create($input);

        Flash::success(__('messages.saved', ['model' => __('models/measurementUnits.singular')]));

        return redirect(route('measurementUnits.index'));
    }

    /**
     * Display the specified MeasurementUnit.
     */
    public function show($id)
    {
        $measurementUnit = $this->measurementUnitRepository->find($id);

        if (empty($measurementUnit)) {
            Flash::error(__('models/measurementUnits.singular').' '.__('messages.not_found'));

            return redirect(route('measurementUnits.index'));
        }

        return view('measurement_units.show')->with('measurementUnit', $measurementUnit);
    }

    /**
     * Show the form for editing the specified MeasurementUnit.
     */
    public function edit($id)
    {
        $measurementUnit = $this->measurementUnitRepository->find($id);

        if (empty($measurementUnit)) {
            Flash::error(__('models/measurementUnits.singular').' '.__('messages.not_found'));

            return redirect(route('measurementUnits.index'));
        }

        return view('measurement_units.edit')->with('measurementUnit', $measurementUnit);
    }

    /**
     * Update the specified MeasurementUnit in storage.
     */
    public function update($id, UpdateMeasurementUnitRequest $request)
    {
        $measurementUnit = $this->measurementUnitRepository->find($id);

        if (empty($measurementUnit)) {
            Flash::error(__('models/measurementUnits.singular').' '.__('messages.not_found'));

            return redirect(route('measurementUnits.index'));
        }

        $measurementUnit = $this->measurementUnitRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/measurementUnits.singular')]));

        return redirect(route('measurementUnits.index'));
    }

    /**
     * Remove the specified MeasurementUnit from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $measurementUnit = $this->measurementUnitRepository->find($id);

        if (empty($measurementUnit)) {
            Flash::error(__('models/measurementUnits.singular').' '.__('messages.not_found'));

            return redirect(route('measurementUnits.index'));
        }

        $this->measurementUnitRepository->delete($id);

        Flash::success(__('messages.deleted', ['model' => __('models/measurementUnits.singular')]));

        return redirect(route('measurementUnits.index'));
    }
}
