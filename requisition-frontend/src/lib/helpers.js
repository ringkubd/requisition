import React from "react";
import Router from 'next/router'
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

function isClassComponent(component) {
    return (
        typeof component === 'function' &&
        !!component.prototype.isReactComponent
    )
}

function isFunctionComponent(component) {
    return (
        typeof component === 'function' &&
        String(component).includes('return React.createElement')
    )
}

function isReactComponent(component) {
    return (
        isClassComponent(component) ||
        isFunctionComponent(component)
    )
}

function isElement(element) {
    return React.isValidElement(element);
}

function isDOMTypeElement(element) {
    return isElement(element) && typeof element.type === 'string';
}

function isCompositeTypeElement(element) {
    return isElement(element) && typeof element.type === 'function';
}

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
    toBase64,
    isClassComponent,
    isCompositeTypeElement,
    isDOMTypeElement,
    isElement,
    isFunctionComponent,
    isReactComponent,
    onQueryStartedErrorToast
}
