import Axios from 'axios'

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
    },
    withCredentials: true,
})

axios.interceptors.request.use(function (config) {
    let cookieArray = document.cookie.split(";");

    // this can probably be improved by using a regex. but this works for now
    for(var i = 0; i < cookieArray.length; i++) {
        let cookiePair = cookieArray[i].split("=");

        if(cookiePair[0].trim() === 'XSRF-TOKEN-PORTAL') {
            axios.defaults.headers.common['X-XSRF-TOKEN-PORTAL'] = decodeURIComponent(cookiePair[1]);
        }
    }
    return config;
}, function (error) {
    return Promise.reject(error);
})
export default axios
