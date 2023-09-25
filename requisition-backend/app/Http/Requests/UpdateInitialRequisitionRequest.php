<?php

namespace App\Http\Requests;

use App\Models\InitialRequisition;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInitialRequisitionRequest extends FormRequest
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
        $rules = InitialRequisition::$rules;
        
        return $rules;
    }
}
