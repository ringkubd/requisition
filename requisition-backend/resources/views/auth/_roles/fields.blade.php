<!-- Name Field -->
<div class="form-group col-sm-6">
    {!! Form::label('name', __('models/auth/Roles.fields.name').':') !!}
    {!! Form::text('name', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Guard Name Field -->
<div class="form-group col-sm-6">
    {!! Form::label('guard_name', __('models/auth/Roles.fields.guard_name').':') !!}
    {!! Form::text('guard_name', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>