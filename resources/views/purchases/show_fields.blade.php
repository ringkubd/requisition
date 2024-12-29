<!-- Product Id Field -->
<div class="col-sm-12">
    {!! Form::label('product_id', __('models/purchases.fields.product_id').':') !!}
    <p>{{ $purchase->product_id }}</p>
</div>

<!-- Supplier Id Field -->
<div class="col-sm-12">
    {!! Form::label('supplier_id', __('models/purchases.fields.supplier_id').':') !!}
    <p>{{ $purchase->supplier_id }}</p>
</div>

<!-- Purchase Requisition Id Field -->
<div class="col-sm-12">
    {!! Form::label('purchase_requisition_id', __('models/purchases.fields.purchase_requisition_id').':') !!}
    <p>{{ $purchase->purchase_requisition_id }}</p>
</div>

<!-- Qty Field -->
<div class="col-sm-12">
    {!! Form::label('qty', __('models/purchases.fields.qty').':') !!}
    <p>{{ $purchase->qty }}</p>
</div>

<!-- Unit Price Field -->
<div class="col-sm-12">
    {!! Form::label('unit_price', __('models/purchases.fields.unit_price').':') !!}
    <p>{{ $purchase->unit_price }}</p>
</div>

<!-- Total Price Field -->
<div class="col-sm-12">
    {!! Form::label('total_price', __('models/purchases.fields.total_price').':') !!}
    <p>{{ $purchase->total_price }}</p>
</div>

<!-- User Id Field -->
<div class="col-sm-12">
    {!! Form::label('user_id', __('models/purchases.fields.user_id').':') !!}
    <p>{{ $purchase->user_id }}</p>
</div>

