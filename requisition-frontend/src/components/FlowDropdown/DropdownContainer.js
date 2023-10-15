import { BiChevronDown } from "react-icons/bi";

const DropdownContainer = ({buttonName}) => {
    const randomButtonId = Math.floor(Math.random(1111111)) + "button";
    const randomButtonName = Math.floor(Math.random(1111111)) + "name";
    return (
        <>
            <button
                id="dropdownNavbarLink" data-dropdown-toggle="dropdownNavbar" className="flex items-center justify-between w-full py-2 pl-3 pr-4  text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-gray-400 dark:hover:text-white dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">Dropdown
                <BiChevronDown  className="w-2.5 h-2.5 ml-2.5" />
            </button>
        </>
    )
}

export default DropdownContainer;
