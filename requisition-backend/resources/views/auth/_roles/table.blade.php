<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="auth/-roles-table">
            <thead>
            <tr>
                <th>Name</th>
                <th>Guard Name</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($auth/Roles as $auth/Role)
                <tr>
                    <td>{{ $auth/Role->name }}</td>
                    <td>{{ $auth/Role->guard_name }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['auth/Roles.destroy', $auth/Role->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('auth/Roles.show', [$auth/Role->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('auth/Roles.edit', [$auth/Role->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $auth/Roles])
        </div>
    </div>
</div>
