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
import { useState, useEffect } from 'react'
import {
    AiOutlineClose,
    AiOutlineMenu,
    AiOutlineCaretDown,
    AiOutlineHome,
    AiOutlineFileText,
    AiOutlineShoppingCart,
    AiOutlineBarChart,
    AiOutlineUser,
    AiOutlineLogout,
    AiOutlineAppstore,
    AiOutlineSetting
} from 'react-icons/ai'
import {
    HiOutlineClipboardList,
    HiOutlineCube,
    HiOutlineOfficeBuilding,
    HiOutlineCollection
} from 'react-icons/hi'

const Navigation = ( { user } ) =>
{
    const router = useRouter()
    const { logout } = useAuth()
    const [ open, setOpen ] = useState( false )
    const [ activeDropdown, setActiveDropdown ] = useState( null )

    // Close mobile menu when route changes
    useEffect(() => {
        const handleRouteChange = () => {
            setOpen(false)
            setActiveDropdown(null)
        }
        router.events.on('routeChangeComplete', handleRouteChange)
        return () => router.events.off('routeChangeComplete', handleRouteChange)
    }, [router])

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (open && !event.target.closest('.mobile-nav')) {
                setOpen(false)
                setActiveDropdown(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

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

    const toggleDropdown = (dropdown) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
    }

    const MobileNavItem = ({ icon, title, href, active, onClick, children }) => (
        <div className="mb-2">
            {href ? (
                <Link href={href}>
                    <div className={`flex items-center px-6 py-4 text-lg font-medium transition-colors duration-200 ${
                        active ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                        <div className="mr-4 text-xl">{icon}</div>
                        <span className="flex-1">{title}</span>
                    </div>
                </Link>
            ) : (
                <div
                    onClick={onClick}
                    className={`flex items-center px-6 py-4 text-lg font-medium transition-colors duration-200 cursor-pointer ${
                        activeDropdown === title ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <div className="mr-4 text-xl">{icon}</div>
                    <span className="flex-1">{title}</span>
                    <AiOutlineCaretDown className={`transform transition-transform duration-200 ${
                        activeDropdown === title ? 'rotate-180' : ''
                    }`} />
                </div>
            )}
            {children && activeDropdown === title && (
                <div className="bg-gray-50 border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    )

    const MobileSubItem = ({ href, title, active }) => (
        <Link href={href}>
            <div className={`px-12 py-3 text-base transition-colors duration-200 ${
                active ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}>
                {title}
            </div>
        </Link>
    )

    return (
        <nav className="bg-white border-b border-gray-100 shadow-lg relative z-50">
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

                            {/* Desktop Navigation Links */}
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
                                                    href="/report/stock_report"
                                                    active={router.pathname
                                                        .includes( 'report' )
                                                        .toString()}>
                                                    Audit Report
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

                        {/* Modern Mobile Hamburger */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() => setOpen( open => !open )}
                                className="relative inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-200 ease-in-out"
                                aria-label="Toggle menu">
                                <div className="w-6 h-6 relative">
                                    <span className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                                        open ? 'rotate-45 translate-y-1.5' : '-translate-y-1'
                                    }`} />
                                    <span className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                                        open ? 'opacity-0' : 'opacity-100'
                                    }`} />
                                    <span className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                                        open ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'
                                    }`} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modern Mobile Navigation Overlay */}
                {open && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden transition-opacity duration-300"
                            onClick={() => setOpen(false)}
                        />

                        {/* Mobile Navigation Panel */}
                        <div className="mobile-nav fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 sm:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto">
                            {/* Mobile Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                            <AiOutlineUser className="text-xl" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">{user?.name}</div>
                                            <div className="text-blue-200 text-sm">{user?.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                                    >
                                        <AiOutlineClose className="text-xl" />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Navigation Items */}
                            <div className="py-4">
                                {/* Dashboard */}
                                <MobileNavItem
                                    icon={<AiOutlineHome />}
                                    title="Dashboard"
                                    href="/dashboard"
                                    active={router.pathname === '/dashboard'}
                                />

                                {/* Requisition */}
                                {checkPermission([
                                    'view_initial-requisitions',
                                    'create_initial-requisitions',
                                    'update_initial-requisitions',
                                    'delete_initial-requisitions',
                                    'view_purchase-requisitions',
                                    'create_purchase-requisitions',
                                    'update_purchase-requisitions',
                                    'delete_purchase-requisitions',
                                ]) && (
                                    <MobileNavItem
                                        icon={<HiOutlineClipboardList />}
                                        title="Requisition"
                                        onClick={() => toggleDropdown('Requisition')}
                                    >
                                        {checkPermission([
                                            'view_initial-requisitions',
                                            'create_initial-requisitions',
                                            'update_initial-requisitions',
                                            'delete_initial-requisitions',
                                        ]) && (
                                            <MobileSubItem
                                                href="/initial-requisition"
                                                title="Initial Requisition"
                                                active={router.pathname.includes('initial-requisition')}
                                            />
                                        )}
                                        {checkPermission([
                                            'view_purchase-requisitions',
                                            'create_purchase-requisitions',
                                            'update_purchase-requisitions',
                                            'delete_purchase-requisitions',
                                        ]) && (
                                            <MobileSubItem
                                                href="/purchase-requisition"
                                                title="Purchase Requisition"
                                                active={router.pathname.includes('purchase-requisition')}
                                            />
                                        )}
                                        {checkPermission([
                                            'view_cash-requisitions',
                                            'create_cash-requisitions',
                                            'update_cash-requisitions',
                                            'delete_cash-requisitions',
                                        ]) && (
                                            <MobileSubItem
                                                href="/cash-requisition"
                                                title="Cash Requisition"
                                                active={router.pathname.includes('cash-requisition')}
                                            />
                                        )}
                                    </MobileNavItem>
                                )}

                                {/* Inventory */}
                                {checkPermission([
                                    'view_purchases',
                                    'create_purchases',
                                    'update_purchases',
                                    'delete_purchases',
                                    'view_product-issues',
                                    'create_product-issues',
                                    'update_product-issues',
                                    'delete_product-issues',
                                    'approve_department_issue'
                                ]) && (
                                    <MobileNavItem
                                        icon={<HiOutlineCube />}
                                        title="Inventory"
                                        onClick={() => toggleDropdown('Inventory')}
                                    >
                                        {checkPermission([
                                            'view_purchases',
                                            'create_purchases',
                                            'update_purchases',
                                            'delete_purchases',
                                        ]) && (
                                            <MobileSubItem
                                                href="/purchase"
                                                title="Receive"
                                                active={router.pathname.includes('purchase')}
                                            />
                                        )}
                                        {checkPermission([
                                            'view_product-issues',
                                            'create_product-issues',
                                            'update_product-issues',
                                            'delete_product-issues',
                                            'approve_department_issue'
                                        ]) && (
                                            <MobileSubItem
                                                href="/issue"
                                                title="Issue"
                                                active={router.pathname.includes('issue')}
                                            />
                                        )}
                                        <MobileSubItem
                                            href="/product/report"
                                            title="Report"
                                            active={router.pathname.includes('product/report')}
                                        />
                                        <MobileSubItem
                                            href="/report/stock_report"
                                            title="Audit Report"
                                            active={router.pathname.includes('stock_report')}
                                        />
                                        <MobileSubItem
                                            href="/vehicle/report"
                                            title="Fuel Report"
                                            active={router.pathname.includes('vehicle')}
                                        />
                                    </MobileNavItem>
                                )}

                                {/* Product Management */}
                                {checkPermission([
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
                                ]) && (
                                    <MobileNavItem
                                        icon={<AiOutlineAppstore />}
                                        title="Product Management"
                                        onClick={() => toggleDropdown('Product Management')}
                                    >
                                        {checkPermission([
                                            'view_products',
                                            'create_products',
                                            'update_products',
                                            'delete_products',
                                        ]) && (
                                            <MobileSubItem
                                                href="/product"
                                                title="Product"
                                                active={router.pathname.includes('product')}
                                            />
                                        )}
                                        {checkPermission([
                                            'view_categories',
                                            'create_categories',
                                            'update_categories',
                                            'delete_categories',
                                        ]) && (
                                            <MobileSubItem
                                                href="/category"
                                                title="Category"
                                                active={router.pathname.includes('category')}
                                            />
                                        )}
                                        {checkPermission([
                                            'view_options',
                                            'create_options',
                                            'update_options',
                                            'delete_options',
                                        ]) && (
                                            <MobileSubItem
                                                href="/options"
                                                title="Variant"
                                                active={router.pathname.includes('options')}
                                            />
                                        )}
                                        <MobileSubItem
                                            href="/suppliers"
                                            title="Supplier"
                                            active={router.pathname.includes('suppliers')}
                                        />
                                        <MobileSubItem
                                            href="/brands"
                                            title="Brands"
                                            active={router.pathname.includes('brands')}
                                        />
                                        <MobileSubItem
                                            href="/units"
                                            title="Units"
                                            active={router.pathname.includes('units')}
                                        />
                                    </MobileNavItem>
                                )}

                                {/* Activity */}
                                {checkPermission('Super Admin') && (
                                    <MobileNavItem
                                        icon={<AiOutlineBarChart />}
                                        title="Activity"
                                        href="/activity"
                                        active={router.pathname === '/activity'}
                                    />
                                )}

                                {/* Organization */}
                                {checkPermission('Super Admin') && (
                                    <MobileNavItem
                                        icon={<HiOutlineOfficeBuilding />}
                                        title="Organization"
                                        onClick={() => toggleDropdown('Organization')}
                                    >
                                        <MobileSubItem
                                            href="/organization"
                                            title="Organization"
                                            active={router.pathname.includes('organization')}
                                        />
                                        <MobileSubItem
                                            href="/branch"
                                            title="Branch"
                                            active={router.pathname.includes('branch')}
                                        />
                                        <MobileSubItem
                                            href="/department"
                                            title="Department"
                                            active={router.pathname.includes('department')}
                                        />
                                        <MobileSubItem
                                            href="/designation"
                                            title="Designation"
                                            active={router.pathname.includes('designation')}
                                        />
                                        <MobileSubItem
                                            href="/employees"
                                            title="Employees"
                                            active={router.pathname.includes('employees')}
                                        />
                                        <MobileSubItem
                                            href="/roles"
                                            title="Roles"
                                            active={router.pathname.includes('roles')}
                                        />
                                        <MobileSubItem
                                            href="/permissions"
                                            title="Permissions"
                                            active={router.pathname.includes('permissions')}
                                        />
                                    </MobileNavItem>
                                )}
                            </div>

                            {/* Mobile Footer Actions */}
                            <div className="border-t border-gray-200 mt-4 pt-4 px-6 pb-6">
                                <button
                                    onClick={() => router.push(`/employees/${user?.id}/profile`)}
                                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 mb-2"
                                >
                                    <AiOutlineSetting className="mr-4 text-xl" />
                                    <span className="text-lg font-medium">Edit Profile</span>
                                </button>
                                <button
                                    onClick={logout}
                                    className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                >
                                    <AiOutlineLogout className="mr-4 text-xl" />
                                    <span className="text-lg font-medium">Logout</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navigation
