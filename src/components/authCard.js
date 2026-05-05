const AuthCard = ({ logo, children }) => (
    <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-b from-slate-100 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div>{logo}</div>

        <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden sm:rounded-xl">
            {children}
        </div>
    </div>
)

export default AuthCard
