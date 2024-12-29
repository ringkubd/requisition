<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="purchases-table">
            <thead>
            <tr>
                <th>Product Id</th>
                <th>Supplier Id</th>
                <th>Purchase Requisition Id</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>User Id</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($purchases as $purchase)
                <tr>
                    <td>{{ $purchase->product_id }}</td>
                    <td>{{ $purchase->supplier_id }}</td>
                    <td>{{ $purchase->purchase_requisition_id }}</td>
                    <td>{{ $purchase->qty }}</td>
                    <td>{{ $purchase->unit_price }}</td>
                    <td>{{ $purchase->total_price }}</td>
                    <td>{{ $purchase->user_id }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['purchases.destroy', $purchase->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('purchases.show', [$purchase->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('purchases.edit', [$purchase->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $purchases])
        </div>
    </div>
</div>
