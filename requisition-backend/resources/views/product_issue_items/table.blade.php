<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="product-issue-items-table">
            <thead>
            <tr>
                <th>Product Issue Id</th>
                <th>Product Id</th>
                <th>Product Option Id</th>
                <th>Use In Category</th>
                <th>Quantity</th>
                <th>Balance Before Issue</th>
                <th>Balance After Issue</th>
                <th>Purpose</th>
                <th>Uses Area</th>
                <th>Note</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($productIssueItems as $productIssueItems)
                <tr>
                    <td>{{ $productIssueItems->product_issue_id }}</td>
                    <td>{{ $productIssueItems->product_id }}</td>
                    <td>{{ $productIssueItems->product_option_id }}</td>
                    <td>{{ $productIssueItems->use_in_category }}</td>
                    <td>{{ $productIssueItems->quantity }}</td>
                    <td>{{ $productIssueItems->balance_before_issue }}</td>
                    <td>{{ $productIssueItems->balance_after_issue }}</td>
                    <td>{{ $productIssueItems->purpose }}</td>
                    <td>{{ $productIssueItems->uses_area }}</td>
                    <td>{{ $productIssueItems->note }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['productIssueItems.destroy', $productIssueItems->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('productIssueItems.show', [$productIssueItems->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('productIssueItems.edit', [$productIssueItems->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $productIssueItems])
        </div>
    </div>
</div>
