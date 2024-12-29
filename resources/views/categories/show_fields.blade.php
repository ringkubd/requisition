<!-- Parent Id Field -->
<div class="col-sm-12">
    {!! Form::label('parent_id', __('models/categories.fields.parent_id').':') !!}
    <p>{{ $category->parent_id }}</p>
</div>

<!-- Title Field -->
<div class="col-sm-12">
    {!! Form::label('title', __('models/categories.fields.title').':') !!}
    <p>{{ $category->title }}</p>
</div>

<!-- Description Field -->
<div class="col-sm-12">
    {!! Form::label('description', __('models/categories.fields.description').':') !!}
    <p>{{ $category->description }}</p>
</div>

