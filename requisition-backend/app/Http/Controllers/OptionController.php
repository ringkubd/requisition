<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateOptionRequest;
use App\Http\Requests\UpdateOptionRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\OptionRepository;
use Illuminate\Http\Request;
use Flash;

class OptionController extends AppBaseController
{
    /** @var OptionRepository $optionRepository*/
    private $optionRepository;

    public function __construct(OptionRepository $optionRepo)
    {
        $this->optionRepository = $optionRepo;
    }

    /**
     * Display a listing of the Option.
     */
    public function index(Request $request)
    {
        $options = $this->optionRepository->paginate(10);

        return view('options.index')
            ->with('options', $options);
    }

    /**
     * Show the form for creating a new Option.
     */
    public function create()
    {
        return view('options.create');
    }

    /**
     * Store a newly created Option in storage.
     */
    public function store(CreateOptionRequest $request)
    {
        $input = $request->all();

        $option = $this->optionRepository->create($input);

        Flash::success('Option saved successfully.');

        return redirect(route('options.index'));
    }

    /**
     * Display the specified Option.
     */
    public function show($id)
    {
        $option = $this->optionRepository->find($id);

        if (empty($option)) {
            Flash::error('Option not found');

            return redirect(route('options.index'));
        }

        return view('options.show')->with('option', $option);
    }

    /**
     * Show the form for editing the specified Option.
     */
    public function edit($id)
    {
        $option = $this->optionRepository->find($id);

        if (empty($option)) {
            Flash::error('Option not found');

            return redirect(route('options.index'));
        }

        return view('options.edit')->with('option', $option);
    }

    /**
     * Update the specified Option in storage.
     */
    public function update($id, UpdateOptionRequest $request)
    {
        $option = $this->optionRepository->find($id);

        if (empty($option)) {
            Flash::error('Option not found');

            return redirect(route('options.index'));
        }

        $option = $this->optionRepository->update($request->all(), $id);

        Flash::success('Option updated successfully.');

        return redirect(route('options.index'));
    }

    /**
     * Remove the specified Option from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $option = $this->optionRepository->find($id);

        if (empty($option)) {
            Flash::error('Option not found');

            return redirect(route('options.index'));
        }

        $this->optionRepository->delete($id);

        Flash::success('Option deleted successfully.');

        return redirect(route('options.index'));
    }
}
