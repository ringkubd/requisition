<!-- Cash Requisition Id Field -->
<div class="col-sm-12">
    {!! Form::label('cash_requisition_id', __('models/cashRequisitionItems.fields.cash_requisition_id').':') !!}
    <p>{{ $cashRequisitionItem->cash_requisition_id }}</p>
</div>

<!-- Item Field -->
<div class="col-sm-12">
    {!! Form::label('item', __('models/cashRequisitionItems.fields.item').':') !!}
    <p>{{ $cashRequisitionItem->item }}</p>
</div>

<!-- Unit Field -->
<div class="col-sm-12">
    {!! Form::label('unit', __('models/cashRequisitionItems.fields.unit').':') !!}
    <p>{{ $cashRequisitionItem->unit }}</p>
</div>

<!-- Required Unit Field -->
<div class="col-sm-12">
    {!! Form::label('required_unit', __('models/cashRequisitionItems.fields.required_unit').':') !!}
    <p>{{ $cashRequisitionItem->required_unit }}</p>
</div>

<!-- Unit Price Field -->
<div class="col-sm-12">
    {!! Form::label('unit_price', __('models/cashRequisitionItems.fields.unit_price').':') !!}
    <p>{{ $cashRequisitionItem->unit_price }}</p>
</div>

<!-- Purpose Field -->
<div class="col-sm-12">
    {!! Form::label('purpose', __('models/cashRequisitionItems.fields.purpose').':') !!}
    <p>{{ $cashRequisitionItem->purpose }}</p>
</div>

