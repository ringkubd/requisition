import React from "react";
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

export {
    toBase64,
    isClassComponent,
    isCompositeTypeElement,
    isDOMTypeElement,
    isElement,
    isFunctionComponent,
    isReactComponent
}
