<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateCountryRequest;
use App\Http\Requests\UpdateCountryRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\CountryRepository;
use Illuminate\Http\Request;
use Flash;

class CountryController extends AppBaseController
{
    /** @var CountryRepository $countryRepository*/
    private $countryRepository;

    public function __construct(CountryRepository $countryRepo)
    {
        $this->countryRepository = $countryRepo;
    }

    /**
     * Display a listing of the Country.
     */
    public function index(Request $request)
    {
        $countries = $this->countryRepository->paginate(10);

        return view('countries.index')
            ->with('countries', $countries);
    }

    /**
     * Show the form for creating a new Country.
     */
    public function create()
    {
        return view('countries.create');
    }

    /**
     * Store a newly created Country in storage.
     */
    public function store(CreateCountryRequest $request)
    {
        $input = $request->all();

        $country = $this->countryRepository->create($input);

        Flash::success(__('messages.saved', ['model' => __('models/countries.singular')]));

        return redirect(route('countries.index'));
    }

    /**
     * Display the specified Country.
     */
    public function show($id)
    {
        $country = $this->countryRepository->find($id);

        if (empty($country)) {
            Flash::error(__('models/countries.singular').' '.__('messages.not_found'));

            return redirect(route('countries.index'));
        }

        return view('countries.show')->with('country', $country);
    }

    /**
     * Show the form for editing the specified Country.
     */
    public function edit($id)
    {
        $country = $this->countryRepository->find($id);

        if (empty($country)) {
            Flash::error(__('models/countries.singular').' '.__('messages.not_found'));

            return redirect(route('countries.index'));
        }

        return view('countries.edit')->with('country', $country);
    }

    /**
     * Update the specified Country in storage.
     */
    public function update($id, UpdateCountryRequest $request)
    {
        $country = $this->countryRepository->find($id);

        if (empty($country)) {
            Flash::error(__('models/countries.singular').' '.__('messages.not_found'));

            return redirect(route('countries.index'));
        }

        $country = $this->countryRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/countries.singular')]));

        return redirect(route('countries.index'));
    }

    /**
     * Remove the specified Country from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $country = $this->countryRepository->find($id);

        if (empty($country)) {
            Flash::error(__('models/countries.singular').' '.__('messages.not_found'));

            return redirect(route('countries.index'));
        }

        $this->countryRepository->delete($id);

        Flash::success(__('messages.deleted', ['model' => __('models/countries.singular')]));

        return redirect(route('countries.index'));
    }
}
