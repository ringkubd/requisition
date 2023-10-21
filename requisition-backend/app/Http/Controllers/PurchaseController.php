<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePurchaseRequest;
use App\Http\Requests\UpdatePurchaseRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\PurchaseRepository;
use Illuminate\Http\Request;
use Flash;

class PurchaseController extends AppBaseController
{
    /** @var PurchaseRepository $purchaseRepository*/
    private $purchaseRepository;

    public function __construct(PurchaseRepository $purchaseRepo)
    {
        $this->purchaseRepository = $purchaseRepo;
    }

    /**
     * Display a listing of the Purchase.
     */
    public function index(Request $request)
    {
        $purchases = $this->purchaseRepository->paginate(10);

        return view('purchases.index')
            ->with('purchases', $purchases);
    }

    /**
     * Show the form for creating a new Purchase.
     */
    public function create()
    {
        return view('purchases.create');
    }

    /**
     * Store a newly created Purchase in storage.
     */
    public function store(CreatePurchaseRequest $request)
    {
        $input = $request->all();

        $purchase = $this->purchaseRepository->create($input);

        Flash::success(__('messages.saved', ['model' => __('models/purchases.singular')]));

        return redirect(route('purchases.index'));
    }

    /**
     * Display the specified Purchase.
     */
    public function show($id)
    {
        $purchase = $this->purchaseRepository->find($id);

        if (empty($purchase)) {
            Flash::error(__('models/purchases.singular').' '.__('messages.not_found'));

            return redirect(route('purchases.index'));
        }

        return view('purchases.show')->with('purchase', $purchase);
    }

    /**
     * Show the form for editing the specified Purchase.
     */
    public function edit($id)
    {
        $purchase = $this->purchaseRepository->find($id);

        if (empty($purchase)) {
            Flash::error(__('models/purchases.singular').' '.__('messages.not_found'));

            return redirect(route('purchases.index'));
        }

        return view('purchases.edit')->with('purchase', $purchase);
    }

    /**
     * Update the specified Purchase in storage.
     */
    public function update($id, UpdatePurchaseRequest $request)
    {
        $purchase = $this->purchaseRepository->find($id);

        if (empty($purchase)) {
            Flash::error(__('models/purchases.singular').' '.__('messages.not_found'));

            return redirect(route('purchases.index'));
        }

        $purchase = $this->purchaseRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/purchases.singular')]));

        return redirect(route('purchases.index'));
    }

    /**
     * Remove the specified Purchase from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $purchase = $this->purchaseRepository->find($id);

        if (empty($purchase)) {
            Flash::error(__('models/purchases.singular').' '.__('messages.not_found'));

            return redirect(route('purchases.index'));
        }

        $this->purchaseRepository->delete($id);

        Flash::success(__('messages.deleted', ['model' => __('models/purchases.singular')]));

        return redirect(route('purchases.index'));
    }
}
