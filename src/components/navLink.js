import Link from 'next/link'

const NavLink = ({ active = false, children, ...props }) => (
    <Link
        {...props}
        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 focus:outline-none transition duration-150 ease-in-out ${
            active
                ? 'border-blue-500 text-slate-900 dark:text-slate-100 focus:border-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 focus:text-slate-800 dark:focus:text-slate-100 focus:border-slate-300 dark:focus:border-slate-600'
        }`}>
        {children}
    </Link>
)

export default NavLink
