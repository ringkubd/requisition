const Input = ({ disabled = false, className, ...props }) => (
    <input
        disabled={disabled}
        className={`${className} rounded-lg border border-slate-300 bg-white text-slate-800 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200/60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/40 transition`}
        {...props}
    />
)

export default Input
