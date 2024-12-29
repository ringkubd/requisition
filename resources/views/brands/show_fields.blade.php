<!-- Name Field -->
<div class="col-sm-12">
    {!! Form::label('name', __('models/brands.fields.name').':') !!}
    <p>{{ $brand->name }}</p>
</div>

<!-- Logo Field -->
<div class="col-sm-12">
    {!! Form::label('logo', __('models/brands.fields.logo').':') !!}
    <p>{{ $brand->logo }}</p>
</div>

<!-- Contact Field -->
<div class="col-sm-12">
    {!! Form::label('contact', __('models/brands.fields.contact').':') !!}
    <p>{{ $brand->contact }}</p>
</div>

<!-- Address Field -->
<div class="col-sm-12">
    {!! Form::label('address', __('models/brands.fields.address').':') !!}
    <p>{{ $brand->address }}</p>
</div>

