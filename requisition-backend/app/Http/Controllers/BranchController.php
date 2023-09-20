<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateBranchRequest;
use App\Http\Requests\UpdateBranchRequest;
use App\Http\Controllers\AppBaseController;
use App\Repositories\BranchRepository;
use Illuminate\Http\Request;
use Flash;

class BranchController extends AppBaseController
{
    /** @var BranchRepository $branchRepository*/
    private $branchRepository;

    public function __construct(BranchRepository $branchRepo)
    {
        $this->branchRepository = $branchRepo;
    }

    /**
     * Display a listing of the Branch.
     */
    public function index(Request $request)
    {
        $branches = $this->branchRepository->paginate(10);

        return view('branches.index')
            ->with('branches', $branches);
    }

    /**
     * Show the form for creating a new Branch.
     */
    public function create()
    {
        return view('branches.create');
    }

    /**
     * Store a newly created Branch in storage.
     */
    public function store(CreateBranchRequest $request)
    {
        $input = $request->all();

        $branch = $this->branchRepository->create($input);

        Flash::success(__('messages.saved', ['model' => __('models/branches.singular')]));

        return redirect(route('branches.index'));
    }

    /**
     * Display the specified Branch.
     */
    public function show($id)
    {
        $branch = $this->branchRepository->find($id);

        if (empty($branch)) {
            Flash::error(__('models/branches.singular').' '.__('messages.not_found'));

            return redirect(route('branches.index'));
        }

        return view('branches.show')->with('branch', $branch);
    }

    /**
     * Show the form for editing the specified Branch.
     */
    public function edit($id)
    {
        $branch = $this->branchRepository->find($id);

        if (empty($branch)) {
            Flash::error(__('models/branches.singular').' '.__('messages.not_found'));

            return redirect(route('branches.index'));
        }

        return view('branches.edit')->with('branch', $branch);
    }

    /**
     * Update the specified Branch in storage.
     */
    public function update($id, UpdateBranchRequest $request)
    {
        $branch = $this->branchRepository->find($id);

        if (empty($branch)) {
            Flash::error(__('models/branches.singular').' '.__('messages.not_found'));

            return redirect(route('branches.index'));
        }

        $branch = $this->branchRepository->update($request->all(), $id);

        Flash::success(__('messages.updated', ['model' => __('models/branches.singular')]));

        return redirect(route('branches.index'));
    }

    /**
     * Remove the specified Branch from storage.
     *
     * @throws \Exception
     */
    public function destroy($id)
    {
        $branch = $this->branchRepository->find($id);

        if (empty($branch)) {
            Flash::error(__('models/branches.singular').' '.__('messages.not_found'));

            return redirect(route('branches.index'));
        }

        $this->branchRepository->delete($id);

        Flash::success(__('messages.deleted', ['model' => __('models/branches.singular')]));

        return redirect(route('branches.index'));
    }
}
