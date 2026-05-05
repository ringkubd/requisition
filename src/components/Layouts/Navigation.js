import ApplicationLogo from "@/components/applicationLogo";
import Dropdown from "@/components/dropdown";
import Link from "next/link";
import NavLink from "@/components/navLink";
import ResponsiveNavLink, {
    ResponsiveNavButton,
} from "@/components/responsiveNavLink";
import DropdownLink, { DropdownButton } from "@/components/dropdownLink";
import { useAuth } from "@/hooks/auth";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
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
    AiOutlineSetting,
} from "react-icons/ai";
import {
    HiOutlineClipboardList,
    HiOutlineCube,
    HiOutlineOfficeBuilding,
    HiOutlineCollection,
} from "react-icons/hi";

const Navigation = ({ user }) => {
    const router = useRouter();
    const { logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Close mobile menu when route changes
    useEffect(() => {
        const handleRouteChange = () => {
            setOpen(false);
            setActiveDropdown(null);
        };
        router.events.on("routeChangeComplete", handleRouteChange);
        return () =>
            router.events.off("routeChangeComplete", handleRouteChange);
    }, [router]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (open && !event.target.closest(".mobile-nav")) {
                setOpen(false);
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    function checkPermission(permission) {
        if (user) {
            const roles = user.role_object;
            const permissions = user.permissions;
            if (roles.filter((r) => r.name === "Super Admin").length) {
                return true;
            } else {
                return permissions.filter((p) => {
                    if (permission instanceof Object) {
                        return permission.indexOf(p.name) !== -1
                            ? p.name
                            : null;
                    } else {
                        return permission === p.name ? p.name : null;
                    }
                }).length;
            }
        }
        return false;
    }

    const toggleDropdown = (dropdown) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    const MobileNavItem = ({
        icon,
        title,
        href,
        active,
        onClick,
        children,
    }) => (
        <div className="mb-1">
            {href ? (
                <Link href={href}>
                    <div
                        onClick={() => setOpen(false)}
                        className={`flex items-center px-5 py-3.5 text-base font-medium transition-all duration-200 active:scale-[0.98] ${
                            active
                                ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 active:bg-slate-100 dark:active:bg-slate-700/70"
                        }`}
                    >
                        <div className="mr-3 text-lg flex-shrink-0">{icon}</div>
                        <span className="flex-1 truncate">{title}</span>
                    </div>
                </Link>
            ) : (
                <div
                    onClick={onClick}
                    className={`flex items-center px-5 py-3.5 text-base font-medium transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                        activeDropdown === title
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 active:bg-slate-100 dark:active:bg-slate-700/70"
                    }`}
                >
                    <div className="mr-3 text-lg flex-shrink-0">{icon}</div>
                    <span className="flex-1 truncate">{title}</span>
                    <AiOutlineCaretDown
                        className={`transform transition-transform duration-200 flex-shrink-0 ${
                            activeDropdown === title ? "rotate-180" : ""
                        }`}
                    />
                </div>
            )}
            {children && activeDropdown === title && (
                <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                    {children}
                </div>
            )}
        </div>
    );

    const MobileSubItem = ({ href, title, active }) => (
        <Link href={href}>
            <div
                onClick={() => setOpen(false)}
                className={`px-11 py-2.5 text-sm transition-all duration-200 active:scale-[0.98] ${
                    active
                        ? "bg-blue-100 text-blue-700 font-medium border-r-2 border-blue-400 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-500"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700"
                }`}
            >
                <span className="truncate block">{title}</span>
            </div>
        </Link>
    );

    const { dark, toggle } = useTheme();

    return (
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700 shadow-lg relative z-50">
            <div
                className={`before:content-[''] before:bg-noise relative before:w-full before:h-full before:block  before:opacity-10`}
            >
                {/* Primary Navigation Menu */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            {/* Logo */}
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/dashboard">
                                    <ApplicationLogo className="block h-10 w-auto fill-current text-slate-700 dark:text-slate-200" />
                                </Link>
                            </div>

                            {/* Desktop Navigation Links */}
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex sm:items-center">
                                <NavLink
                                    href="/dashboard"
                                    active={router.pathname === "/dashboard"}
                                >
                                    Dashboard
                                </NavLink>
                                {checkPermission([
                                    "view_initial-requisitions",
                                    "create_initial-requisitions",
                                    "update_initial-requisitions",
                                    "delete_initial-requisitions",
                                    "view_purchase-requisitions",
                                    "create_purchase-requisitions",
                                    "update_purchase-requisitions",
                                    "delete_purchase-requisitions",
                                ]) ? (
                                    <Dropdown
                                        align="right"
                                        width="48"
                                        trigger={
                                            <button className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 focus:outline-none transition duration-150 ease-in-out">
                                                <div>Requisition</div>
                                                <div className="ml-1">
                                                    <AiOutlineCaretDown />
                                                </div>
                                            </button>
                                        }
                                    >
                                        {checkPermission([
                                            "view_initial-requisitions",
                                            "create_initial-requisitions",
                                            "update_initial-requisitions",
                                            "delete_initial-requisitions",
                                        ]) ? (
                                            <DropdownLink
                                                href="/initial-requisition"
                                                active={router.pathname
                                                    .includes(
                                                        "initial-requisition"
                                                    )
                                                    .toString()}
                                            >
                                                Initial
                                            </DropdownLink>
                                        ) : (
                                            ""
                                        )}
                                        {checkPermission([
                                            "view_purchase-requisitions",
                                            "create_purchase-requisitions",
                                            "update_purchase-requisitions",
                                            "delete_purchase-requisitions",
                                        ]) ? (
                                            <DropdownLink
                                                href="/purchase-requisition"
                                                active={router.pathname
                                                    .includes(
                                                        "purchase-requisition"
                                                    )
                                                    .toString()}
                                            >
                                                Purchase
                                            </DropdownLink>
                                        ) : (
                                            ""
                                        )}
                                        {checkPermission([
                                            "view_cash-requisitions",
                                            "create_cash-requisitions",
                                            "update_cash-requisitions",
                                            "delete_cash-requisitions",
                                        ]) ? (
                                            <DropdownLink
                                                href="/cash-requisition"
                                                active={router.pathname
                                                    .includes(
                                                        "cash-requisition"
                                                    )
                                                    .toString()}
                                            >
                                                Cash
                                            </DropdownLink>
                                        ) : (
                                            ""
                                        )}
                                    </Dropdown>
                                ) : (
                                    ""
                                )}
                                {/* Inventory */}
                                {checkPermission([
                                    "view_purchases",
                                    "create_purchases",
                                    "update_purchases",
                                    "delete_purchases",
                                    "view_product-issues",
                                    "create_product-issues",
                                    "update_product-issues",
                                    "delete_product-issues",
                                    "approve_department_issue",
                                ]) ? (
                                    <Dropdown
                                        align="left"
                                        width="48"
                                        contentClasses={`px-1 py-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700`}
                                        trigger={
                                            <button className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 focus:outline-none transition duration-150 ease-in-out">
                                                <div>Inventory</div>
                                                <div className="ml-1">
                                                    <AiOutlineCaretDown />
                                                </div>
                                            </button>
                                        }
                                    >
                                        {checkPermission([
                                            "view_purchases",
                                            "create_purchases",
                                            "update_purchases",
                                            "delete_purchases",
                                        ]) ? (
                                            <DropdownLink
                                                href="/purchase"
                                                active={router.pathname
                                                    .includes("purchase")
                                                    .toString()}
                                            >
                                                Receive
                                            </DropdownLink>
                                        ) : null}
                                        {checkPermission([
                                            "view_product-issues",
                                            "create_product-issues",
                                            "update_product-issues",
                                            "delete_product-issues",
                                            "approve_department_issue",
                                        ]) ? (
                                            <DropdownLink
                                                href="/issue"
                                                active={router.pathname
                                                    .includes("issue")
                                                    .toString()}
                                            >
                                                Issue
                                            </DropdownLink>
                                        ) : null}
                                        {checkPermission([
                                            "view_purchases",
                                            "create_purchases",
                                            "update_purchases",
                                            "delete_purchases",
                                        ]) ? (
                                            <>
                                                <DropdownLink
                                                    href="/product/report"
                                                    active={router.pathname
                                                        .includes("report")
                                                        .toString()}
                                                >
                                                    Report
                                                </DropdownLink>
                                                <DropdownLink
                                                    href="/report/stock_report"
                                                    active={router.pathname
                                                        .includes("report")
                                                        .toString()}
                                                >
                                                    Audit Report
                                                </DropdownLink>
                                                <DropdownLink
                                                    href="/vehicle/report"
                                                    active={router.pathname
                                                        .includes("vehicle")
                                                        .toString()}
                                                >
                                                    Fuel
                                                </DropdownLink>
                                            </>
                                        ) : null}
                                    </Dropdown>
                                ) : null}
                                {checkPermission([
                                    "view_products",
                                    "create_products",
                                    "update_products",
                                    "delete_products",
                                    "view_options",
                                    "create_options",
                                    "update_options",
                                    "delete_options",
                                    "view_categories",
                                    "create_categories",
                                    "update_categories",
                                    "delete_categories",
                                ]) ? (
                                    <Dropdown
                                        align="left"
                                        width="48"
                                        contentClasses={`px-1 py-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700`}
                                        trigger={
                                            <button className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 focus:outline-none transition duration-150 ease-in-out">
                                                <div>Product Management</div>
                                                <div className="ml-1">
                                                    <AiOutlineCaretDown />
                                                </div>
                                            </button>
                                        }
                                    >
                                        {checkPermission([
                                            "view_products",
                                            "create_products",
                                            "update_products",
                                            "delete_products",
                                        ]) ? (
                                            <DropdownLink
                                                href="/product"
                                                active={router.pathname
                                                    .includes("product")
                                                    .toString()}
                                            >
                                                Product
                                            </DropdownLink>
                                        ) : null}

                                        {checkPermission([
                                            "view_categories",
                                            "create_categories",
                                            "update_categories",
                                            "delete_categories",
                                        ]) ? (
                                            <DropdownLink
                                                href="/category"
                                                active={router.pathname
                                                    .includes("category")
                                                    .toString()}
                                            >
                                                Category
                                            </DropdownLink>
                                        ) : null}
                                        {checkPermission([
                                            "view_options",
                                            "create_options",
                                            "update_options",
                                            "delete_options",
                                        ]) ? (
                                            <DropdownLink
                                                href="/options"
                                                active={router.pathname
                                                    .includes("options")
                                                    .toString()}
                                            >
                                                Variant
                                            </DropdownLink>
                                        ) : null}

                                        {checkPermission([
                                            "create_products",
                                            "update_products",
                                            "delete_products",
                                        ]) ? (
                                            <>
                                                <DropdownLink
                                                    href="/suppliers"
                                                    active={router.pathname
                                                        .includes("suppliers")
                                                        .toString()}
                                                >
                                                    Supplier
                                                </DropdownLink>
                                                <DropdownLink
                                                    href="/brands"
                                                    active={router.pathname
                                                        .includes("brands")
                                                        .toString()}
                                                >
                                                    Brands
                                                </DropdownLink>
                                                <DropdownLink
                                                    href="/units"
                                                    active={router.pathname
                                                        .includes("units")
                                                        .toString()}
                                                >
                                                    Units
                                                </DropdownLink>
                                            </>
                                        ) : null}
                                    </Dropdown>
                                ) : null}
                                {checkPermission("Super Admin") ? (
                                    <>
                                        <NavLink
                                            href="/activity"
                                            active={
                                                router.pathname === "/activity"
                                            }
                                        >
                                            Activity
                                        </NavLink>
                                        <Dropdown
                                            align="left"
                                            width="48"
                                            contentClasses={`px-1 py-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700`}
                                            trigger={
                                                <button className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 focus:outline-none transition duration-150 ease-in-out z-40 overflow-hidden">
                                                    <div>Organization</div>
                                                    <div className="ml-1">
                                                        <AiOutlineCaretDown />
                                                    </div>
                                                </button>
                                            }
                                        >
                                            <DropdownLink
                                                href="/organization"
                                                active={router.pathname
                                                    .includes("organization")
                                                    .toString()}
                                            >
                                                Organization
                                            </DropdownLink>
                                            <DropdownLink
                                                href="/branch"
                                                active={router.pathname
                                                    .includes("branch")
                                                    .toString()}
                                            >
                                                Branch
                                            </DropdownLink>
                                            <DropdownLink
                                                href="/department"
                                                active={router.pathname
                                                    .includes("department")
                                                    .toString()}
                                            >
                                                Department
                                            </DropdownLink>
                                            <DropdownLink
                                                href="/designation"
                                                active={router.pathname
                                                    .includes("designation")
                                                    .toString()}
                                            >
                                                Designation
                                            </DropdownLink>
                                            <DropdownLink
                                                href="/employees"
                                                active={router.pathname
                                                    .includes("employees")
                                                    .toString()}
                                            >
                                                Employees
                                            </DropdownLink>
                                            <DropdownLink
                                                href="/roles"
                                                active={router.pathname
                                                    .includes("roles")
                                                    .toString()}
                                            >
                                                Roles
                                            </DropdownLink>
                                            <DropdownLink
                                                href="/permissions"
                                                active={router.pathname
                                                    .includes("permissions")
                                                    .toString()}
                                            >
                                                Permissions
                                            </DropdownLink>
                                             <DropdownLink
                                                href="/whatsapplog"
                                                active={router.pathname
                                                    .includes("whatsapplog")
                                                    .toString()}
                                            >
                                                WhatsApp Log
                                            </DropdownLink>
                                        </Dropdown>
                                    </>
                                ) : null}
                            </div>
                        </div>

                        {/* Theme Toggle & Settings Dropdown */}
                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <button
                                onClick={toggle}
                                className="mr-3 p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {dark ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                )}
                            </button>
                            <Dropdown
                                align="right"
                                width="48"
                                trigger={
                                    <button className="flex items-center text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 focus:outline-none transition duration-150 ease-in-out">
                                        <div>{user?.name}</div>

                                        <div className="ml-1">
                                            <AiOutlineCaretDown />
                                        </div>
                                    </button>
                                }
                            >
                                {/* Authentication */}
                                <DropdownButton
                                    onClick={() =>
                                        router.push(
                                            `/employees/${user?.id}/profile`
                                        )
                                    }
                                >
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
                                onClick={() => setOpen((open) => !open)}
                                className="relative inline-flex items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-700 dark:focus:text-slate-100 transition duration-200 ease-in-out"
                                aria-label="Toggle menu"
                            >
                                <div className="w-6 h-6 relative">
                                    <span
                                        className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                                            open
                                                ? "rotate-45 translate-y-1.5"
                                                : "-translate-y-1"
                                        }`}
                                    />
                                    <span
                                        className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                                            open ? "opacity-0" : "opacity-100"
                                        }`}
                                    />
                                    <span
                                        className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                                            open
                                                ? "-rotate-45 -translate-y-1.5"
                                                : "translate-y-1"
                                        }`}
                                    />
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
                        <div className="mobile-nav fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white dark:bg-slate-800 shadow-2xl z-50 sm:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto">
                            {/* Mobile Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 sticky top-0 z-10 shadow-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <AiOutlineUser className="text-xl" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-base truncate">
                                                {user?.name}
                                            </div>
                                            <div className="text-blue-200 text-xs truncate">
                                                {user?.email}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors flex-shrink-0 ml-2"
                                    >
                                        <AiOutlineClose className="text-xl" />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Navigation Items */}
                            <div className="py-2 pb-32">
                                {/* Added bottom padding for footer */}
                                {/* Dashboard */}
                                <MobileNavItem
                                    icon={<AiOutlineHome />}
                                    title="Dashboard"
                                    href="/dashboard"
                                    active={router.pathname === "/dashboard"}
                                />

                                {/* Requisition */}
                                {checkPermission([
                                    "view_initial-requisitions",
                                    "create_initial-requisitions",
                                    "update_initial-requisitions",
                                    "delete_initial-requisitions",
                                    "view_purchase-requisitions",
                                    "create_purchase-requisitions",
                                    "update_purchase-requisitions",
                                    "delete_purchase-requisitions",
                                ]) && (
                                    <MobileNavItem
                                        icon={<HiOutlineClipboardList />}
                                        title="Requisition"
                                        onClick={() =>
                                            toggleDropdown("Requisition")
                                        }
                                    >
                                        {checkPermission([
                                            "view_initial-requisitions",
                                            "create_initial-requisitions",
                                            "update_initial-requisitions",
                                            "delete_initial-requisitions",
                                        ]) && (
                                            <MobileSubItem
                                                href="/initial-requisition"
                                                title="Initial Requisition"
                                                active={router.pathname.includes(
                                                    "initial-requisition"
                                                )}
                                            />
                                        )}
                                        {checkPermission([
                                            "view_purchase-requisitions",
                                            "create_purchase-requisitions",
                                            "update_purchase-requisitions",
                                            "delete_purchase-requisitions",
                                        ]) && (
                                            <MobileSubItem
                                                href="/purchase-requisition"
                                                title="Purchase Requisition"
                                                active={router.pathname.includes(
                                                    "purchase-requisition"
                                                )}
                                            />
                                        )}
                                        {checkPermission([
                                            "view_cash-requisitions",
                                            "create_cash-requisitions",
                                            "update_cash-requisitions",
                                            "delete_cash-requisitions",
                                        ]) && (
                                            <MobileSubItem
                                                href="/cash-requisition"
                                                title="Cash Requisition"
                                                active={router.pathname.includes(
                                                    "cash-requisition"
                                                )}
                                            />
                                        )}
                                    </MobileNavItem>
                                )}

                                {/* Inventory */}
                                {checkPermission([
                                    "view_purchases",
                                    "create_purchases",
                                    "update_purchases",
                                    "delete_purchases",
                                    "view_product-issues",
                                    "create_product-issues",
                                    "update_product-issues",
                                    "delete_product-issues",
                                    "approve_department_issue",
                                ]) && (
                                    <MobileNavItem
                                        icon={<HiOutlineCube />}
                                        title="Inventory"
                                        onClick={() =>
                                            toggleDropdown("Inventory")
                                        }
                                    >
                                        {checkPermission([
                                            "view_purchases",
                                            "create_purchases",
                                            "update_purchases",
                                            "delete_purchases",
                                        ]) && (
                                            <MobileSubItem
                                                href="/purchase"
                                                title="Receive"
                                                active={router.pathname.includes(
                                                    "purchase"
                                                )}
                                            />
                                        )}
                                        {checkPermission([
                                            "view_product-issues",
                                            "create_product-issues",
                                            "update_product-issues",
                                            "delete_product-issues",
                                            "approve_department_issue",
                                        ]) && (
                                            <MobileSubItem
                                                href="/issue"
                                                title="Issue"
                                                active={router.pathname.includes(
                                                    "issue"
                                                )}
                                            />
                                        )}
                                        {checkPermission([
                                            "view_purchases",
                                            "create_purchases",
                                            "update_purchases",
                                            "delete_purchases",
                                        ]) && (
                                            <>
                                                <MobileSubItem
                                                    href="/product/report"
                                                    title="Report"
                                                    active={router.pathname.includes(
                                                        "product/report"
                                                    )}
                                                />
                                                <MobileSubItem
                                                    href="/report/stock_report"
                                                    title="Audit Report"
                                                    active={router.pathname.includes(
                                                        "stock_report"
                                                    )}
                                                />
                                                <MobileSubItem
                                                    href="/vehicle/report"
                                                    title="Fuel Report"
                                                    active={router.pathname.includes(
                                                        "vehicle"
                                                    )}
                                                />
                                            </>
                                        )}
                                    </MobileNavItem>
                                )}

                                {/* Product Management */}
                                {checkPermission([
                                    "view_products",
                                    "create_products",
                                    "update_products",
                                    "delete_products",
                                    "view_options",
                                    "create_options",
                                    "update_options",
                                    "delete_options",
                                    "view_categories",
                                    "create_categories",
                                    "update_categories",
                                    "delete_categories",
                                ]) && (
                                    <MobileNavItem
                                        icon={<AiOutlineAppstore />}
                                        title="Product Management"
                                        onClick={() =>
                                            toggleDropdown("Product Management")
                                        }
                                    >
                                        {checkPermission([
                                            "view_products",
                                            "create_products",
                                            "update_products",
                                            "delete_products",
                                        ]) && (
                                            <MobileSubItem
                                                href="/product"
                                                title="Product"
                                                active={router.pathname.includes(
                                                    "product"
                                                )}
                                            />
                                        )}
                                        {checkPermission([
                                            "view_categories",
                                            "create_categories",
                                            "update_categories",
                                            "delete_categories",
                                        ]) && (
                                            <MobileSubItem
                                                href="/category"
                                                title="Category"
                                                active={router.pathname.includes(
                                                    "category"
                                                )}
                                            />
                                        )}
                                        {checkPermission([
                                            "view_options",
                                            "create_options",
                                            "update_options",
                                            "delete_options",
                                        ]) && (
                                            <MobileSubItem
                                                href="/options"
                                                title="Variant"
                                                active={router.pathname.includes(
                                                    "options"
                                                )}
                                            />
                                        )}
                                        {checkPermission([
                                            "create_products",
                                            "update_products",
                                            "delete_products",
                                        ]) && (
                                            <>
                                                <MobileSubItem
                                                    href="/suppliers"
                                                    title="Supplier"
                                                    active={router.pathname.includes(
                                                        "suppliers"
                                                    )}
                                                />
                                                <MobileSubItem
                                                    href="/brands"
                                                    title="Brands"
                                                    active={router.pathname.includes(
                                                        "brands"
                                                    )}
                                                />
                                                <MobileSubItem
                                                    href="/units"
                                                    title="Units"
                                                    active={router.pathname.includes(
                                                        "units"
                                                    )}
                                                />
                                            </>
                                        )}
                                    </MobileNavItem>
                                )}

                                {/* Activity */}
                                {checkPermission("Super Admin") && (
                                    <MobileNavItem
                                        icon={<AiOutlineBarChart />}
                                        title="Activity"
                                        href="/activity"
                                        active={router.pathname === "/activity"}
                                    />
                                )}

                                {/* Organization */}
                                {checkPermission("Super Admin") && (
                                    <MobileNavItem
                                        icon={<HiOutlineOfficeBuilding />}
                                        title="Organization"
                                        onClick={() =>
                                            toggleDropdown("Organization")
                                        }
                                    >
                                        <MobileSubItem
                                            href="/organization"
                                            title="Organization"
                                            active={router.pathname.includes(
                                                "organization"
                                            )}
                                        />
                                        <MobileSubItem
                                            href="/branch"
                                            title="Branch"
                                            active={router.pathname.includes(
                                                "branch"
                                            )}
                                        />
                                        <MobileSubItem
                                            href="/department"
                                            title="Department"
                                            active={router.pathname.includes(
                                                "department"
                                            )}
                                        />
                                        <MobileSubItem
                                            href="/designation"
                                            title="Designation"
                                            active={router.pathname.includes(
                                                "designation"
                                            )}
                                        />
                                        <MobileSubItem
                                            href="/employees"
                                            title="Employees"
                                            active={router.pathname.includes(
                                                "employees"
                                            )}
                                        />
                                        <MobileSubItem
                                            href="/roles"
                                            title="Roles"
                                            active={router.pathname.includes(
                                                "roles"
                                            )}
                                        />
                                        <MobileSubItem
                                            href="/permissions"
                                            title="Permissions"
                                            active={router.pathname.includes(
                                                "permissions"
                                            )}
                                        />
                                    </MobileNavItem>
                                )}
                            </div>

                            {/* Mobile Footer Actions - Sticky at bottom */}
                            <div className="fixed bottom-0 right-0 w-80 max-w-[90vw] bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-6 py-4 shadow-lg">
                                <button
                                    onClick={toggle}
                                className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 mb-2"
                                    >
                                    {dark ? (
                                        <svg className="mr-3 text-xl flex-shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    ) : (
                                        <svg className="mr-3 text-xl flex-shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                    )}
                                    <span className="text-base font-medium">
                                        {dark ? 'Light Mode' : 'Dark Mode'}
                                    </span>
                                </button>
                                <button
                                    onClick={() => {
                                        router.push(
                                            `/employees/${user?.id}/profile`
                                        );
                                        setOpen(false);
                                    }}
                                    className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 mb-2"
                                >
                                    <AiOutlineSetting className="mr-3 text-xl flex-shrink-0" />
                                    <span className="text-base font-medium">
                                        Edit Profile
                                    </span>
                                </button>
                                <button
                                    onClick={() => {
                                        logout();
                                        setOpen(false);
                                    }}
                                    className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                >
                                    <AiOutlineLogout className="mr-3 text-xl flex-shrink-0" />
                                    <span className="text-base font-medium">
                                        Logout
                                    </span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navigation;
