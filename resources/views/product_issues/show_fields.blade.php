<!-- Purchase Requisition Id Field -->
<div class="col-sm-12">
    {!! Form::label('purchase_requisition_id', __('models/productIssues.fields.purchase_requisition_id').':') !!}
    <p>{{ $productIssue->purchase_requisition_id }}</p>
</div>

<!-- Product Id Field -->
<div class="col-sm-12">
    {!! Form::label('product_id', __('models/productIssues.fields.product_id').':') !!}
    <p>{{ $productIssue->product_id }}</p>
</div>

<!-- Product Option Id Field -->
<div class="col-sm-12">
    {!! Form::label('product_option_id', __('models/productIssues.fields.product_option_id').':') !!}
    <p>{{ $productIssue->product_option_id }}</p>
</div>

<!-- Quantity Field -->
<div class="col-sm-12">
    {!! Form::label('quantity', __('models/productIssues.fields.quantity').':') !!}
    <p>{{ $productIssue->quantity }}</p>
</div>

<!-- Receiver Id Field -->
<div class="col-sm-12">
    {!! Form::label('receiver_id', __('models/productIssues.fields.receiver_id').':') !!}
    <p>{{ $productIssue->receiver_id }}</p>
</div>

<!-- Issuer Id Field -->
<div class="col-sm-12">
    {!! Form::label('issuer_id', __('models/productIssues.fields.issuer_id').':') !!}
    <p>{{ $productIssue->issuer_id }}</p>
</div>

<!-- Issue Time Field -->
<div class="col-sm-12">
    {!! Form::label('issue_time', __('models/productIssues.fields.issue_time').':') !!}
    <p>{{ $productIssue->issue_time }}</p>
</div>

