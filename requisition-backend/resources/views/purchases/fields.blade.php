<!-- Product Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('product_id', __('models/purchases.fields.product_id').':') !!}
    {!! Form::number('product_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Supplier Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('supplier_id', __('models/purchases.fields.supplier_id').':') !!}
    {!! Form::number('supplier_id', null, ['class' => 'form-control']) !!}
</div>

<!-- Purchase Requisition Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('purchase_requisition_id', __('models/purchases.fields.purchase_requisition_id').':') !!}
    {!! Form::number('purchase_requisition_id', null, ['class' => 'form-control']) !!}
</div>

<!-- Qty Field -->
<div class="form-group col-sm-6">
    {!! Form::label('qty', __('models/purchases.fields.qty').':') !!}
    {!! Form::number('qty', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Unit Price Field -->
<div class="form-group col-sm-6">
    {!! Form::label('unit_price', __('models/purchases.fields.unit_price').':') !!}
    {!! Form::number('unit_price', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Total Price Field -->
<div class="form-group col-sm-6">
    {!! Form::label('total_price', __('models/purchases.fields.total_price').':') !!}
    {!! Form::number('total_price', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- User Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('user_id', __('models/purchases.fields.user_id').':') !!}
    {!! Form::number('user_id', null, ['class' => 'form-control', 'required']) !!}
</div>