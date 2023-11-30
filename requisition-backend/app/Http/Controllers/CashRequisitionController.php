<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateCashRequisitionRequest;
use App\Http\Requests\UpdateCashRequisitionRequest;
use App\Repositories\CashRequisitionRepository;
use Illuminate\Http\Request;
use Flash;

class CashRequisitionController extends AppBaseController
{
    /** @var CashRequisitionRepository $cashRequisitionRepository*/
    private $cashRequisitionRepository;

    public function __construct(CashRequisitionRepository $cashRequisitionRepo)
    {
        $this->cashRequisitionRepository = $cashRequisitionRepo;
    }

    /**
     * Display a listing of the CashRequisition.
     */
    public function index(Request $request)
    {
        $cashRequisitions = $this->cashRequisitionRepository->paginate(10);

        return view('cash_requisitions.index')
            ->with('cashRequisitions', $cashRequisitions);
    }

    /**
     * Show the form for creating a new CashRequisition.
     */
    public function create()
    {
        return view('cash_requisitions.create');
    }

    /**
     * Store a newly created CashRequisition in storage.
     */
    public function store(Request $request)
    {
        $input = $request->all();

        $cashRequisition = $this->cashRequisitionRepository->create($input);

        Flash::success(__('messages.saved', ['model' => __('models/cashRequisitions.singular')]));

        return redirect(route('cashRequisitions.index'));
    }

    /**
     * Display the specified CashRequisition.
     */
    public function show($id)
    {
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($cashRequisition)) {
            Flash::error(__('models/cashRequisitions.singular').' '.__('messages.not_found'));

            return redirect(route('cashRequisitions.index'));
        }

        return view('cash_requisitions.show')->with('cashRequisition', $cashRequisition);
    }

    /**
     * Show the form for editing the specified CashRequisition.
     */
    public function edit($id)
    {
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($cashRequisition)) {
            Flash::error(__('models/cashRequisitions.singular').' '.__('messages.not_found'));

            return redirect(route('cashRequisitions.index'));
        }

        return view('cash_requisitions.edit')->with('cashRequisition', $cashRequisition);
    }

    /**
     * Update the specified CashRequisition in storage.
     */
    public function update($id, UpdateCashRequisitionRequest $request)
    {
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($cashRequisition)) {
            Flash::error(__('models/cashRequisitions.singular').' '.__('messages.not_found'));

            return redirect(route('cashRequisitions.index'));
        }

        $cashRequisition = $this->cashRequisitionRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/cashRequisitions.singular')]));

        return redirect(route('cashRequisitions.index'));
    }

    /**
     * Remove the specified CashRequisition from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $cashRequisition = $this->cashRequisitionRepository->find($id);

        if (empty($cashRequisition)) {
            Flash::error(__('models/cashRequisitions.singular').' '.__('messages.not_found'));

            return redirect(route('cashRequisitions.index'));
        }

        $this->cashRequisitionRepository->delete($id);

        Flash::success(__('messages.deleted', ['model' => __('models/cashRequisitions.singular')]));

        return redirect(route('cashRequisitions.index'));
    }
}
