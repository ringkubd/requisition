<?php

use App\Models\Branch;
use App\Models\Organization;
use Illuminate\Support\Facades\Cache;

if (!function_exists('auth_organizations')) {
    function auth_organizations()
    {
        if (auth()->user()->hasRole('administrator')) {
            return Organization::get();
        }
        return auth()->user()->organizations;
    }
}


if (!function_exists('auth_organization_id')) {
    function auth_organization_id()
    {
        if (Cache::has('select_organization')) {
            return Cache::get('select_organization');
        }
        return auth()->user()->defaultOrganization?->id; // login branch organization id
    }
}

if (!function_exists('auth_organization_name')) {
    function auth_organization_name()
    {
        if (Cache::has('select_organization')) {
            $organizationId = Cache::get('select_organization');
            return Organization::where('id', $organizationId)->first()->name ?? 'Not Found';
        }

        return auth()->user()->defaultOrganization?->name ?? 'Fail To set'; // login branch organization name
    }
}
if (!function_exists('auth_branches')){
    function auth_branches(){
        $organization_id = auth_organization_id();

        if (auth()->user()->hasRole('administrator')) {
            return Branch::where('organization_id', $organization_id)->get();
        }
        return auth()->user()->branches->where('organization_id', $organization_id);
    }
}

if (!function_exists('auth_branch_id')){
    function auth_branch_id(){
        if (Cache::has('select_branch')) {
            return Cache::get('select_branch');
        }
        return auth()->user()->defaultBranch?->id; // login branch organization id
    }
}

if (!function_exists('auth_department_id')){
    function auth_department_id(){
        if (Cache::has('select_department')) {
            return Cache::get('select_department');
        }
        return auth()->user()->defaultDepartment?->id; // login department id
    }
}
if (!function_exists('auth_department_name')){
    function auth_department_name(){
        if (Cache::has('select_department_name')) {
            return Cache::get('select_department_name');
        }else{
            $department_name = \App\Models\Department::find(auth_department_id())->name;
            Cache::set('select_department_name', $department_name);
            return $department_name;
        }
    }
}

if (!function_exists('auth_designation_id')){
    function auth_designation_id(){
        if (Cache::has('select_designation')) {
            return Cache::get('select_designation');
        }
        return auth()->user()->designations->first()?->id; // login branch organization id
    }
}
if (!function_exists('auth_designation_name')){
    function auth_designation_name(){
        if (Cache::has('select_designation_name')) {
            return Cache::get('select_designation_name');
        }else{
            $designation = \App\Models\Designation::find(auth_designation_id())->name;
            Cache::set('select_designation_name', $designation);
            return $designation;
        }
    }
}
