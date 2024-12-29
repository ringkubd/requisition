<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateProductOptionRequest;
use App\Http\Requests\UpdateProductOptionRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\ProductOptionRepository;
use Illuminate\Http\Request;
use Flash;

class ProductOptionController extends AppBaseController
{
    /** @var ProductOptionRepository $productOptionRepository*/
    private $productOptionRepository;

    public function __construct(ProductOptionRepository $productOptionRepo)
    {
        $this->productOptionRepository = $productOptionRepo;
    }

    /**
     * Display a listing of the ProductOption.
     */
    public function index(Request $request)
    {
        $productOptions = $this->productOptionRepository->paginate(10);

        return view('product_options.index')
            ->with('productOptions', $productOptions);
    }

    /**
     * Show the form for creating a new ProductOption.
     */
    public function create()
    {
        return view('product_options.create');
    }

    /**
     * Store a newly created ProductOption in storage.
     */
    public function store(CreateProductOptionRequest $request)
    {
        $input = $request->all();

        $productOption = $this->productOptionRepository->create($input);

        Flash::success('Product Option saved successfully.');

        return redirect(route('productOptions.index'));
    }

    /**
     * Display the specified ProductOption.
     */
    public function show($id)
    {
        $productOption = $this->productOptionRepository->find($id);

        if (empty($productOption)) {
            Flash::error('Product Option not found');

            return redirect(route('productOptions.index'));
        }

        return view('product_options.show')->with('productOption', $productOption);
    }

    /**
     * Show the form for editing the specified ProductOption.
     */
    public function edit($id)
    {
        $productOption = $this->productOptionRepository->find($id);

        if (empty($productOption)) {
            Flash::error('Product Option not found');

            return redirect(route('productOptions.index'));
        }

        return view('product_options.edit')->with('productOption', $productOption);
    }

    /**
     * Update the specified ProductOption in storage.
     */
    public function update($id, UpdateProductOptionRequest $request)
    {
        $productOption = $this->productOptionRepository->find($id);

        if (empty($productOption)) {
            Flash::error('Product Option not found');

            return redirect(route('productOptions.index'));
        }

        $productOption = $this->productOptionRepository->update($request->all(), $id);

        Flash::success('Product Option updated successfully.');

        return redirect(route('productOptions.index'));
    }

    /**
     * Remove the specified ProductOption from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $productOption = $this->productOptionRepository->find($id);

        if (empty($productOption)) {
            Flash::error('Product Option not found');

            return redirect(route('productOptions.index'));
        }

        $this->productOptionRepository->delete($id);

        Flash::success('Product Option deleted successfully.');

        return redirect(route('productOptions.index'));
    }
}
