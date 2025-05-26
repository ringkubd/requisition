<?php

use App\Models\Branch;
use App\Models\Organization;
use Illuminate\Support\Facades\Cache;

if (!function_exists('auth_organizations')) {
    function auth_organizations()
    {
        if (request()->user()->hasRole('administrator')) {
            return Organization::get();
        }
        return request()->user()->organizations;
    }
}


if (!function_exists('auth_organization_id')) {
    function auth_organization_id()
    {
        if (Cache::has('select_organization_'.\request()->user()->id)) {
            return (int)Cache::get('select_organization_'.\request()->user()->id);
        }
        return request()->user()->defaultOrganization?->id; // login branch organization id
    }
}

if (!function_exists('auth_organization_name')) {
    function auth_organization_name()
    {
        if (Cache::has('select_organization_'.\request()->user()->id)) {
            $organizationId = Cache::get('select_organization_'.\request()->user()->id);
            return Organization::where('id', $organizationId)->first()->name ?? 'Not Found';
        }

        return request()->user()->defaultOrganization?->name ?? 'Fail To set'; // login branch organization name
    }
}
if (!function_exists('auth_branches')){
    function auth_branches(){
        $organization_id = auth_organization_id();

        if (request()->user()->hasRole('administrator')) {
            return Branch::where('organization_id', $organization_id)->get();
        }
        return request()->user()->branches->where('organization_id', $organization_id);
    }
}

if (!function_exists('auth_branch_id')){
    function auth_branch_id(){
        if (Cache::has('select_branch_'.\request()->user()?->id)) {
            return Cache::get('select_branch_'.\request()->user()->id);
        }
        return request()->user()->defaultBranch?->id; // login branch organization id
    }
}

if (!function_exists('auth_department_id')){
    function auth_department_id(){
        $key = 'select_department_'.\request()->user()->id;
        if (Cache::has($key)) {
            return Cache::get($key);
        }
        return \request()->user()->defaultDepartment?->id; // login department id
    }
}
if (!function_exists('auth_department_name')){
    function auth_department_name(){
        $department_name = \App\Models\Department::find(auth_department_id())->name;
        return $department_name;

    }
}
if (!function_exists('auth_department_head')){
    function auth_department_head(){
        return \App\Models\Department::find(auth_department_id())?->head_of_department;

    }
}


if (!function_exists('auth_designation_id')){
    function auth_designation_id(){
        $key = 'select_designation_'.\request()->user()->id;
        if (Cache::has($key)) {
            return Cache::get($key);
        }
        return request()->user()->designations->first()?->id; // login branch organization id
    }
}
if (!function_exists('auth_designation_name')){
    function auth_designation_name(){
        if (Cache::has('select_designation_name_'.\request()->user()->id)) {
            return Cache::get('select_designation_name_'.\request()->user()->id);
        }else{
            $designation = \App\Models\Designation::find(auth_designation_id())->name;
            Cache::set('select_designation_name_'.\request()->user()->id, $designation);
            return $designation;
        }
    }
}
