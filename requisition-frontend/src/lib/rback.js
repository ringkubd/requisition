import { useRouter } from 'next/router'

function hasRequiredPermissions(requiredPermissions) {
    // get userPermissions from the redux-store
    const userPermissions = ['users', 'groups', 'home']
    return requiredPermissions.some((permission) =>
        userPermissions.includes(permission)
    )
}

export function withRoles(Component, requiredPermissions) {
    return function WithRolesWrapper(props) {
        const router = useRouter()
        const hasPermission = hasRequiredPermissions(requiredPermissions)
        if (hasPermission) {
            return <Component {...props} />
        } else {
            router.push('/dashboard')
            return null
        }
    }
}
