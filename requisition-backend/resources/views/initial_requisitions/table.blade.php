<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="initial-requisitions-table">
            <thead>
            <tr>
                <th>User Id</th>
                <th>Department Id</th>
                <th>Irf No</th>
                <th>Ir No</th>
                <th>Estimated Cost</th>
                <th>Is Purchase Requisition Generated</th>
                <th>Is Purchase Done</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($initialRequisitions as $initialRequisition)
                <tr>
                    <td>{{ $initialRequisition->user_id }}</td>
                    <td>{{ $initialRequisition->department_id }}</td>
                    <td>{{ $initialRequisition->irf_no }}</td>
                    <td>{{ $initialRequisition->ir_no }}</td>
                    <td>{{ $initialRequisition->estimated_cost }}</td>
                    <td>{{ $initialRequisition->is_purchase_requisition_generated }}</td>
                    <td>{{ $initialRequisition->is_purchase_done }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['initial-requisitions.destroy', $initialRequisition->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('initial-requisitions.show', [$initialRequisition->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('initial-requisitions.edit', [$initialRequisition->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $initialRequisitions])
        </div>
    </div>
</div>
