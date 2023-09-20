<!-- Organization Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('organization_id', __('models/branches.fields.organization_id').':') !!}
    {!! Form::number('organization_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Name Field -->
<div class="form-group col-sm-6">
    {!! Form::label('name', __('models/branches.fields.name').':') !!}
    {!! Form::text('name', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Email Field -->
<div class="form-group col-sm-6">
    {!! Form::label('email', __('models/branches.fields.email').':') !!}
    {!! Form::email('email', null, ['class' => 'form-control', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Contact No Field -->
<div class="form-group col-sm-6">
    {!! Form::label('contact_no', __('models/branches.fields.contact_no').':') !!}
    {!! Form::text('contact_no', null, ['class' => 'form-control', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Address Field -->
<div class="form-group col-sm-6">
    {!! Form::label('address', __('models/branches.fields.address').':') !!}
    {!! Form::text('address', null, ['class' => 'form-control', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Location Field -->
<div class="form-group col-sm-12 col-lg-12">
    {!! Form::label('location', __('models/branches.fields.location').':') !!}
    {!! Form::textarea('location', null, ['class' => 'form-control']) !!}
</div>