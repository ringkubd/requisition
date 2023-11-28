<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use Illuminate\Http\Request;

class NavigationAPIController extends AppBaseController
{
    public function organization(){
        $organizations = \request()->user()->organizations;
        return $this->sendResponse(
            $organizations,
            __('messages.retrieved', ['model' => __('models/organization.plural')])
            );
    }

    public function branch(){
        $branches = \request()->user()->branches()->when(\request()->organization_id, function ($q, $o){
            $q->where('organization_id', $o);
        })->get();
        return $this->sendResponse(
            $branches,
            __('messages.retrieved', ['model' => __('models/branch.plural')])
        );
    }

    public function department(){
        $departments = \request()->user()->departments()->when(\request()->branch_id, function ($q, $b){
            $q->where('branch_id', $b);
        })->get();
        return $this->sendResponse(
            $departments,
            __("messages.retrieved".\request()->branch_id, ['model' => __('models/department.plural')])
        );
    }
}
