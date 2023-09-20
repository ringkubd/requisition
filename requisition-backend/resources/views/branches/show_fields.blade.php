<!-- Organization Id Field -->
<div class="col-sm-12">
    {!! Form::label('organization_id', __('models/branches.fields.organization_id').':') !!}
    <p>{{ $branch->organization_id }}</p>
</div>

<!-- Name Field -->
<div class="col-sm-12">
    {!! Form::label('name', __('models/branches.fields.name').':') !!}
    <p>{{ $branch->name }}</p>
</div>

<!-- Email Field -->
<div class="col-sm-12">
    {!! Form::label('email', __('models/branches.fields.email').':') !!}
    <p>{{ $branch->email }}</p>
</div>

<!-- Contact No Field -->
<div class="col-sm-12">
    {!! Form::label('contact_no', __('models/branches.fields.contact_no').':') !!}
    <p>{{ $branch->contact_no }}</p>
</div>

<!-- Address Field -->
<div class="col-sm-12">
    {!! Form::label('address', __('models/branches.fields.address').':') !!}
    <p>{{ $branch->address }}</p>
</div>

<!-- Location Field -->
<div class="col-sm-12">
    {!! Form::label('location', __('models/branches.fields.location').':') !!}
    <p>{{ $branch->location }}</p>
</div>

