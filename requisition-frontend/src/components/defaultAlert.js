import { Alert } from 'flowbite-react'

export default function DefaultAlert() {
    return (
        <Alert color="info">
            <span>
                <p>
                    <span className="font-medium">Info alert!</span>
                    Change a few things up and try submitting again.
                </p>
            </span>
        </Alert>
    )
}
