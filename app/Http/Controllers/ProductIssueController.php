<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateProductIssueRequest;
use App\Http\Requests\UpdateProductIssueRequest;
use App\Http\Controllers\AppBaseController;
use App\Models\ProductOption;
use App\Repositories\ProductIssueRepository;
use Illuminate\Http\Request;
use Flash;

class ProductIssueController extends AppBaseController
{
    /** @var ProductIssueRepository $productIssueRepository*/
    private $productIssueRepository;

    public function __construct(ProductIssueRepository $productIssueRepo)
    {
        $this->productIssueRepository = $productIssueRepo;
    }

    /**
     * Display a listing of the ProductIssue.
     */
    public function index(Request $request)
    {
        $productIssues = $this->productIssueRepository->paginate(10);

        return view('product_issues.index')
            ->with('productIssues', $productIssues);
    }

    /**
     * Show the form for creating a new ProductIssue.
     */
    public function create()
    {
        return view('product_issues.create');
    }

    /**
     * Store a newly created ProductIssue in storage.
     */
    public function store(CreateProductIssueRequest $request)
    {
        $input = $request->all();
        $productOptionId = $input['product_option_id'];
        $quantity = $input['quantity'];

        $productIssue = $this->productIssueRepository->create($input);
        if ($productIssue){
            $productOption = ProductOption::find($productOptionId);
            $productOption->stock = (double)$productOption->stock - (double)$quantity;
            $productOption->save();
        }

        Flash::success(__('messages.saved', ['model' => __('models/productIssues.singular')]));

        return redirect(route('productIssues.index'));
    }

    /**
     * Display the specified ProductIssue.
     */
    public function show($id)
    {
        $productIssue = $this->productIssueRepository->find($id);

        if (empty($productIssue)) {
            Flash::error(__('models/productIssues.singular').' '.__('messages.not_found'));

            return redirect(route('productIssues.index'));
        }

        return view('product_issues.show')->with('productIssue', $productIssue);
    }

    /**
     * Show the form for editing the specified ProductIssue.
     */
    public function edit($id)
    {
        $productIssue = $this->productIssueRepository->find($id);

        if (empty($productIssue)) {
            Flash::error(__('models/productIssues.singular').' '.__('messages.not_found'));

            return redirect(route('productIssues.index'));
        }

        return view('product_issues.edit')->with('productIssue', $productIssue);
    }

    /**
     * Update the specified ProductIssue in storage.
     */
    public function update($id, UpdateProductIssueRequest $request)
    {
        $productIssue = $this->productIssueRepository->find($id);

        if (empty($productIssue)) {
            Flash::error(__('models/productIssues.singular').' '.__('messages.not_found'));

            return redirect(route('productIssues.index'));
        }

        $productIssue = $this->productIssueRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/productIssues.singular')]));

        return redirect(route('productIssues.index'));
    }

    /**
     * Remove the specified ProductIssue from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $productIssue = $this->productIssueRepository->find($id);

        if (empty($productIssue)) {
            Flash::error(__('models/productIssues.singular').' '.__('messages.not_found'));

            return redirect(route('productIssues.index'));
        }
        $productOptionId = $productIssue-> product_option_id;
        $quantity = $productIssue->quantity;

        if ($productIssue && $this->productIssueRepository->delete($id)){
            $productOption = ProductOption::find($productOptionId);
            $productOption->stock = (double)$productOption->stock + (double)$quantity;
            $productOption->save();
        }

        Flash::success(__('messages.deleted', ['model' => __('models/productIssues.singular')]));

        return redirect(route('productIssues.index'));
    }
}
