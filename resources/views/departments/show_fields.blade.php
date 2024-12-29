<!-- Organization Id Field -->
<div class="col-sm-12">
    {!! Form::label('organization_id', __('models/departments.fields.organization_id').':') !!}
    <p>{{ $department->organization_id }}</p>
</div>

<!-- Branch Id Field -->
<div class="col-sm-12">
    {!! Form::label('branch_id', __('models/departments.fields.branch_id').':') !!}
    <p>{{ $department->branch_id }}</p>
</div>

<!-- Name Field -->
<div class="col-sm-12">
    {!! Form::label('name', __('models/departments.fields.name').':') !!}
    <p>{{ $department->name }}</p>
</div>

