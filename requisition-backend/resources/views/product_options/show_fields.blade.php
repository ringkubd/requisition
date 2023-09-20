<!-- Product Id Field -->
<div class="col-sm-12">
    {!! Form::label('product_id', 'Product Id:') !!}
    <p>{{ $productOption->product_id }}</p>
</div>

<!-- Option Id Field -->
<div class="col-sm-12">
    {!! Form::label('option_id', 'Option Id:') !!}
    <p>{{ $productOption->option_id }}</p>
</div>

<!-- Sku Field -->
<div class="col-sm-12">
    {!! Form::label('sku', 'Sku:') !!}
    <p>{{ $productOption->sku }}</p>
</div>

<!-- Option Value Field -->
<div class="col-sm-12">
    {!! Form::label('option_value', 'Option Value:') !!}
    <p>{{ $productOption->option_value }}</p>
</div>

<!-- Unit Price Field -->
<div class="col-sm-12">
    {!! Form::label('unit_price', 'Unit Price:') !!}
    <p>{{ $productOption->unit_price }}</p>
</div>

<!-- Stock Field -->
<div class="col-sm-12">
    {!! Form::label('stock', 'Stock:') !!}
    <p>{{ $productOption->stock }}</p>
</div>

