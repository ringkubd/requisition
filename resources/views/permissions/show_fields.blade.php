<!-- Name Field -->
<div class="col-sm-12">
    {!! Form::label('name', __('models/permissions.fields.name').':') !!}
    <p>{{ $permission->name }}</p>
</div>

<!-- Guard Name Field -->
<div class="col-sm-12">
    {!! Form::label('guard_name', __('models/permissions.fields.guard_name').':') !!}
    <p>{{ $permission->guard_name }}</p>
</div>

