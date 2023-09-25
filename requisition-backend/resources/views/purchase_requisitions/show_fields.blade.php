<!-- Initial Requisition Id Field -->
<div class="col-sm-12">
    {!! Form::label('initial_requisition_id', __('models/purchaseRequisitions.fields.initial_requisition_id').':') !!}
    <p>{{ $purchaseRequisition->initial_requisition_id }}</p>
</div>

<!-- Estimated Total Amount Field -->
<div class="col-sm-12">
    {!! Form::label('estimated_total_amount', __('models/purchaseRequisitions.fields.estimated_total_amount').':') !!}
    <p>{{ $purchaseRequisition->estimated_total_amount }}</p>
</div>

<!-- Received Amount Field -->
<div class="col-sm-12">
    {!! Form::label('received_amount', __('models/purchaseRequisitions.fields.received_amount').':') !!}
    <p>{{ $purchaseRequisition->received_amount }}</p>
</div>

<!-- Payment Type Field -->
<div class="col-sm-12">
    {!! Form::label('payment_type', __('models/purchaseRequisitions.fields.payment_type').':') !!}
    <p>{{ $purchaseRequisition->payment_type }}</p>
</div>

