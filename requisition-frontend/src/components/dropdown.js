import React, { useState } from 'react'
import { Menu, Transition } from '@headlessui/react'

const Dropdown = ({
    align = 'right',
    width = 48,
    contentClasses = 'py-1 bg-gray-200',
    trigger,
    children,
}) => {
    let alignmentClasses

    switch (width) {
        case '48':
            width = 'w-48'
            break
    }

    switch (align) {
        case 'left':
            alignmentClasses = 'origin-top-left left-0'
            break
        case 'top':
            alignmentClasses = 'origin-top'
            break
        case 'right':
        default:
            alignmentClasses = 'origin-top-right sm:right-0 left-48 sm:left-0 overflow-hidden z-[99999999]'
            break
    }

    const [open, setOpen] = useState(false)

    return (
        <Menu as="div" className="relative z-50">
            {({ open }) => (
                <>
                    <Menu.Button as={React.Fragment}>{trigger}</Menu.Button>

                    <Transition
                        show={open}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95">
                        <div
                            className={`absolute mt-2 ${width} rounded-md shadow-lg z-[-1] overflow-hidden ${alignmentClasses}`}>
                            <Menu.Items
                                className={`rounded-md focus:outline-none ring-1 ring-black ring-opacity-5 z-auto overflow-hidden ${contentClasses}`}
                                static>
                                {children}
                            </Menu.Items>
                        </div>
                    </Transition>
                </>
            )}
        </Menu>
    )
}

export default Dropdown
