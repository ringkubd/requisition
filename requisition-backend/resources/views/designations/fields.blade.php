<!-- Organization Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('organization_id', __('models/designations.fields.organization_id').':') !!}
    {!! Form::number('organization_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Branch Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('branch_id', __('models/designations.fields.branch_id').':') !!}
    {!! Form::number('branch_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Name Field -->
<div class="form-group col-sm-6">
    {!! Form::label('name', __('models/designations.fields.name').':') !!}
    {!! Form::text('name', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>