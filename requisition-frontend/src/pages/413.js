import { useSelector } from 'react-redux'
import { Button } from 'flowbite-react'
import { useRouter } from 'next/router'

const Exception413 = props => {
    const { errors } = useSelector(state => state.errors)
    const router = useRouter()
    return (
        <div className="relative flex items-top justify-center min-h-screen bg-gray-100 dark:bg-gray-900 sm:items-center sm:pt-0">
            <div className="max-w-xl mx-auto sm:px-6 lg:px-8">
                <div className="flex items-center pt-8 sm:justify-start sm:pt-0">
                    <div className="px-4 text-lg text-gray-500 border-r border-gray-400 tracking-wider">
                        {errors.status}
                    </div>

                    <div className="ml-4 text-lg text-gray-500 uppercase tracking-wider flex flex-col justify-center">
                        {errors.message}
                        <Button onClick={() => router.back()}>Back</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Exception413
