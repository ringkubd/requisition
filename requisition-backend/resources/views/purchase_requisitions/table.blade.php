<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="purchase-requisitions-table">
            <thead>
            <tr>
                <th>Initial Requisition Id</th>
                <th>Estimated Total Amount</th>
                <th>Received Amount</th>
                <th>Payment Type</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($purchaseRequisitions as $purchaseRequisition)
                <tr>
                    <td>{{ $purchaseRequisition->initial_requisition_id }}</td>
                    <td>{{ $purchaseRequisition->estimated_total_amount }}</td>
                    <td>{{ $purchaseRequisition->received_amount }}</td>
                    <td>{{ $purchaseRequisition->payment_type }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['purchase-requisitions.destroy', $purchaseRequisition->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('purchase-requisitions.show', [$purchaseRequisition->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('purchase-requisitions.edit', [$purchaseRequisition->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $purchaseRequisitions])
        </div>
    </div>
</div>
