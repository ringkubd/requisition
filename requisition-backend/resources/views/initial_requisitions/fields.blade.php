<!-- User Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('user_id', __('models/initialRequisitions.fields.user_id').':') !!}
    {!! Form::number('user_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Department Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('department_id', __('models/initialRequisitions.fields.department_id').':') !!}
    {!! Form::number('department_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Irf No Field -->
<div class="form-group col-sm-6">
    {!! Form::label('irf_no', __('models/initialRequisitions.fields.irf_no').':') !!}
    {!! Form::text('irf_no', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Ir No Field -->
<div class="form-group col-sm-6">
    {!! Form::label('ir_no', __('models/initialRequisitions.fields.ir_no').':') !!}
    {!! Form::text('ir_no', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Estimated Cost Field -->
<div class="form-group col-sm-6">
    {!! Form::label('estimated_cost', __('models/initialRequisitions.fields.estimated_cost').':') !!}
    {!! Form::number('estimated_cost', null, ['class' => 'form-control']) !!}
</div>

<!-- Is Purchase Requisition Generated Field -->
<div class="form-group col-sm-6">
    <div class="form-check">
        {!! Form::hidden('is_purchase_requisition_generated', 0, ['class' => 'form-check-input']) !!}
        {!! Form::checkbox('is_purchase_requisition_generated', '1', null, ['class' => 'form-check-input']) !!}
        {!! Form::label('is_purchase_requisition_generated', 'Is Purchase Requisition Generated', ['class' => 'form-check-label']) !!}
    </div>
</div>

<!-- Is Purchase Done Field -->
<div class="form-group col-sm-6">
    <div class="form-check">
        {!! Form::hidden('is_purchase_done', 0, ['class' => 'form-check-input']) !!}
        {!! Form::checkbox('is_purchase_done', '1', null, ['class' => 'form-check-input']) !!}
        {!! Form::label('is_purchase_done', 'Is Purchase Done', ['class' => 'form-check-label']) !!}
    </div>
</div>