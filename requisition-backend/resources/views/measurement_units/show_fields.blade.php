<!-- Unit Code Field -->
<div class="col-sm-12">
    {!! Form::label('unit_code', __('models/measurementUnits.fields.unit_code').':') !!}
    <p>{{ $measurementUnit->unit_code }}</p>
</div>

<!-- Unit Name Field -->
<div class="col-sm-12">
    {!! Form::label('unit_name', __('models/measurementUnits.fields.unit_name').':') !!}
    <p>{{ $measurementUnit->unit_name }}</p>
</div>

