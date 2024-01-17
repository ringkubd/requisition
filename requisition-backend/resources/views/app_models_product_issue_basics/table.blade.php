<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="app-models-product-issue-basics-table">
            <thead>
            <tr>
                <th>Uuid</th>
                <th>Receiver Id</th>
                <th>Receiver Branch Id</th>
                <th>Receiver Department Id</th>
                <th>Issuer Id</th>
                <th>Issuer Branch Id</th>
                <th>Issuer Department Id</th>
                <th>Number Of Item</th>
                <th>Issue Time</th>
                <th>Department Status</th>
                <th>Department Approved By</th>
                <th>Store Status</th>
                <th>Store Approved By</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($appModelsProductIssueBasics as $appModelsProductIssueBasic)
                <tr>
                    <td>{{ $appModelsProductIssueBasic->uuid }}</td>
                    <td>{{ $appModelsProductIssueBasic->receiver_id }}</td>
                    <td>{{ $appModelsProductIssueBasic->receiver_branch_id }}</td>
                    <td>{{ $appModelsProductIssueBasic->receiver_department_id }}</td>
                    <td>{{ $appModelsProductIssueBasic->issuer_id }}</td>
                    <td>{{ $appModelsProductIssueBasic->issuer_branch_id }}</td>
                    <td>{{ $appModelsProductIssueBasic->issuer_department_id }}</td>
                    <td>{{ $appModelsProductIssueBasic->number_of_item }}</td>
                    <td>{{ $appModelsProductIssueBasic->issue_time }}</td>
                    <td>{{ $appModelsProductIssueBasic->department_status }}</td>
                    <td>{{ $appModelsProductIssueBasic->department_approved_by }}</td>
                    <td>{{ $appModelsProductIssueBasic->store_status }}</td>
                    <td>{{ $appModelsProductIssueBasic->store_approved_by }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['appModelsProductIssueBasics.destroy', $appModelsProductIssueBasic->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('appModelsProductIssueBasics.show', [$appModelsProductIssueBasic->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('appModelsProductIssueBasics.edit', [$appModelsProductIssueBasic->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-edit"></i>
                            </a>
                            {!! Form::button('<i class="far fa-trash-alt"></i>', ['type' => 'submit', 'class' => 'btn btn-danger btn-xs', 'onclick' => "return confirm('Are you sure?')"]) !!}
                        </div>
                        {!! Form::close() !!}
                    </td>
                </tr>
            @endforeach
            </tbody>
        </table>
    </div>

    <div class="card-footer clearfix">
        <div class="float-right">
            @include('adminlte-templates::common.paginate', ['records' => $appModelsProductIssueBasics])
        </div>
    </div>
</div>
