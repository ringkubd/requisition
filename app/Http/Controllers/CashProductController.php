<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateCashProductRequest;
use App\Http\Requests\UpdateCashProductRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\CashProductRepository;
use Illuminate\Http\Request;
use Flash;

class CashProductController extends AppBaseController
{
    /** @var CashProductRepository $cashProductRepository*/
    private $cashProductRepository;

    public function __construct(CashProductRepository $cashProductRepo)
    {
        $this->cashProductRepository = $cashProductRepo;
    }

    /**
     * Display a listing of the CashProduct.
     */
    public function index(Request $request)
    {
        $cashProducts = $this->cashProductRepository->paginate(10);

        return view('cash_products.index')
            ->with('cashProducts', $cashProducts);
    }

    /**
     * Show the form for creating a new CashProduct.
     */
    public function create()
    {
        return view('cash_products.create');
    }

    /**
     * Store a newly created CashProduct in storage.
     */
    public function store(CreateCashProductRequest $request)
    {
        $input = $request->all();

        $cashProduct = $this->cashProductRepository->create($input);

        Flash::success(__('messages.saved', ['model' => __('models/cashProducts.singular')]));

        return redirect(route('cashProducts.index'));
    }

    /**
     * Display the specified CashProduct.
     */
    public function show($id)
    {
        $cashProduct = $this->cashProductRepository->find($id);

        if (empty($cashProduct)) {
            Flash::error(__('models/cashProducts.singular').' '.__('messages.not_found'));

            return redirect(route('cashProducts.index'));
        }

        return view('cash_products.show')->with('cashProduct', $cashProduct);
    }

    /**
     * Show the form for editing the specified CashProduct.
     */
    public function edit($id)
    {
        $cashProduct = $this->cashProductRepository->find($id);

        if (empty($cashProduct)) {
            Flash::error(__('models/cashProducts.singular').' '.__('messages.not_found'));

            return redirect(route('cashProducts.index'));
        }

        return view('cash_products.edit')->with('cashProduct', $cashProduct);
    }

    /**
     * Update the specified CashProduct in storage.
     */
    public function update($id, UpdateCashProductRequest $request)
    {
        $cashProduct = $this->cashProductRepository->find($id);

        if (empty($cashProduct)) {
            Flash::error(__('models/cashProducts.singular').' '.__('messages.not_found'));

            return redirect(route('cashProducts.index'));
        }

        $cashProduct = $this->cashProductRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/cashProducts.singular')]));

        return redirect(route('cashProducts.index'));
    }

    /**
     * Remove the specified CashProduct from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $cashProduct = $this->cashProductRepository->find($id);

        if (empty($cashProduct)) {
            Flash::error(__('models/cashProducts.singular').' '.__('messages.not_found'));

            return redirect(route('cashProducts.index'));
        }

        $this->cashProductRepository->delete($id);

        Flash::success(__('messages.deleted', ['model' => __('models/cashProducts.singular')]));

        return redirect(route('cashProducts.index'));
    }
}
