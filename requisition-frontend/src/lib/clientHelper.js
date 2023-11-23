"use client"

import Router from "next/router";

const onQueryStartedErrorToast = async (args, { queryFulfilled }) => {
    try {
        await queryFulfilled;
    } catch (error) {
        // handle error here, dispatch toast message
        const {error: baseError} = error;
        if (baseError){
            switch (baseError.status) {
                case 403:
                    typeof window !== 'undefined' && Router.push('/403');
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
