<!-- Unit Code Field -->
<div class="form-group col-sm-6">
    {!! Form::label('unit_code', __('models/measurementUnits.fields.unit_code').':') !!}
    {!! Form::text('unit_code', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Unit Name Field -->
<div class="form-group col-sm-6">
    {!! Form::label('unit_name', __('models/measurementUnits.fields.unit_name').':') !!}
    {!! Form::text('unit_name', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>