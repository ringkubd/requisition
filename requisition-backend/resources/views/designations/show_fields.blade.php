<!-- Organization Id Field -->
<div class="col-sm-12">
    {!! Form::label('organization_id', __('models/designations.fields.organization_id').':') !!}
    <p>{{ $designation->organization_id }}</p>
</div>

<!-- Branch Id Field -->
<div class="col-sm-12">
    {!! Form::label('branch_id', __('models/designations.fields.branch_id').':') !!}
    <p>{{ $designation->branch_id }}</p>
</div>

<!-- Name Field -->
<div class="col-sm-12">
    {!! Form::label('name', __('models/designations.fields.name').':') !!}
    <p>{{ $designation->name }}</p>
</div>

