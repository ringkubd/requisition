<!-- Initial Requisition Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('initial_requisition_id', __('models/purchaseRequisitions.fields.initial_requisition_id').':') !!}
    {!! Form::number('initial_requisition_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Estimated Total Amount Field -->
<div class="form-group col-sm-6">
    {!! Form::label('estimated_total_amount', __('models/purchaseRequisitions.fields.estimated_total_amount').':') !!}
    {!! Form::number('estimated_total_amount', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Received Amount Field -->
<div class="form-group col-sm-6">
    {!! Form::label('received_amount', __('models/purchaseRequisitions.fields.received_amount').':') !!}
    {!! Form::number('received_amount', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Payment Type Field -->
<div class="form-group col-sm-6">
    <div class="form-check">
        {!! Form::hidden('payment_type', 0, ['class' => 'form-check-input']) !!}
        {!! Form::checkbox('payment_type', '1', null, ['class' => 'form-check-input']) !!}
        {!! Form::label('payment_type', 'Payment Type', ['class' => 'form-check-label']) !!}
    </div>
</div>