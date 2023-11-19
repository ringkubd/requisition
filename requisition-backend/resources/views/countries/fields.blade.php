<!-- Country Code Field -->
<div class="form-group col-sm-6">
    {!! Form::label('country_code', __('models/countries.fields.country_code').':') !!}
    {!! Form::text('country_code', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Country Name Field -->
<div class="form-group col-sm-6">
    {!! Form::label('country_name', __('models/countries.fields.country_name').':') !!}
    {!! Form::text('country_name', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>