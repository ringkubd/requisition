<!-- Title Field -->
<div class="col-sm-12">
    {!! Form::label('title', __('models/products.fields.title').':') !!}
    <p>{{ $product->title }}</p>
</div>

<!-- Sl No Field -->
<div class="col-sm-12">
    {!! Form::label('sl_no', __('models/products.fields.sl_no').':') !!}
    <p>{{ $product->sl_no }}</p>
</div>

<!-- Unit Field -->
<div class="col-sm-12">
    {!! Form::label('unit', __('models/products.fields.unit').':') !!}
    <p>{{ $product->unit }}</p>
</div>

<!-- Category Id Field -->
<div class="col-sm-12">
    {!! Form::label('category_id', __('models/products.fields.category_id').':') !!}
    <p>{{ $product->category_id }}</p>
</div>

<!-- Description Field -->
<div class="col-sm-12">
    {!! Form::label('description', __('models/products.fields.description').':') !!}
    <p>{{ $product->description }}</p>
</div>

<!-- Status Field -->
<div class="col-sm-12">
    {!! Form::label('status', __('models/products.fields.status').':') !!}
    <p>{{ $product->status }}</p>
</div>

