<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="cash-requisition-items-table">
            <thead>
            <tr>
                <th>Cash Requisition Id</th>
                <th>Item</th>
                <th>Unit</th>
                <th>Required Unit</th>
                <th>Unit Price</th>
                <th>Purpose</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($cashRequisitionItems as $cashRequisitionItem)
                <tr>
                    <td>{{ $cashRequisitionItem->cash_requisition_id }}</td>
                    <td>{{ $cashRequisitionItem->item }}</td>
                    <td>{{ $cashRequisitionItem->unit }}</td>
                    <td>{{ $cashRequisitionItem->required_unit }}</td>
                    <td>{{ $cashRequisitionItem->unit_price }}</td>
                    <td>{{ $cashRequisitionItem->purpose }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['cashRequisitionItems.destroy', $cashRequisitionItem->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('cashRequisitionItems.show', [$cashRequisitionItem->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('cashRequisitionItems.edit', [$cashRequisitionItem->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $cashRequisitionItems])
        </div>
    </div>
</div>
