<!-- Name Field -->
<div class="col-sm-12">
    {!! Form::label('name', __('models/auth/Roles.fields.name').':') !!}
    <p>{{ $auth/Role->name }}</p>
</div>

<!-- Guard Name Field -->
<div class="col-sm-12">
    {!! Form::label('guard_name', __('models/auth/Roles.fields.guard_name').':') !!}
    <p>{{ $auth/Role->guard_name }}</p>
</div>

