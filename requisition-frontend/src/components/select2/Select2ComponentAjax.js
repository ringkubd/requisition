import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import $ from 'jquery'; // Import jQuery
import 'select2/dist/js/select2';
import 'select2/dist/css/select2.css';

const Select2ComponentAjax = forwardRef(({ajax, onChange,...other}, ref) => {
    const selectRef = useRef(null);
    useEffect(() => {
        // Initialize Select2 on component mount
        $(selectRef.current).select2({
            allowClear: true,
            async: true,
            ajax: ajax
        });

        // Clean up Select2 on component unmount
        return () => {
            $(selectRef.current).select2('destroy');
        };
    }, []);

    useEffect(() => {
        $(selectRef.current).on('change', function(e) {
            onChange(e);
        })
        $(selectRef.current).on('blur', function(e) {
            onChange(e);
        })
        $(selectRef.current).val("").trigger('change')
    }, []);

    function resetSelect(){
        $(selectRef.current).val("").trigger('change')
        $(selectRef.current).val("").trigger('click')
    }
    useImperativeHandle(ref, () => ({
        resetSelect,
    }));
    return (
        <div className="w-full">
            <select
                ref={selectRef}
                {...other}
            >
                <option value=""></option>
            </select>
        </div>
    );
});

export default Select2ComponentAjax;
Select2ComponentAjax.defaultProps = {
}
