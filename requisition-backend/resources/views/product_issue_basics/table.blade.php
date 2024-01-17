<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="product-issue-basics-table">
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
            @foreach($productIssueBasics as $productIssueBasic)
                <tr>
                    <td>{{ $productIssueBasic->uuid }}</td>
                    <td>{{ $productIssueBasic->receiver_id }}</td>
                    <td>{{ $productIssueBasic->receiver_branch_id }}</td>
                    <td>{{ $productIssueBasic->receiver_department_id }}</td>
                    <td>{{ $productIssueBasic->issuer_id }}</td>
                    <td>{{ $productIssueBasic->issuer_branch_id }}</td>
                    <td>{{ $productIssueBasic->issuer_department_id }}</td>
                    <td>{{ $productIssueBasic->number_of_item }}</td>
                    <td>{{ $productIssueBasic->issue_time }}</td>
                    <td>{{ $productIssueBasic->department_status }}</td>
                    <td>{{ $productIssueBasic->department_approved_by }}</td>
                    <td>{{ $productIssueBasic->store_status }}</td>
                    <td>{{ $productIssueBasic->store_approved_by }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['productIssueBasics.destroy', $productIssueBasic->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('productIssueBasics.show', [$productIssueBasic->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('productIssueBasics.edit', [$productIssueBasic->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $productIssueBasics])
        </div>
    </div>
</div>
