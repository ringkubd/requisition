<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\BranchResource;
use App\Models\Branch;
use Illuminate\Http\Request;

class OrganizationHelperApiController extends AppBaseController
{
    public function getBranch($organization){
        $branches = Branch::where('organization_id', $organization)->get();
        return $this->sendResponse( BranchResource::collection($branches),
            __('messages.retrieved', ['model' => __('models/branches.plural')]));
    }
}
