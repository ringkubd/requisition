<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="cash-requisitions-table">
            <thead>
            <tr>
                <th>User Id</th>
                <th>Branch Id</th>
                <th>Department Id</th>
                <th>Irf No</th>
                <th>Ir No</th>
                <th>Total Cost</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($cashRequisitions as $cashRequisition)
                <tr>
                    <td>{{ $cashRequisition->user_id }}</td>
                    <td>{{ $cashRequisition->branch_id }}</td>
                    <td>{{ $cashRequisition->department_id }}</td>
                    <td>{{ $cashRequisition->irf_no }}</td>
                    <td>{{ $cashRequisition->ir_no }}</td>
                    <td>{{ $cashRequisition->total_cost }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['cashRequisitions.destroy', $cashRequisition->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('cashRequisitions.show', [$cashRequisition->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('cashRequisitions.edit', [$cashRequisition->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $cashRequisitions])
        </div>
    </div>
</div>
