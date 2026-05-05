import { Alert } from 'flowbite-react'

export default function DefaultAlert() {
    return (
        <Alert color="info">
            <span className="text-slate-700 dark:text-slate-200">
                <p>
                    <span className="font-medium">Heads up:</span> Please review the highlighted fields and try again.
                </p>
            </span>
        </Alert>
    )
}
