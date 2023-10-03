<?php

namespace App\Http\Requests\API;

use App\Models\User;
use InfyOm\Generator\Request\APIRequest;

class UpdateUserAPIRequest extends APIRequest
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
        $rules = User::$rules;
        if ($this->method === 'PATCH' && $this->filled('password') && $this->input('password') != ""){
            $rules['password'] = ['sometimes','required', 'confirmed'];
        }elseif ($this->method === 'POST'){
            $rules['password'] = ['sometimes','required', 'confirmed'];
        }
        return $rules;
    }
    /**
     * @return void
     */
    protected function passedValidation()
    {
        if ($this->filled('password')){
            $this->merge(['password' => bcrypt($this->input('password'))]);
        }else{
            $all = $this->all();
            unset($all['password']);
            $this->replace($all);
        }
    }
}
