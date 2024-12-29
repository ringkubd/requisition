<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="branches-table">
            <thead>
            <tr>
                <th>Organization Id</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact No</th>
                <th>Address</th>
                <th>Location</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($branches as $branch)
                <tr>
                    <td>{{ $branch->organization_id }}</td>
                    <td>{{ $branch->name }}</td>
                    <td>{{ $branch->email }}</td>
                    <td>{{ $branch->contact_no }}</td>
                    <td>{{ $branch->address }}</td>
                    <td>{{ $branch->location }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['branches.destroy', $branch->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('branches.show', [$branch->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('branches.edit', [$branch->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $branches])
        </div>
    </div>
</div>
