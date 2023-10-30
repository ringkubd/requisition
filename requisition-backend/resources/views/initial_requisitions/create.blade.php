@extends('layouts.app')

@section('content')
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-12">
                    <h1>
                    @lang('crud.create') @lang('models/initialRequisitions.singular')
                    </h1>
                </div>
            </div>
        </div>
    </section>

    <div class="content px-3">

        @include('adminlte-templates::common.errors')

        <div class="card">

            {!! Form::open(['route' => 'initialRequisitions.store']) !!}

            <div class="card-body">

                <div class="row">
                    @include('initial_requisitions.fields')
                </div>

            </div>

            <div class="card-footer">
                {!! Form::submit('Save', ['class' => 'btn btn-primary']) !!}
                <a href="{{ route('initial-requisitions.index') }}" class="btn btn-default"> @lang('crud.cancel') </a>
            </div>

            {!! Form::close() !!}

        </div>
    </div>
@endsection
