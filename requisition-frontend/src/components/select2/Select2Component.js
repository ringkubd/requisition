import React, { useEffect, useRef } from 'react';
import $ from 'jquery'; // Import jQuery
import 'select2/dist/js/select2';
import 'select2/dist/css/select2.css';

const Select2Component = ({options, onChange, ...other}) => {
    const selectRef = useRef(null);
    useEffect(() => {
        // Initialize Select2 on component mount
        $(selectRef.current).select2();

        // Clean up Select2 on component unmount
        return () => {
            // $(selectRef.current).select2('destroy');
        };
    }, []);

    useEffect(() => {
        $(selectRef.current).on('change', function(e) {
            const data = $(this).select2('data')
            if (other.multiple){
                onChange(e, data);
            }else{
                onChange(e, data[0]);
            }
        })
        $(selectRef.current).on('blur', function(e) {
            const data = $(this).select2('data')
            if (other.multiple){
                onChange(e, data);
            }else{
                onChange(e, data[0]);
            }
        })
    }, []);

    return (
        <div className="w-full">
            <select
                ref={selectRef}
                onChange={onChange}
                {...other}
            >
                <option value=""></option>
                {
                    options?.map((o, index) => <option key={index} value={o.value}>{o.label}</option>)
                }
                {/* Add more options as needed */}
            </select>
        </div>
    );
};

export default Select2Component;
