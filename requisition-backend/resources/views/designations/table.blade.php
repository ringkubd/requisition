<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="designations-table">
            <thead>
            <tr>
                <th>Organization Id</th>
                <th>Branch Id</th>
                <th>Name</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($designations as $designation)
                <tr>
                    <td>{{ $designation->organization_id }}</td>
                    <td>{{ $designation->branch_id }}</td>
                    <td>{{ $designation->name }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['designations.destroy', $designation->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('designations.show', [$designation->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('designations.edit', [$designation->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $designations])
        </div>
    </div>
</div>
