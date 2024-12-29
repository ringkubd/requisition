<!-- User Id Field -->
<div class="col-sm-12">
    {!! Form::label('user_id', __('models/cashRequisitions.fields.user_id').':') !!}
    <p>{{ $cashRequisition->user_id }}</p>
</div>

<!-- Branch Id Field -->
<div class="col-sm-12">
    {!! Form::label('branch_id', __('models/cashRequisitions.fields.branch_id').':') !!}
    <p>{{ $cashRequisition->branch_id }}</p>
</div>

<!-- Department Id Field -->
<div class="col-sm-12">
    {!! Form::label('department_id', __('models/cashRequisitions.fields.department_id').':') !!}
    <p>{{ $cashRequisition->department_id }}</p>
</div>

<!-- Irf No Field -->
<div class="col-sm-12">
    {!! Form::label('irf_no', __('models/cashRequisitions.fields.irf_no').':') !!}
    <p>{{ $cashRequisition->irf_no }}</p>
</div>

<!-- Ir No Field -->
<div class="col-sm-12">
    {!! Form::label('ir_no', __('models/cashRequisitions.fields.ir_no').':') !!}
    <p>{{ $cashRequisition->ir_no }}</p>
</div>

<!-- Total Cost Field -->
<div class="col-sm-12">
    {!! Form::label('total_cost', __('models/cashRequisitions.fields.total_cost').':') !!}
    <p>{{ $cashRequisition->total_cost }}</p>
</div>

