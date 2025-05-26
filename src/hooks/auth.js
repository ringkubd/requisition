import useSWR from 'swr'
import axios from '@/lib/axios'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { setUser } from '@/store/service/user'
import { store, dispatch } from '@/store'

export const useAuth = ( { middleware, redirectIfAuthenticated } = {} ) =>
{
    const router = useRouter()

    const { data: user, error, mutate } = useSWR( '/api/user', () =>
        axios
            .get( '/api/user' )
            .then( res => res.data?.data )
            .catch( error =>
            {
                if ( error.response.status !== 409 ) throw error

                router.push( '/verify-email' )
            } ),
    )

    const csrf = () => axios.get( '/sanctum/csrf-cookie' )

    // Only update Redux store when we have a valid user object
    useEffect(() => {
        // Only update Redux store when we have a valid user object
        // Use useEffect to avoid potential issues with timing
        if (user && typeof user === 'object') {
            // Ensure we're dispatching a valid object to the Redux store
            dispatch(setUser(user))
        }
    }, [user])

    const register = async ( { setErrors, ...props } ) =>
    {
        await csrf()

        setErrors( [] )

        axios
            .post( '/api/register', props )
            .then( () => mutate() )
            .catch( error =>
            {
                if ( error.response.status !== 422 ) throw error

                setErrors( error.response.data.errors )
            } )
    }

    const login = async ( { setErrors, setStatus, ...props } ) =>
    {
        await csrf()

        setErrors( [] )
        setStatus( null )

        axios
            .post( '/api/login', props )
            .then( () => mutate() )
            .catch( error =>
            {
                // if (error.response.status !== 422) throw error
                setErrors( error?.response?.data?.errors )
            } )
    }

    const forgotPassword = async ( { setErrors, setStatus, email } ) =>
    {
        await csrf()

        setErrors( [] )
        setStatus( null )

        axios
            .post( '/api/forgot-password', { email } )
            .then( response => setStatus( response.data.status ) )
            .catch( error =>
            {
                if ( error.response.status !== 422 ) throw error

                setErrors( error.response.data.errors )
            } )
    }

    const resetPassword = async ( { setErrors, setStatus, ...props } ) =>
    {
        await csrf()

        setErrors( [] )
        setStatus( null )

        axios
            .post( '/api/reset-password', {
                token: router.query.token,
                ...props,
            } )
            .then( response =>
                router.push( '/login?reset=' + btoa( response.data.status ) ),
            )
            .catch( error =>
            {
                if ( error.response.status !== 422 ) throw error

                setErrors( error.response.data.errors )
            } )
    }

    const resendEmailVerification = ( { setStatus } ) =>
    {
        axios
            .post( '/api/email/verification-notification' )
            .then( response => setStatus( response.data.status ) )
    }

    const logout = async () =>
    {
        if ( !error )
        {
            await axios.post( '/logout' ).then( () => mutate() )
        }

        window.location.pathname = '/login'
    }

    useEffect( () =>
    {
        try {
            if ( middleware === 'guest' && redirectIfAuthenticated && user && typeof user === 'object' )
            {
                // Only dispatch if user is a valid object
                store.dispatch( setUser( user ) )
                router.push( redirectIfAuthenticated )
            }

            if (
                window.location.pathname === '/api/verify-email' &&
                user && typeof user === 'object' && user?.email_verified_at
            )
            {
                // Only dispatch if user is a valid object
                store.dispatch( setUser( user ) )
                router.push( redirectIfAuthenticated )
            }

            if ( middleware === 'auth' && error ) logout()
        } catch (error) {
            console.error("Error in auth middleware:", error);
            // If we're in auth middleware and encounter an error, safest to logout
            if (middleware === 'auth') logout()
        }
    }, [ user, error ] )

    return {
        user,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
    }
}

export const csrf = () => axios.get( '/sanctum/csrf-cookie' )
