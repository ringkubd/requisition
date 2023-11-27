"use client"

import Router from "next/router";
import { setError } from "@/store/slice/errorSlice";

const onQueryStartedErrorToast = async (args, {  dispatch,
    getState,
    extra,
    requestId,
    queryFulfilled,
    getCacheEntry,
    updateCachedData }) => {
    try {
        await queryFulfilled;
    } catch (error) {
        const {error: baseError} = error;
        if (baseError){
            dispatch(setError({status: baseError.status, message: baseError.data.message}));
            console.log(baseError.status, Math.random())
            switch (baseError.status) {
                case 403:
                    typeof window !== 'undefined' && Router.push('/403');
                    break;
                case 500:
                    typeof window !== 'undefined' && Router.push('/500');
                    break;
                default:
                    typeof window !== 'undefined' && Router.push('/404');
            }
        }
    }
};


export {
    onQueryStartedErrorToast
}
