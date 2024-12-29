<!-- Cash Requisition Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('cash_requisition_id', __('models/cashRequisitionItems.fields.cash_requisition_id').':') !!}
    {!! Form::number('cash_requisition_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Item Field -->
<div class="form-group col-sm-6">
    {!! Form::label('item', __('models/cashRequisitionItems.fields.item').':') !!}
    {!! Form::text('item', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Unit Field -->
<div class="form-group col-sm-6">
    {!! Form::label('unit', __('models/cashRequisitionItems.fields.unit').':') !!}
    {!! Form::text('unit', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Required Unit Field -->
<div class="form-group col-sm-6">
    {!! Form::label('required_unit', __('models/cashRequisitionItems.fields.required_unit').':') !!}
    {!! Form::number('required_unit', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Unit Price Field -->
<div class="form-group col-sm-6">
    {!! Form::label('unit_price', __('models/cashRequisitionItems.fields.unit_price').':') !!}
    {!! Form::number('unit_price', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Purpose Field -->
<div class="form-group col-sm-6">
    {!! Form::label('purpose', __('models/cashRequisitionItems.fields.purpose').':') !!}
    {!! Form::text('purpose', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>