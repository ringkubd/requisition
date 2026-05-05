const Label = ({ className, children, ...props }) => (
    <label
        className={`${className} block font-medium text-sm text-slate-700 dark:text-slate-200`}
        {...props}>
        {children}
    </label>
)

export default Label
