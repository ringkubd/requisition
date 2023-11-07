import ApplicationLogo from '@/components/ApplicationLogo'
import Dropdown from '@/components/Dropdown'
import Link from 'next/link'
import NavLink from '@/components/NavLink'
import ResponsiveNavLink, {
    ResponsiveNavButton,
} from '@/components/ResponsiveNavLink'
import DropdownLink, { DropdownButton } from '@/components/DropdownLink'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { AiFillCaretDown, AiOutlineArrowDown, AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { BiCaretDown, BiChevronDown, BiCross, BiSelectMultiple } from "react-icons/bi";
import { BsArchive, BsCaretDown, BsChevronBarDown } from "react-icons/bs";
import { FaRegSquareCaretDown } from "react-icons/fa6";
import { LiaNeos } from "react-icons/lia";
const Navigation = ({ user }) => {
    const router = useRouter()

    const { logout } = useAuth()

    const [open, setOpen] = useState(false)

    return (
        <nav className="bg-white border-b border-gray-100">
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
                            <Dropdown
                              align="left"
                              width="48"
                              contentClasses={`px-1 py-0 bg-gray-200`}
                              trigger={
                                  <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                      <div>Purchase</div>
                                      <div className="ml-1">
                                          <BiChevronDown />
                                      </div>
                                  </button>
                              }
                            >
                                <DropdownLink
                                  href="/purchase"
                                  active={router.pathname.includes('purchase').toString()}
                                >
                                    Purchase
                                </DropdownLink>
                                <DropdownLink
                                    href="/issue"
                                    active={router.pathname.includes('issue').toString()}
                                >
                                    Issue
                                </DropdownLink>
                                <DropdownLink
                                  href="/suppliers"
                                  active={router.pathname.includes('suppliers').toString()}
                                >
                                    Supplier
                                </DropdownLink>
                                <DropdownLink
                                    href="/brands"
                                    active={router.pathname.includes('brands').toString()}
                                >
                                    Brands
                                </DropdownLink>
                            </Dropdown>
                            <Dropdown
                              align="right"
                              width="48"
                              trigger={
                                  <button className="pl-3 pr-4 py-2 border-l-4 text-base font-medium leading-5 focus:outline-none transition duration-150 ease-in-out border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 flex flex-row">
                                      <div>Requisition</div>
                                      <div className="ml-1">
                                          <BiChevronDown />
                                      </div>
                                  </button>
                              }>
                                <DropdownLink
                                  href="/initial-requisition"
                                  active={router.pathname.includes('initial-requisition').toString()}
                                >
                                    Initial
                                </DropdownLink>
                                <DropdownLink
                                  href="/purchase-requisition"
                                  active={router.pathname.includes('purchase-requisition').toString()}
                                >
                                    Purchase
                                </DropdownLink>
                            </Dropdown>
                            <Dropdown
                                align="left"
                                width="48"
                                contentClasses={`px-1 py-0 bg-gray-200`}
                                trigger={
                                    <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                        <div>Products</div>
                                        <div className="ml-1">
                                            <BiChevronDown />
                                        </div>
                                    </button>
                                }
                            >
                                <DropdownLink
                                    href="/product"
                                    active={router.pathname.includes('product').toString()}
                                >
                                    Product
                                </DropdownLink>
                                <DropdownLink
                                    href="/category"
                                    active={router.pathname.includes('category').toString()}
                                >
                                    Category
                                </DropdownLink>
                                <DropdownLink
                                    href="/options"
                                    active={router.pathname.includes('options').toString()}
                                >
                                    Options
                                </DropdownLink>
                            </Dropdown>
                            <Dropdown
                                align="left"
                                width="48"
                                contentClasses={`px-1 py-0 bg-gray-200`}
                                trigger={
                                    <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out z-40 overflow-hidden">
                                        <div>Organization</div>
                                        <div className="ml-1">
                                            <BiChevronDown />
                                        </div>
                                    </button>
                                }
                            >
                                <DropdownLink
                                    href="/organization"
                                    active={router.pathname.includes('organization').toString()}
                                >
                                    Organization
                                </DropdownLink>
                                <DropdownLink
                                    href="/branch"
                                    active={router.pathname.includes('branch').toString()}
                                >
                                    Branch
                                </DropdownLink>
                                <DropdownLink
                                    href="/department"
                                    active={router.pathname.includes('department').toString()}
                                >
                                    Department
                                </DropdownLink>
                                <DropdownLink
                                    href="/designation"
                                    active={router.pathname.includes('designation').toString()}
                                >
                                    Designation
                                </DropdownLink>
                                <DropdownLink
                                    href="/employees"
                                    active={router.pathname.includes('employees').toString()}
                                >
                                    Employees
                                </DropdownLink>
                            </Dropdown>
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
                                        <BiChevronDown />
                                    </div>
                                </button>
                            }>
                            {/* Authentication */}
                            <DropdownButton onClick={logout}>
                                Logout
                            </DropdownButton>
                        </Dropdown>
                    </div>

                    {/* Hamburger */}
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setOpen(open => !open)}
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
                                        <BiChevronDown  className="fill-current h-4 w-4" />
                                    </div>
                                </button>
                            }>
                            <DropdownLink
                                href="/organization"
                                active={router.pathname.includes('organization').toString()}
                            >
                                Organization
                            </DropdownLink>
                            <DropdownLink
                                href="/branch"
                                active={router.pathname.includes('branch').toString()}
                            >
                                Branch
                            </DropdownLink>
                            <DropdownLink
                                href="/department"
                                active={router.pathname.includes('department').toString()}
                            >
                                Department
                            </DropdownLink>
                            <DropdownLink
                                href="/designation"
                                active={router.pathname.includes('designation').toString()}
                            >
                                Designation
                            </DropdownLink>
                            <DropdownLink
                                href="/employees"
                                active={router.pathname.includes('employees').toString()}
                            >
                                Employees
                            </DropdownLink>
                        </Dropdown>
                        <Dropdown
                            align="right"
                            width="48"
                            trigger={
                                <button className="pl-3 pr-4 py-2 border-l-4 text-base font-medium leading-5 focus:outline-none transition duration-150 ease-in-out border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 flex flex-row">
                                    <div>Products</div>
                                    <div className="ml-1">
                                        <BiChevronDown  className="fill-current h-4 w-4" />
                                    </div>
                                </button>
                            }>
                            <DropdownLink
                                href="/product"
                                active={router.pathname.includes('product').toString()}
                            >
                                Product
                            </DropdownLink>
                            <DropdownLink
                                href="/category"
                                active={router.pathname.includes('category').toString()}
                            >
                                Category
                            </DropdownLink>
                            <DropdownLink
                                href="/options"
                                active={router.pathname.includes('options').toString()}
                            >
                                Options
                            </DropdownLink>
                        </Dropdown>
                        <Dropdown
                          align="left"
                          width="48"
                          contentClasses={`px-1 py-0 bg-gray-200`}
                          trigger={
                              <button  className="pl-3 pr-4 py-2 border-l-4 text-base font-medium leading-5 focus:outline-none transition duration-150 ease-in-out border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 flex flex-row">
                                  <div>Purchase</div>
                                  <div className="ml-1">
                                      <BiChevronDown />
                                  </div>
                              </button>
                          }
                        >
                            <DropdownLink
                              href="/purchase"
                              active={router.pathname.includes('purchase').toString()}
                            >
                                Purchase
                            </DropdownLink>
                            <DropdownLink
                                href="/issue"
                                active={router.pathname.includes('issue').toString()}
                            >
                                Issue
                            </DropdownLink>
                            <DropdownLink
                                href="/brands"
                                active={router.pathname.includes('brands').toString()}
                            >
                                Brands
                            </DropdownLink>
                        </Dropdown>
                        <Dropdown
                          align="right"
                          width="48"
                          trigger={
                              <button className="pl-3 pr-4 py-2 border-l-4 text-base font-medium leading-5 focus:outline-none transition duration-150 ease-in-out border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 flex flex-row">
                                  <div>Requisition</div>
                                  <div className="ml-1">
                                      <BiChevronDown  className="fill-current h-4 w-4" />
                                  </div>
                              </button>
                          }>
                            <DropdownLink
                              href="/initial-requisition"
                              active={router.pathname.includes('initial-requisition').toString()}
                            >
                                Initial
                            </DropdownLink>
                            <DropdownLink
                                href="/purchase-requisition"
                                active={router.pathname.includes('purchase-requisition').toString()}
                            >
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
                                <BiChevronDown  className="fill-current h-4 w-4" />
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
        </nav>
    )
}

export default Navigation
