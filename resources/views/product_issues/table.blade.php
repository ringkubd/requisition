<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="product-issues-table">
            <thead>
            <tr>
                <th>Purchase Requisition Id</th>
                <th>Product Id</th>
                <th>Product Option Id</th>
                <th>Quantity</th>
                <th>Receiver Id</th>
                <th>Issuer Id</th>
                <th>Issue Time</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($productIssues as $productIssue)
                <tr>
                    <td>{{ $productIssue->purchase_requisition_id }}</td>
                    <td>{{ $productIssue->product_id }}</td>
                    <td>{{ $productIssue->product_option_id }}</td>
                    <td>{{ $productIssue->quantity }}</td>
                    <td>{{ $productIssue->receiver_id }}</td>
                    <td>{{ $productIssue->issuer_id }}</td>
                    <td>{{ $productIssue->issue_time }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['product-issues.destroy', $productIssue->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('product-issues.show', [$productIssue->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('product-issues.edit', [$productIssue->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $productIssues])
        </div>
    </div>
</div>
