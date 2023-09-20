<div class="card-body p-0">
    <div class="table-responsive">
        <table class="table" id="product-options-table">
            <thead>
            <tr>
                <th>Product Id</th>
                <th>Option Id</th>
                <th>Sku</th>
                <th>Option Value</th>
                <th>Unit Price</th>
                <th>Stock</th>
                <th colspan="3">Action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($productOptions as $productOption)
                <tr>
                    <td>{{ $productOption->product_id }}</td>
                    <td>{{ $productOption->option_id }}</td>
                    <td>{{ $productOption->sku }}</td>
                    <td>{{ $productOption->option_value }}</td>
                    <td>{{ $productOption->unit_price }}</td>
                    <td>{{ $productOption->stock }}</td>
                    <td  style="width: 120px">
                        {!! Form::open(['route' => ['productOptions.destroy', $productOption->id], 'method' => 'delete']) !!}
                        <div class='btn-group'>
                            <a href="{{ route('productOptions.show', [$productOption->id]) }}"
                               class='btn btn-default btn-xs'>
                                <i class="far fa-eye"></i>
                            </a>
                            <a href="{{ route('productOptions.edit', [$productOption->id]) }}"
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
            @include('adminlte-templates::common.paginate', ['records' => $productOptions])
        </div>
    </div>
</div>
