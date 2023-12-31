<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="countries-table">
            <thead>
            <tr>
                <th>Country Code</th>
                <th>Country Name</th>
                <th colspan="3">crud.action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($countries as $country)
                <tr>
                    <td>{{ $country->country_code }}</td>
                    <td>{{ $country->country_name }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['countries.destroy', $country->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('countries.show', [$country->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('countries.edit', [$country->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $countries])
        </div>
    </div>
</div>
