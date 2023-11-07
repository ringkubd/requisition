<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\BrandRepository;
use Illuminate\Http\Request;
use Flash;

class BrandController extends AppBaseController
{
    /** @var BrandRepository $brandRepository*/
    private $brandRepository;

    public function __construct(BrandRepository $brandRepo)
    {
        $this->brandRepository = $brandRepo;
    }

    /**
     * Display a listing of the Brand.
     */
    public function index(Request $request)
    {
        $brands = $this->brandRepository->paginate(10);

        return view('brands.index')
            ->with('brands', $brands);
    }

    /**
     * Show the form for creating a new Brand.
     */
    public function create()
    {
        return view('brands.create');
    }

    /**
     * Store a newly created Brand in storage.
     */
    public function store(CreateBrandRequest $request)
    {
        $input = $request->all();

        $brand = $this->brandRepository->create($input);

        Flash::success(__('messages.saved', ['model' => __('models/brands.singular')]));

        return redirect(route('brands.index'));
    }

    /**
     * Display the specified Brand.
     */
    public function show($id)
    {
        $brand = $this->brandRepository->find($id);

        if (empty($brand)) {
            Flash::error(__('models/brands.singular').' '.__('messages.not_found'));

            return redirect(route('brands.index'));
        }

        return view('brands.show')->with('brand', $brand);
    }

    /**
     * Show the form for editing the specified Brand.
     */
    public function edit($id)
    {
        $brand = $this->brandRepository->find($id);

        if (empty($brand)) {
            Flash::error(__('models/brands.singular').' '.__('messages.not_found'));

            return redirect(route('brands.index'));
        }

        return view('brands.edit')->with('brand', $brand);
    }

    /**
     * Update the specified Brand in storage.
     */
    public function update($id, UpdateBrandRequest $request)
    {
        $brand = $this->brandRepository->find($id);

        if (empty($brand)) {
            Flash::error(__('models/brands.singular').' '.__('messages.not_found'));

            return redirect(route('brands.index'));
        }

        $brand = $this->brandRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/brands.singular')]));

        return redirect(route('brands.index'));
    }

    /**
     * Remove the specified Brand from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $brand = $this->brandRepository->find($id);

        if (empty($brand)) {
            Flash::error(__('models/brands.singular').' '.__('messages.not_found'));

            return redirect(route('brands.index'));
        }

        $this->brandRepository->delete($id);

        Flash::success(__('messages.deleted', ['model' => __('models/brands.singular')]));

        return redirect(route('brands.index'));
    }
}
