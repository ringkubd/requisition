<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateProductIssueItemsRequest;
use App\Http\Requests\UpdateProductIssueItemsRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\ProductIssueItemsRepository;
use Illuminate\Http\Request;
use Flash;

class ProductIssueItemsController extends AppBaseController
{
    /** @var ProductIssueItemsRepository $productIssueItemsRepository*/
    private $productIssueItemsRepository;

    public function __construct(ProductIssueItemsRepository $productIssueItemsRepo)
    {
        $this->productIssueItemsRepository = $productIssueItemsRepo;
    }

    /**
     * Display a listing of the ProductIssueItems.
     */
    public function index(Request $request)
    {
        $productIssueItems = $this->productIssueItemsRepository->paginate(10);

        return view('product_issue_items.index')
            ->with('productIssueItems', $productIssueItems);
    }

    /**
     * Show the form for creating a new ProductIssueItems.
     */
    public function create()
    {
        return view('product_issue_items.create');
    }

    /**
     * Store a newly created ProductIssueItems in storage.
     */
    public function store(CreateProductIssueItemsRequest $request)
    {
        $input = $request->all();

        $productIssueItems = $this->productIssueItemsRepository->create($input);

        Flash::success(__('messages.saved', ['model' => __('models/productIssueItems.singular')]));

        return redirect(route('productIssueItems.index'));
    }

    /**
     * Display the specified ProductIssueItems.
     */
    public function show($id)
    {
        $productIssueItems = $this->productIssueItemsRepository->find($id);

        if (empty($productIssueItems)) {
            Flash::error(__('models/productIssueItems.singular').' '.__('messages.not_found'));

            return redirect(route('productIssueItems.index'));
        }

        return view('product_issue_items.show')->with('productIssueItems', $productIssueItems);
    }

    /**
     * Show the form for editing the specified ProductIssueItems.
     */
    public function edit($id)
    {
        $productIssueItems = $this->productIssueItemsRepository->find($id);

        if (empty($productIssueItems)) {
            Flash::error(__('models/productIssueItems.singular').' '.__('messages.not_found'));

            return redirect(route('productIssueItems.index'));
        }

        return view('product_issue_items.edit')->with('productIssueItems', $productIssueItems);
    }

    /**
     * Update the specified ProductIssueItems in storage.
     */
    public function update($id, UpdateProductIssueItemsRequest $request)
    {
        $productIssueItems = $this->productIssueItemsRepository->find($id);

        if (empty($productIssueItems)) {
            Flash::error(__('models/productIssueItems.singular').' '.__('messages.not_found'));

            return redirect(route('productIssueItems.index'));
        }

        $productIssueItems = $this->productIssueItemsRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/productIssueItems.singular')]));

        return redirect(route('productIssueItems.index'));
    }

    /**
     * Remove the specified ProductIssueItems from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $productIssueItems = $this->productIssueItemsRepository->find($id);

        if (empty($productIssueItems)) {
            Flash::error(__('models/productIssueItems.singular').' '.__('messages.not_found'));

            return redirect(route('productIssueItems.index'));
        }

        $this->productIssueItemsRepository->delete($id);

        Flash::success(__('messages.deleted', ['model' => __('models/productIssueItems.singular')]));

        return redirect(route('productIssueItems.index'));
    }
}
