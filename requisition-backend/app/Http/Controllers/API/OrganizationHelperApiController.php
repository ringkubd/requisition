<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\BranchResource;
use App\Models\Branch;
use Illuminate\Http\Request;

class OrganizationHelperApiController extends AppBaseController
{
    public function getBranch(Request $request){
        if ($request->has('organization')){
            $organizations = explode(',', $request->organization);
            $branches = Branch::whereIn('organization_id', $organizations)->get();
            return $this->sendResponse( BranchResource::collection($branches),
                __('messages.retrieved', ['model' => __('models/branches.plural')]));
        }else{
            return $this->sendError( __('messages.failed', ['model' => __('models/branches.plural')]),404);
        }

    }
}
