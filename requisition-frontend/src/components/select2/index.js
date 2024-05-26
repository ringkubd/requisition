import React, { useEffect, useRef, useState } from 'react'

const Select2 = ({
    options = [],
    className,
    inputCss,
    value = '',
    key = Math.floor(Math.random()),
    ...other
}) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef()
    const selectRef = useRef()
    const [useSelectRefState, setSelectRefState] = useState(value)
    const ulId = Math.floor(Math.random())

    const searchInputRef = useRef()
    const ulElementRef = useRef()
    const [selectedText, setSelectedText] = useState('Select an option')
    const [filterOptions, setFilterOptions] = useState([])
    const [selectedValue, setSelectedValue] = useState(value)
    const [currentScrollPage, setCurrentScrollPage] = useState(1)

    useEffect(() => {
        const app = document.body
        ulElementRef.current.addEventListener('scroll', a => {
            const current = ulElementRef.current
            if (
                current.offsetHeight + current.scrollTop >
                current.scrollHeight
            ) {
                const value = searchInputRef.current.value
                const regexp = new RegExp(`^${value}`, 'i')
                const currentScroll = currentScrollPage
                let newfilterOptions = options
                    .filter(e => regexp.test(e.text))
                    .slice(0, currentScroll * 50)
                if (newfilterOptions.length > 0) {
                    setCurrentScrollPage(currentScroll + 1)
                    setFilterOptions([...filterOptions, ...newfilterOptions])
                    selectRef.current.value = value
                    selectRef.current.addEventListener('change', event => {
                        other.onChange(event)
                        console.log(event)
                    })
                }
            }
        })
        return clickEvent(app)
    }, [])

    function clickEvent(app) {
        app.addEventListener('click', self => {
            if (!self.target.closest('#select_container')) {
                setOpen(false)
            } else {
                setFilterOptions(options.slice(0, 50))
                if (self.srcElement.nodeName === 'LI') {
                    const value = self.target.getAttribute('value')
                    if (value) {
                        const text = self?.target?.innerText
                        setSelectedText(text ? text : '')
                        // selectRef.current.value = value;
                        setSelectRefState(value)
                        setSelectedValue(value)
                        // showSelect.current.value = text;
                        setOpen(false)
                        searchInputRef.current.value = ''
                    }
                }
            }
        })
    }

    function capitalizeFirstLetter(string) {
        if (string instanceof String) {
            return string.charAt(0).toUpperCase() + string?.slice(1)
        }
        return string
    }

    function handleSearch(e) {
        const value = e.target.value
        const regexp = new RegExp(`^${value}`, 'i')
        let filterOptions = options
            .filter(e => regexp.test(e.text))
            .slice(0, 50)
        setFilterOptions(filterOptions)
    }

    return (
        <div
            className={`flex flex-col rounded z-50`}
            ref={containerRef}
            id={`select_container`}
            key={key}>
            <div className={`mb-4`} onClick={() => setOpen(true)}>
                <div
                    className={`w-full border-2 border-gray-300 h-10 rounded-md p-2 ${inputCss} ${
                        open ? 'border-green-500' : ''
                    }`}>
                    {selectedText}
                </div>
                <ul
                    id={ulId}
                    className={`p-2 border-2 rounded ${
                        open ? 'border-green-500 bg-green-50' : 'hidden'
                    } max-h-64 overflow-scroll`}
                    ref={ulElementRef}>
                    <li
                        className={`bg-gray-300 space-y-2 p-2 my-1 rounded shadow-2xl relative`}>
                        <input
                            type="text"
                            className={`w-full rounded-md static`}
                            placeholder={`Search`}
                            onChange={handleSearch}
                            ref={searchInputRef}
                        />
                    </li>
                    {/*<li className={`bg-gray-300 space-y-2 p-2 my-1 rounded hover:cursor-not-allowed shadow-2xl`}>Select an option</li>*/}
                    {filterOptions.length ? (
                        filterOptions.map((o, index) => (
                            <li
                                key={index}
                                className={`p-2 space-y-2 my-1 bg-gray-50 rounded hover:bg-green-400 hover:cursor-pointer shadow-2xl ${
                                    selectedValue === o.value
                                        ? 'bg-green-400'
                                        : ''
                                }`}
                                value={o.value}>
                                {capitalizeFirstLetter(o.text)}
                            </li>
                        ))
                    ) : (
                        <li
                            className={`bg-gray-300 space-y-2 p-2 my-1 rounded hover:cursor-not-allowed shadow-2xl}`}>
                            No option found
                        </li>
                    )}
                </ul>
            </div>
            <select
                className={`form-select hidden`}
                ref={selectRef}
                value={useSelectRefState}
                onChange={e => console.log(e)}
                {...other}>
                <option value="">Select a option</option>
                {filterOptions.map((o, index) => (
                    <option key={index} value={o.value}>
                        {o.text}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default Select2
