<!-- Product Issue Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('product_issue_id', __('models/productIssueItems.fields.product_issue_id').':') !!}
    {!! Form::number('product_issue_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Product Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('product_id', __('models/productIssueItems.fields.product_id').':') !!}
    {!! Form::number('product_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Product Option Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('product_option_id', __('models/productIssueItems.fields.product_option_id').':') !!}
    {!! Form::number('product_option_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Use In Category Field -->
<div class="form-group col-sm-6">
    {!! Form::label('use_in_category', __('models/productIssueItems.fields.use_in_category').':') !!}
    {!! Form::number('use_in_category', null, ['class' => 'form-control']) !!}
</div>

<!-- Quantity Field -->
<div class="form-group col-sm-6">
    {!! Form::label('quantity', __('models/productIssueItems.fields.quantity').':') !!}
    {!! Form::number('quantity', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Balance Before Issue Field -->
<div class="form-group col-sm-6">
    {!! Form::label('balance_before_issue', __('models/productIssueItems.fields.balance_before_issue').':') !!}
    {!! Form::number('balance_before_issue', null, ['class' => 'form-control']) !!}
</div>

<!-- Balance After Issue Field -->
<div class="form-group col-sm-6">
    {!! Form::label('balance_after_issue', __('models/productIssueItems.fields.balance_after_issue').':') !!}
    {!! Form::number('balance_after_issue', null, ['class' => 'form-control']) !!}
</div>

<!-- Purpose Field -->
<div class="form-group col-sm-6">
    {!! Form::label('purpose', __('models/productIssueItems.fields.purpose').':') !!}
    {!! Form::text('purpose', null, ['class' => 'form-control', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Uses Area Field -->
<div class="form-group col-sm-6">
    {!! Form::label('uses_area', __('models/productIssueItems.fields.uses_area').':') !!}
    {!! Form::text('uses_area', null, ['class' => 'form-control', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>

<!-- Note Field -->
<div class="form-group col-sm-6">
    {!! Form::label('note', __('models/productIssueItems.fields.note').':') !!}
    {!! Form::text('note', null, ['class' => 'form-control', 'maxlength' => 255, 'maxlength' => 255, 'maxlength' => 255]) !!}
</div>