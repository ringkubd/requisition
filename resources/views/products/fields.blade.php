<!-- Title Field -->
<div class="form-group col-sm-6">
    {!! Form::label('title', __('models/products.fields.title').':') !!}
    {!! Form::text('title', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Sl No Field -->
<div class="form-group col-sm-6">
    {!! Form::label('sl_no', __('models/products.fields.sl_no').':') !!}
    {!! Form::text('sl_no', null, ['class' => 'form-control', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Unit Field -->
<div class="form-group col-sm-6">
    {!! Form::label('unit', __('models/products.fields.unit').':') !!}
    {!! Form::text('unit', null, ['class' => 'form-control', 'required', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Category Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('category_id', __('models/products.fields.category_id').':') !!}
    {!! Form::number('category_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Description Field -->
<div class="form-group col-sm-6">
    {!! Form::label('description', __('models/products.fields.description').':') !!}
    {!! Form::text('description', null, ['class' => 'form-control', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Status Field -->
<div class="form-group col-sm-6">
    {!! Form::label('status', __('models/products.fields.status').':') !!}
    {!! Form::text('status', null, ['class' => 'form-control', 'required']) !!}
</div>