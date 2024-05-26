import { getCookie } from '@/lib/cookie'

function headers(header) {
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + 'sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
    })
    const token = decodeURIComponent(getCookie('XSRF-TOKEN')) // <---- CHANGED
    headers.set('Accept', `application/json`)
    headers.set('X-XSRF-TOKEN', token)
    return headers
}
export { headers }
