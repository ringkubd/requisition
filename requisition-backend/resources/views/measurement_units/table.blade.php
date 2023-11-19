<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="measurement-units-table">
            <thead>
            <tr>
                <th>Unit Code</th>
                <th>Unit Name</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($measurementUnits as $measurementUnit)
                <tr>
                    <td>{{ $measurementUnit->unit_code }}</td>
                    <td>{{ $measurementUnit->unit_name }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['measurementUnits.destroy', $measurementUnit->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('measurementUnits.show', [$measurementUnit->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('measurementUnits.edit', [$measurementUnit->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $measurementUnits])
        </div>
    </div>
</div>
