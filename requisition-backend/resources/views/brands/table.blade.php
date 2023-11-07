<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="brands-table">
            <thead>
            <tr>
                <th>Name</th>
                <th>Logo</th>
                <th>Contact</th>
                <th>Address</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($brands as $brand)
                <tr>
                    <td>{{ $brand->name }}</td>
                    <td>{{ $brand->logo }}</td>
                    <td>{{ $brand->contact }}</td>
                    <td>{{ $brand->address }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['brands.destroy', $brand->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('brands.show', [$brand->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('brands.edit', [$brand->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $brands])
        </div>
    </div>
</div>
