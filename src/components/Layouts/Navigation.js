import ApplicationLogo from '@/components/applicationLogo'
import Dropdown from '@/components/dropdown'
import Link from 'next/link'
import NavLink from '@/components/navLink'
import ResponsiveNavLink, {
    ResponsiveNavButton,
} from '@/components/responsiveNavLink'
import DropdownLink, { DropdownButton } from '@/components/dropdownLink'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/router'
import { useState } from 'react'
import
{
    AiOutlineClose,
    AiOutlineMenu,
    AiOutlineCaretDown,
} from 'react-icons/ai'

const Navigation = ( { user } ) =>
{
    const router = useRouter()

    const { logout } = useAuth()

    const [ open, setOpen ] = useState( false )

    function checkPermission( permission )
    {
        if ( user )
        {
            const roles = user.role_object
            const permissions = user.permissions
            if ( roles.filter( r => r.name === 'Super Admin' ).length )
            {
                return true
            } else
            {
                return permissions.filter( p =>
                {
                    if ( permission instanceof Object )
                    {
                        return permission.indexOf( p.name ) !== -1 ? p.name : null
                    } else
                    {
                        return permission === p.name ? p.name : null
                    }
                } ).length
            }
        }
        return false
    }

    return (
        <nav className="bg-white border-b border-gray-100 shadow-lg">
            <div
                className={`before:content-[''] before:bg-noise relative before:w-full before:h-full before:block  before:opacity-10`}>
                {/* Primary Navigation Menu */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            {/* Logo */}
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/dashboard">
                                    <ApplicationLogo className="block h-10 w-auto fill-current text-gray-600" />
                                </Link>
                            </div>

                            {/* Navigation Links */}
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex sm:items-center">
                                <NavLink
                                    href="/dashboard"
                                    active={router.pathname === '/dashboard'}>
                                    Dashboard
                                </NavLink>
                                {checkPermission( [
                                    'view_initial-requisitions',
                                    'create_initial-requisitions',
                                    'update_initial-requisitions',
                                    'delete_initial-requisitions',
                                    'view_purchase-requisitions',
                                    'create_purchase-requisitions',
                                    'update_purchase-requisitions',
                                    'delete_purchase-requisitions',
                                ] ) ? (
                                    <Dropdown
                                        align="right"
                                        width="48"
                                        trigger={
                                            <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                                <div>Requisition</div>
                                                <div className="ml-1">
                                                    <AiOutlineCaretDown />
                                                </div>
                                            </button>
                                        }>
                                        {checkPermission( [
                                            'view_initial-requisitions',
                                            'create_initial-requisitions',
                                            'update_initial-requisitions',
                                            'delete_initial-requisitions',
                                        ] ) ? (
                                            <DropdownLink
                                                href="/initial-requisition"
                                                active={router.pathname
                                                    .includes(
                                                        'initial-requisition',
                                                    )
                                                    .toString()}>
                                                Initial
                                            </DropdownLink>
                                        ) : (
                                            ''
                                        )}
                                        {checkPermission( [
                                            'view_purchase-requisitions',
                                            'create_purchase-requisitions',
                                            'update_purchase-requisitions',
                                            'delete_purchase-requisitions',
                                        ] ) ? (
                                            <DropdownLink
                                                href="/purchase-requisition"
                                                active={router.pathname
                                                    .includes(
                                                        'purchase-requisition',
                                                    )
                                                    .toString()}>
                                                Purchase
                                            </DropdownLink>
                                        ) : (
                                            ''
                                        )}
                                        {checkPermission( [
                                            'view_cash-requisitions',
                                            'create_cash-requisitions',
                                            'update_cash-requisitions',
                                            'delete_cash-requisitions',
                                        ] ) ? (
                                            <DropdownLink
                                                href="/cash-requisition"
                                                active={router.pathname
                                                    .includes(
                                                        'cash-requisition',
                                                    )
                                                    .toString()}>
                                                Cash
                                            </DropdownLink>
                                        ) : (
                                            ''
                                        )}
                                    </Dropdown>
                                ) : (
                                    ''
                                )}
                                {/* Inventory */}
                                {checkPermission( [
                                    'view_purchases',
                                    'create_purchases',
                                    'update_purchases',
                                    'delete_purchases',
                                    'view_product-issues',
                                    'create_product-issues',
                                    'update_product-issues',
                                    'delete_product-issues',
                                    'approve_department_issue'
                                ] ) ? (
                                    <Dropdown
                                        align="left"
                                        width="48"
                                        contentClasses={`px-1 py-0 bg-gray-200`}
                                        trigger={
                                            <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                                <div>Inventory</div>
                                                <div className="ml-1">
                                                    <AiOutlineCaretDown />
                                                </div>
                                            </button>
                                        }>
                                        {checkPermission( [
                                            'view_purchases',
                                            'create_purchases',
                                            'update_purchases',
                                            'delete_purchases',
                                        ] ) ? (
                                            <DropdownLink
                                                href="/purchase"
                                                active={router.pathname
                                                    .includes( 'purchase' )
                                                    .toString()}>
                                                Receive
                                            </DropdownLink>
                                        ) : null}
                                        {checkPermission( [
                                            'view_product-issues',
                                            'create_product-issues',
                                            'update_product-issues',
                                            'delete_product-issues',
                                            'approve_department_issue'
                                        ] ) ? (
                                            <DropdownLink
                                                href="/issue"
                                                active={router.pathname
                                                    .includes( 'issue' )
                                                    .toString()}>
                                                Issue
                                            </DropdownLink>
                                        ) : null}
                                        {checkPermission( [
                                            'view_purchases',
                                            'create_purchases',
                                            'update_purchases',
                                            'delete_purchases',
                                        ] ) ? (
                                            <>
                                                <DropdownLink
                                                    href="/product/report"
                                                    active={router.pathname
                                                        .includes( 'report' )
                                                        .toString()}>
                                                    Report
                                                </DropdownLink>
                                                <DropdownLink
                                                    href="/vehicle/report"
                                                    active={router.pathname
                                                        .includes( 'vehicle' )
                                                        .toString()}>
                                                    Fuel
                                                </DropdownLink>
                                            </>
                                        ) : null}
                                    </Dropdown>
                                ) : null}
                                {checkPermission( [
                                    'view_products',
                                    'create_products',
                                    'update_products',
                                    'delete_products',
                                    'view_options',
                                    'create_options',
                                    'update_options',
                                    'delete_options',
                                    'view_categories',
                                    'create_categories',
                                    'update_categories',
                                    'delete_categories',
                                ] ) ? (
                                    <Dropdown
                                        align="left"
                                        width="48"
                                        contentClasses={`px-1 py-0 bg-gray-200`}
                                        trigger={
                                            <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                                <div>Product Management</div>
                                                <div className="ml-1">
                                                    <AiOutlineCaretDown />
                                                </div>
                                            </button>
                                        }>
                                        {checkPermission( [
                                            'view_products',
                                            'create_products',
                                            'update_products',
                                            'delete_products',
                                        ] ) ? (
                                            <DropdownLink
                                                href="/product"
                                                active={router.pathname
                                                    .includes( 'product' )
                                                    .toString()}>
                                                Product
                                            </DropdownLink>
                                        ) : null}

                                        {checkPermission( [
                                            'view_categories',
                                            'create_categories',
                                            'update_categories',
                                            'delete_categories',
                                        ] ) ? (
                                            <DropdownLink
                                                href="/category"
                                                active={router.pathname
                                                    .includes( 'category' )
                                                    .toString()}>
                                                Category
                                            </DropdownLink>
                                        ) : null}
                                        {checkPermission( [
                                            'view_options',
                                            'create_options',
                                            'update_options',
                                            'delete_options',
                                        ] ) ? (
                                            <DropdownLink
                                                href="/options"
                                                active={router.pathname
                                                    .includes( 'options' )
                                                    .toString()}>
                                                Variant
                                            </DropdownLink>
                                        ) : null}

                                        {checkPermission( [
                                            'create_products',
                                            'update_products',
                                            'delete_products',
                                        ] ) ? (
                                            <>
                                                <DropdownLink
                                                    href="/suppliers"
                                                    active={router.pathname
                                                        .includes( 'suppliers' )
                                                        .toString()}>
                                                    Supplier
                                                </DropdownLink>
                                                <DropdownLink
                                                    href="/brands"
                                                    active={router.pathname
                                                        .includes( 'brands' )
                                                        .toString()}>
                                                    Brands
                                                </DropdownLink>
                                                <DropdownLink
                                                    href="/units"
                                                    active={router.pathname
                                                        .includes( 'units' )
                                                        .toString()}>
                                                    Units
                                                </DropdownLink>
                                            </>
                                        ) : null}
                                    </Dropdown>
                                ) : null}
                                {checkPermission( 'Super Admin' ) ? (
                                    <>
                                        <NavLink
                                            href="/activity"
                                            active={
                                                router.pathname === '/activity'
                                            }>
                                            Activity
                                        </NavLink>
                                        <Dropdown
                                            align="left"
                                            width="48"
                                            contentClasses={`px-1 py-0 bg-gray-200`}
                                            trigger={
                                                <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out z-40 overflow-hidden">
                                                    <div>Organization</div>
                                                    <div className="ml-1">
                                                        <AiOutlineCaretDown />
                                                    </div>
                                                </button>
                                            }>
                                            <DropdownLink
                                                href="/organization"
                                                active={router.pathname
                                                    .includes( 'organization' )
                                                    .toString()}>
                                                Organization
                                            </DropdownLink>
                                            <DropdownLink
                                                href="/branch"
                                                active={router.pathname
                                                    .includes( 'branch' )
                                                    .toString()}>
                                                Branch
                                            </DropdownLink>
                                            <DropdownLink
                                                href="/department"
                                                active={router.pathname
                                                    .includes( 'department' )
                                                    .toString()}>
                                                Department
                                            </DropdownLink>
                                            <DropdownLink
                                                href="/designation"
                                                active={router.pathname
                                                    .includes( 'designation' )
                                                    .toString()}>
                                                Designation
                                            </DropdownLink>
                                            <DropdownLink
                                                href="/employees"
                                                active={router.pathname
                                                    .includes( 'employees' )
                                                    .toString()}>
                                                Employees
                                            </DropdownLink>
                                            <DropdownLink
                                                href="/roles"
                                                active={router.pathname
                                                    .includes( 'roles' )
                                                    .toString()}>
                                                Roles
                                            </DropdownLink>
                                            <DropdownLink
                                                href="/permissions"
                                                active={router.pathname
                                                    .includes( 'permissions' )
                                                    .toString()}>
                                                Permissions
                                            </DropdownLink>
                                        </Dropdown>
                                    </>
                                ) : null}
                            </div>
                        </div>

                        {/* Settings Dropdown */}
                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <Dropdown
                                align="right"
                                width="48"
                                trigger={
                                    <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                        <div>{user?.name}</div>

                                        <div className="ml-1">
                                            <AiOutlineCaretDown />
                                        </div>
                                    </button>
                                }>
                                {/* Authentication */}
                                <DropdownButton
                                    onClick={() =>
                                        router.push(
                                            `/employees/${user?.id}/profile`,
                                        )
                                    }>
                                    Edit Profile
                                </DropdownButton>
                                <DropdownButton onClick={logout}>
                                    Logout
                                </DropdownButton>
                            </Dropdown>
                        </div>

                        {/* Hamburger */}
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setOpen( open => !open )}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out">
                                {open ? (
                                    <AiOutlineClose className="h-6 w-6" />
                                ) : (
                                    <AiOutlineMenu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Responsive Navigation Menu */}
                {open && (
                    <div className="block sm:hidden">
                        <div className="pt-2 pb-3 space-y-1">
                            <ResponsiveNavLink
                                href="/dashboard"
                                active={router.pathname === '/dashboard'}>
                                Dashboard
                            </ResponsiveNavLink>
                            <Dropdown
                                align="right"
                                width="48"
                                trigger={
                                    <button className="pl-3 pr-4 py-2 border-l-4 text-base font-medium leading-5 focus:outline-none transition duration-150 ease-in-out border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 flex flex-row">
                                        <div>Organization</div>
                                        <div className="ml-1">
                                            <AiOutlineCaretDown className="fill-current h-4 w-4" />
                                        </div>
                                    </button>
                                }>
                                <DropdownLink
                                    href="/organization"
                                    active={router.pathname
                                        .includes( 'organization' )
                                        .toString()}>
                                    Organization
                                </DropdownLink>
                                <DropdownLink
                                    href="/branch"
                                    active={router.pathname
                                        .includes( 'branch' )
                                        .toString()}>
                                    Branch
                                </DropdownLink>
                                <DropdownLink
                                    href="/department"
                                    active={router.pathname
                                        .includes( 'department' )
                                        .toString()}>
                                    Department
                                </DropdownLink>
                                <DropdownLink
                                    href="/designation"
                                    active={router.pathname
                                        .includes( 'designation' )
                                        .toString()}>
                                    Designation
                                </DropdownLink>
                                <DropdownLink
                                    href="/employees"
                                    active={router.pathname
                                        .includes( 'employees' )
                                        .toString()}>
                                    Employees
                                </DropdownLink>
                                <DropdownLink
                                    href="/roles"
                                    active={router.pathname
                                        .includes( 'roles' )
                                        .toString()}>
                                    Roles
                                </DropdownLink>
                            </Dropdown>
                            <Dropdown
                                align="right"
                                width="48"
                                trigger={
                                    <button className="pl-3 pr-4 py-2 border-l-4 text-base font-medium leading-5 focus:outline-none transition duration-150 ease-in-out border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 flex flex-row">
                                        <div>Products</div>
                                        <div className="ml-1">
                                            <AiOutlineCaretDown className="fill-current h-4 w-4" />
                                        </div>
                                    </button>
                                }>
                                <DropdownLink
                                    href="/product"
                                    active={router.pathname
                                        .includes( 'product' )
                                        .toString()}>
                                    Product
                                </DropdownLink>
                                <DropdownLink
                                    href="/category"
                                    active={router.pathname
                                        .includes( 'category' )
                                        .toString()}>
                                    Category
                                </DropdownLink>
                                <DropdownLink
                                    href="/options"
                                    active={router.pathname
                                        .includes( 'options' )
                                        .toString()}>
                                    Options
                                </DropdownLink>
                            </Dropdown>
                            <Dropdown
                                align="left"
                                width="48"
                                contentClasses={`px-1 py-0 bg-gray-200`}
                                trigger={
                                    <button className="pl-3 pr-4 py-2 border-l-4 text-base font-medium leading-5 focus:outline-none transition duration-150 ease-in-out border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 flex flex-row">
                                        <div>Store</div>
                                        <div className="ml-1">
                                            <AiOutlineCaretDown />
                                        </div>
                                    </button>
                                }>
                                <DropdownLink
                                    href="/purchase"
                                    active={router.pathname
                                        .includes( 'purchase' )
                                        .toString()}>
                                    Purchase
                                </DropdownLink>
                                <DropdownLink
                                    href="/issue"
                                    active={router.pathname
                                        .includes( 'issue' )
                                        .toString()}>
                                    Issue
                                </DropdownLink>
                                <DropdownLink
                                    href="/brands"
                                    active={router.pathname
                                        .includes( 'brands' )
                                        .toString()}>
                                    Brands
                                </DropdownLink>
                                <DropdownLink
                                    href="/units"
                                    active={router.pathname
                                        .includes( 'units' )
                                        .toString()}>
                                    Units
                                </DropdownLink>
                            </Dropdown>
                            <Dropdown
                                align="right"
                                width="48"
                                trigger={
                                    <button className="pl-3 pr-4 py-2 border-l-4 text-base font-medium leading-5 focus:outline-none transition duration-150 ease-in-out border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 flex flex-row">
                                        <div>Requisition</div>
                                        <div className="ml-1">
                                            <AiOutlineCaretDown className="fill-current h-4 w-4" />
                                        </div>
                                    </button>
                                }>
                                <DropdownLink
                                    href="/initial-requisition"
                                    active={router.pathname
                                        .includes( 'initial-requisition' )
                                        .toString()}>
                                    Initial
                                </DropdownLink>
                                <DropdownLink
                                    href="/purchase-requisition"
                                    active={router.pathname
                                        .includes( 'purchase-requisition' )
                                        .toString()}>
                                    Purchase
                                </DropdownLink>
                            </Dropdown>
                            {/*<ResponsiveNavLink*/}
                            {/*  href="/branch"*/}
                            {/*  active={router.pathname === '/branch'}>*/}
                            {/*    Branch*/}
                            {/*</ResponsiveNavLink>*/}
                        </div>

                        {/* Responsive Settings Options */}
                        <div className="pt-4 pb-1 border-t border-gray-200">
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    <AiOutlineCaretDown className="fill-current h-4 w-4" />
                                </div>

                                <div className="ml-3">
                                    <div className="font-medium text-base text-gray-800">
                                        {user?.name}
                                    </div>
                                    <div className="font-medium text-sm text-gray-500">
                                        {user?.email}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                {/* Authentication */}
                                <ResponsiveNavButton onClick={logout}>
                                    Logout
                                </ResponsiveNavButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navigation
