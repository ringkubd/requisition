<!-- Purchase Requisition Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('purchase_requisition_id', __('models/productIssues.fields.purchase_requisition_id').':') !!}
    {!! Form::number('purchase_requisition_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Product Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('product_id', __('models/productIssues.fields.product_id').':') !!}
    {!! Form::number('product_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Product Option Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('product_option_id', __('models/productIssues.fields.product_option_id').':') !!}
    {!! Form::number('product_option_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Quantity Field -->
<div class="form-group col-sm-6">
    {!! Form::label('quantity', __('models/productIssues.fields.quantity').':') !!}
    {!! Form::number('quantity', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Receiver Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('receiver_id', __('models/productIssues.fields.receiver_id').':') !!}
    {!! Form::number('receiver_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Issuer Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('issuer_id', __('models/productIssues.fields.issuer_id').':') !!}
    {!! Form::number('issuer_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Issue Time Field -->
<div class="form-group col-sm-6">
    {!! Form::label('issue_time', __('models/productIssues.fields.issue_time').':') !!}
    {!! Form::text('issue_time', null, ['class' => 'form-control','id'=>'issue_time']) !!}
</div>

@push('page_scripts')
    <script type="text/javascript">
        $('#issue_time').datepicker()
    </script>
@endpush