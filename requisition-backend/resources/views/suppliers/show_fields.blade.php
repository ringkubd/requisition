<!-- Name Field -->
<div class="col-sm-12">
    {!! Form::label('name', __('models/suppliers.fields.name').':') !!}
    <p>{{ $supplier->name }}</p>
</div>

<!-- Logo Field -->
<div class="col-sm-12">
    {!! Form::label('logo', __('models/suppliers.fields.logo').':') !!}
    <p>{{ $supplier->logo }}</p>
</div>

<!-- Contact Field -->
<div class="col-sm-12">
    {!! Form::label('contact', __('models/suppliers.fields.contact').':') !!}
    <p>{{ $supplier->contact }}</p>
</div>

<!-- Address Field -->
<div class="col-sm-12">
    {!! Form::label('address', __('models/suppliers.fields.address').':') !!}
    <p>{{ $supplier->address }}</p>
</div>

