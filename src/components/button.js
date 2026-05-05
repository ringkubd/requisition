const Button = ({ type = 'submit', className, ...props }) => (
    <button
        type={type}
        className={`${className} inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs tracking-widest uppercase text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-600/60 shadow-sm hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400/60 dark:focus:ring-blue-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition ease-in-out duration-150`}
        {...props}
    />
)

export default Button
