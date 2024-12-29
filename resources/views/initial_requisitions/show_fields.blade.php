<!-- User Id Field -->
<div class="col-sm-12">
    {!! Form::label('user_id', __('models/initialRequisitions.fields.user_id').':') !!}
    <p>{{ $initialRequisition->user_id }}</p>
</div>

<!-- Department Id Field -->
<div class="col-sm-12">
    {!! Form::label('department_id', __('models/initialRequisitions.fields.department_id').':') !!}
    <p>{{ $initialRequisition->department_id }}</p>
</div>

<!-- Irf No Field -->
<div class="col-sm-12">
    {!! Form::label('irf_no', __('models/initialRequisitions.fields.irf_no').':') !!}
    <p>{{ $initialRequisition->irf_no }}</p>
</div>

<!-- Ir No Field -->
<div class="col-sm-12">
    {!! Form::label('ir_no', __('models/initialRequisitions.fields.ir_no').':') !!}
    <p>{{ $initialRequisition->ir_no }}</p>
</div>

<!-- Estimated Cost Field -->
<div class="col-sm-12">
    {!! Form::label('estimated_cost', __('models/initialRequisitions.fields.estimated_cost').':') !!}
    <p>{{ $initialRequisition->estimated_cost }}</p>
</div>

<!-- Is Purchase Requisition Generated Field -->
<div class="col-sm-12">
    {!! Form::label('is_purchase_requisition_generated', __('models/initialRequisitions.fields.is_purchase_requisition_generated').':') !!}
    <p>{{ $initialRequisition->is_purchase_requisition_generated }}</p>
</div>

<!-- Is Purchase Done Field -->
<div class="col-sm-12">
    {!! Form::label('is_purchase_done', __('models/initialRequisitions.fields.is_purchase_done').':') !!}
    <p>{{ $initialRequisition->is_purchase_done }}</p>
</div>

