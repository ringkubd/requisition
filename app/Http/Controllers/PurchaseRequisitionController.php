<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePurchaseRequisitionRequest;
use App\Http\Requests\UpdatePurchaseRequisitionRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\PurchaseRequisitionRepository;
use Illuminate\Http\Request;
use Flash;

class PurchaseRequisitionController extends AppBaseController
{
    /** @var PurchaseRequisitionRepository $purchaseRequisitionRepository*/
    private $purchaseRequisitionRepository;

    public function __construct(PurchaseRequisitionRepository $purchaseRequisitionRepo)
    {
        $this->purchaseRequisitionRepository = $purchaseRequisitionRepo;
    }

    /**
     * Display a listing of the PurchaseRequisition.
     */
    public function index(Request $request)
    {
        $purchaseRequisitions = $this->purchaseRequisitionRepository->paginate(10);

        return view('purchase_requisitions.index')
            ->with('purchaseRequisitions', $purchaseRequisitions);
    }

    /**
     * Show the form for creating a new PurchaseRequisition.
     */
    public function create()
    {
        return view('purchase_requisitions.create');
    }

    /**
     * Store a newly created PurchaseRequisition in storage.
     */
    public function store(CreatePurchaseRequisitionRequest $request)
    {
        $input = $request->all();

        $purchaseRequisition = $this->purchaseRequisitionRepository->create($input);

        Flash::success(__('messages.saved', ['model' => __('models/purchaseRequisitions.singular')]));

        return redirect(route('purchaseRequisitions.index'));
    }

    /**
     * Display the specified PurchaseRequisition.
     */
    public function show($id)
    {
        $purchaseRequisition = $this->purchaseRequisitionRepository->find($id);

        if (empty($purchaseRequisition)) {
            Flash::error(__('models/purchaseRequisitions.singular').' '.__('messages.not_found'));

            return redirect(route('purchaseRequisitions.index'));
        }

        return view('purchase_requisitions.show')->with('purchaseRequisition', $purchaseRequisition);
    }

    /**
     * Show the form for editing the specified PurchaseRequisition.
     */
    public function edit($id)
    {
        $purchaseRequisition = $this->purchaseRequisitionRepository->find($id);

        if (empty($purchaseRequisition)) {
            Flash::error(__('models/purchaseRequisitions.singular').' '.__('messages.not_found'));

            return redirect(route('purchaseRequisitions.index'));
        }

        return view('purchase_requisitions.edit')->with('purchaseRequisition', $purchaseRequisition);
    }

    /**
     * Update the specified PurchaseRequisition in storage.
     */
    public function update($id, UpdatePurchaseRequisitionRequest $request)
    {
        $purchaseRequisition = $this->purchaseRequisitionRepository->find($id);

        if (empty($purchaseRequisition)) {
            Flash::error(__('models/purchaseRequisitions.singular').' '.__('messages.not_found'));

            return redirect(route('purchaseRequisitions.index'));
        }

        $purchaseRequisition = $this->purchaseRequisitionRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/purchaseRequisitions.singular')]));

        return redirect(route('purchaseRequisitions.index'));
    }

    /**
     * Remove the specified PurchaseRequisition from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $purchaseRequisition = $this->purchaseRequisitionRepository->find($id);

        if (empty($purchaseRequisition)) {
            Flash::error(__('models/purchaseRequisitions.singular').' '.__('messages.not_found'));

            return redirect(route('purchaseRequisitions.index'));
        }

        $this->purchaseRequisitionRepository->delete($id);

        Flash::success(__('messages.deleted', ['model' => __('models/purchaseRequisitions.singular')]));

        return redirect(route('purchaseRequisitions.index'));
    }
}
