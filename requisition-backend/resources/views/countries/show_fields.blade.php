<!-- Country Code Field -->
<div class="col-sm-12">
    {!! Form::label('country_code', __('models/countries.fields.country_code').':') !!}
    <p>{{ $country->country_code }}</p>
</div>

<!-- Country Name Field -->
<div class="col-sm-12">
    {!! Form::label('country_name', __('models/countries.fields.country_name').':') !!}
    <p>{{ $country->country_name }}</p>
</div>

