<?php

namespace App\Http\Requests;

use App\Models\ProductIssueItems;
use Illuminate\Foundation\Http\FormRequest;

class CreateProductIssueItemsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return ProductIssueItems::$rules;
    }
}
