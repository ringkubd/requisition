<!-- User Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('user_id', __('models/cashRequisitions.fields.user_id').':') !!}
    {!! Form::number('user_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Branch Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('branch_id', __('models/cashRequisitions.fields.branch_id').':') !!}
    {!! Form::number('branch_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Department Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('department_id', __('models/cashRequisitions.fields.department_id').':') !!}
    {!! Form::number('department_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Irf No Field -->
<div class="form-group col-sm-6">
    {!! Form::label('irf_no', __('models/cashRequisitions.fields.irf_no').':') !!}
    {!! Form::text('irf_no', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Ir No Field -->
<div class="form-group col-sm-6">
    {!! Form::label('ir_no', __('models/cashRequisitions.fields.ir_no').':') !!}
    {!! Form::text('ir_no', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Total Cost Field -->
<div class="form-group col-sm-6">
    {!! Form::label('total_cost', __('models/cashRequisitions.fields.total_cost').':') !!}
    {!! Form::number('total_cost', null, ['class' => 'form-control', 'required']) !!}
</div>