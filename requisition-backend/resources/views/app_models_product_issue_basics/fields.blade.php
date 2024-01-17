<!-- Uuid Field -->
<div class="form-group col-sm-6">
    {!! Form::label('uuid', __('models/appModelsProductIssueBasics.fields.uuid').':') !!}
    {!! Form::text('uuid', null, ['class' => 'form-control', 'required', 'maxlength' => 36, 'maxlength' => 36, 'maxlength' => 36]) !!}
</div>

<!-- Receiver Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('receiver_id', __('models/appModelsProductIssueBasics.fields.receiver_id').':') !!}
    {!! Form::number('receiver_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Receiver Branch Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('receiver_branch_id', __('models/appModelsProductIssueBasics.fields.receiver_branch_id').':') !!}
    {!! Form::number('receiver_branch_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Receiver Department Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('receiver_department_id', __('models/appModelsProductIssueBasics.fields.receiver_department_id').':') !!}
    {!! Form::number('receiver_department_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Issuer Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('issuer_id', __('models/appModelsProductIssueBasics.fields.issuer_id').':') !!}
    {!! Form::number('issuer_id', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Issuer Branch Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('issuer_branch_id', __('models/appModelsProductIssueBasics.fields.issuer_branch_id').':') !!}
    {!! Form::number('issuer_branch_id', null, ['class' => 'form-control']) !!}
</div>

<!-- Issuer Department Id Field -->
<div class="form-group col-sm-6">
    {!! Form::label('issuer_department_id', __('models/appModelsProductIssueBasics.fields.issuer_department_id').':') !!}
    {!! Form::number('issuer_department_id', null, ['class' => 'form-control']) !!}
</div>

<!-- Number Of Item Field -->
<div class="form-group col-sm-6">
    {!! Form::label('number_of_item', __('models/appModelsProductIssueBasics.fields.number_of_item').':') !!}
    {!! Form::number('number_of_item', null, ['class' => 'form-control', 'required']) !!}
</div>

<!-- Issue Time Field -->
<div class="form-group col-sm-6">
    {!! Form::label('issue_time', __('models/appModelsProductIssueBasics.fields.issue_time').':') !!}
    {!! Form::text('issue_time', null, ['class' => 'form-control','id'=>'issue_time']) !!}
</div>

@push('page_scripts')
    <script type="text/javascript">
        $('#issue_time').datepicker()
    </script>
@endpush

<!-- Department Status Field -->
<div class="form-group col-sm-6">
    <div class="form-check">
        {!! Form::hidden('department_status', 0, ['class' => 'form-check-input']) !!}
        {!! Form::checkbox('department_status', '1', null, ['class' => 'form-check-input']) !!}
        {!! Form::label('department_status', 'Department Status', ['class' => 'form-check-label']) !!}
    </div>
</div>

<!-- Department Approved By Field -->
<div class="form-group col-sm-6">
    {!! Form::label('department_approved_by', __('models/appModelsProductIssueBasics.fields.department_approved_by').':') !!}
    {!! Form::number('department_approved_by', null, ['class' => 'form-control']) !!}
</div>

<!-- Store Status Field -->
<div class="form-group col-sm-6">
    <div class="form-check">
        {!! Form::hidden('store_status', 0, ['class' => 'form-check-input']) !!}
        {!! Form::checkbox('store_status', '1', null, ['class' => 'form-check-input']) !!}
        {!! Form::label('store_status', 'Store Status', ['class' => 'form-check-label']) !!}
    </div>
</div>

<!-- Store Approved By Field -->
<div class="form-group col-sm-6">
    {!! Form::label('store_approved_by', __('models/appModelsProductIssueBasics.fields.store_approved_by').':') !!}
    {!! Form::number('store_approved_by', null, ['class' => 'form-control']) !!}
</div>