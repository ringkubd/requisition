<!-- need to remove -->
<li class="nav-item">
    <a href="{{ route('home') }}" class="nav-link {{ Request::is('home') ? 'active' : '' }}">
        <i class="nav-icon fas fa-home"></i>
        <p>Home</p>
    </a>
</li>
<li class="nav-item">
    <a href="{{ route('products.index') }}" class="nav-link {{ Request::routeIs('products.*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-list"></i>
        <p>Products</p>
    </a>
</li>
<li class="nav-item">
    <a href="{{ route('categories.index') }}" class="nav-link {{ Request::routeIs('categories.*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-list"></i>
        <p>Category</p>
    </a>
</li>
<li class="nav-item">
    <a href="{{ route('branches.index') }}" class="nav-link {{ Request::routeIs('branches.*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-list"></i>
        <p>Branch</p>
    </a>
</li>
<li class="nav-item">
    <a href="{{ route('departments.index') }}" class="nav-link {{ Request::routeIs('departments.*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-list"></i>
        <p>Departments</p>
    </a>
</li>
<li class="nav-item">
    <a href="{{ route('designations.index') }}" class="nav-link {{ Request::routeIs('designations.*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-list"></i>
        <p>Designations</p>
    </a>
</li>
<li class="nav-item">
    <a href="{{ route('options.index') }}" class="nav-link {{ Request::routeIs('options.*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-list"></i>
        <p>Product Options</p>
    </a>
</li>

<li class="nav-item">
    <a href="{{ route('departments.index') }}" class="nav-link {{ Request::is('departments*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-home"></i>
        <p>@lang('models/departments.plural')</p>
    </a>
</li>

<li class="nav-item">
    <a href="{{ route('branches.index') }}" class="nav-link {{ Request::is('branches*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-home"></i>
        <p>@lang('models/branches.plural')</p>
    </a>
</li>

<li class="nav-item">
    <a href="{{ route('designations.index') }}" class="nav-link {{ Request::is('designations*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-home"></i>
        <p>@lang('models/designations.plural')</p>
    </a>
</li>

<li class="nav-item">
    <a href="{{ route('products.index') }}" class="nav-link {{ Request::is('products*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-home"></i>
        <p>@lang('models/products.plural')</p>
    </a>
</li>

<li class="nav-item">
    <a href="{{ route('initialRequisitions.index') }}" class="nav-link {{ Request::is('initialRequisitions*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-home"></i>
        <p>@lang('models/initialRequisitions.plural')</p>
    </a>
</li>

<li class="nav-item">
    <a href="{{ route('purchaseRequisitions.index') }}" class="nav-link {{ Request::is('purchaseRequisitions*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-home"></i>
        <p>@lang('models/purchaseRequisitions.plural')</p>
    </a>
</li>

<li class="nav-item">
    <a href="{{ route('users.index') }}" class="nav-link {{ Request::is('users*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-home"></i>
        <p>@lang('models/users.plural')</p>
    </a>
</li>

<li class="nav-item">
    <a href="{{ route('suppliers.index') }}" class="nav-link {{ Request::is('suppliers*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-home"></i>
        <p>@lang('models/suppliers.plural')</p>
    </a>
</li>

<li class="nav-item">
    <a href="{{ route('purchases.index') }}" class="nav-link {{ Request::is('purchases*') ? 'active' : '' }}">
        <i class="nav-icon fas fa-home"></i>
        <p>@lang('models/purchases.plural')</p>
    </a>
</li>
