<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Models\Branch;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImportUsersFromEMSController extends AppBaseController
{
    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function importBranch(Request $request): JsonResponse
    {
        $companyID = Organization::first()->id;
        if ($request->has('company_id')){
            $companyID = $request->company_id;
        }
        $existingBranch = Branch::where('organization_id', $companyID)->pluck('name')->toArray();
        $branches = DB::connection('ems')
            ->table('branches')
            ->selectRaw("$companyID as organization_id, branch_name as name,email, mobile as contact_no, address")
            ->whereNotIn('branch_name', $existingBranch)
            ->get();
        $branchArray = [];
        foreach ($branches as $branch){
            $branchArray[] = [
                'organization_id' => $branch->organization_id,
                'name' => $branch->name,
                'contact_no' => $branch->contact_no,
                'address' => $branch->address,
            ];
        }
        $branches = Branch::insert($branchArray);
        return $this->sendResponse($branches, "Branch imported.");
    }

    public function importUser(Request $request){

    }
}
