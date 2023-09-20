<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;use App\Models\Organization;use Illuminate\Http\Request;

class OrganizationApiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Organization::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required',
            'contact_no' => 'required',
        ]);
        $organization = Organization::create($request->all());
        return response()->json([
            'message' => 'Organization stored successfully'
        ],200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Organization $organization)
    {
        return $organization->only('id', 'name', 'email', 'contact_no', 'address');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Organization $organization)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required',
            'contact_no' => 'required',
        ]);
        $organization->update($request->all());
        return response()->json([
            'message' => 'Organization stored successfully'
        ],200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Organization $organization)
    {
        $organization->delete();
        return response()->json([
            'message' => 'Organization deleted successfully'
        ],200);
    }
}
