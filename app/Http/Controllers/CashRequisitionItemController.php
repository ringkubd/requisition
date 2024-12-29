<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateCashRequisitionItemRequest;
use App\Http\Requests\UpdateCashRequisitionItemRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\CashRequisitionItemRepository;
use Illuminate\Http\Request;
use Flash;

class CashRequisitionItemController extends AppBaseController
{
    /** @var CashRequisitionItemRepository $cashRequisitionItemRepository*/
    private $cashRequisitionItemRepository;

    public function __construct(CashRequisitionItemRepository $cashRequisitionItemRepo)
    {
        $this->cashRequisitionItemRepository = $cashRequisitionItemRepo;
    }

    /**
     * Display a listing of the CashRequisitionItem.
     */
    public function index(Request $request)
    {
        $cashRequisitionItems = $this->cashRequisitionItemRepository->paginate(10);

        return view('cash_requisition_items.index')
            ->with('cashRequisitionItems', $cashRequisitionItems);
    }

    /**
     * Show the form for creating a new CashRequisitionItem.
     */
    public function create()
    {
        return view('cash_requisition_items.create');
    }

    /**
     * Store a newly created CashRequisitionItem in storage.
     */
    public function store(CreateCashRequisitionItemRequest $request)
    {
        $input = $request->all();

        $cashRequisitionItem = $this->cashRequisitionItemRepository->create($input);

        Flash::success(__('messages.saved', ['model' => __('models/cashRequisitionItems.singular')]));

        return redirect(route('cashRequisitionItems.index'));
    }

    /**
     * Display the specified CashRequisitionItem.
     */
    public function show($id)
    {
        $cashRequisitionItem = $this->cashRequisitionItemRepository->find($id);

        if (empty($cashRequisitionItem)) {
            Flash::error(__('models/cashRequisitionItems.singular').' '.__('messages.not_found'));

            return redirect(route('cashRequisitionItems.index'));
        }

        return view('cash_requisition_items.show')->with('cashRequisitionItem', $cashRequisitionItem);
    }

    /**
     * Show the form for editing the specified CashRequisitionItem.
     */
    public function edit($id)
    {
        $cashRequisitionItem = $this->cashRequisitionItemRepository->find($id);

        if (empty($cashRequisitionItem)) {
            Flash::error(__('models/cashRequisitionItems.singular').' '.__('messages.not_found'));

            return redirect(route('cashRequisitionItems.index'));
        }

        return view('cash_requisition_items.edit')->with('cashRequisitionItem', $cashRequisitionItem);
    }

    /**
     * Update the specified CashRequisitionItem in storage.
     */
    public function update($id, UpdateCashRequisitionItemRequest $request)
    {
        $cashRequisitionItem = $this->cashRequisitionItemRepository->find($id);

        if (empty($cashRequisitionItem)) {
            Flash::error(__('models/cashRequisitionItems.singular').' '.__('messages.not_found'));

            return redirect(route('cashRequisitionItems.index'));
        }

        $cashRequisitionItem = $this->cashRequisitionItemRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/cashRequisitionItems.singular')]));

        return redirect(route('cashRequisitionItems.index'));
    }

    /**
     * Remove the specified CashRequisitionItem from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $cashRequisitionItem = $this->cashRequisitionItemRepository->find($id);

        if (empty($cashRequisitionItem)) {
            Flash::error(__('models/cashRequisitionItems.singular').' '.__('messages.not_found'));

            return redirect(route('cashRequisitionItems.index'));
        }

        $this->cashRequisitionItemRepository->delete($id);

        Flash::success(__('messages.deleted', ['model' => __('models/cashRequisitionItems.singular')]));

        return redirect(route('cashRequisitionItems.index'));
    }
}
