import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import $ from 'jquery'; // Import jQuery
import 'select2/dist/js/select2';
import 'select2/dist/css/select2.css';

const Select2Component = forwardRef(({options, onChange, ...other}, ref) => {
  const selectRef = useRef(null);
  useEffect(() => {
    // Initialize Select2 on component mount
    $(selectRef.current).select2();
    // Clean up Select2 on component unmount
    return () => {
      $(selectRef.current).select2('destroy');
    };
  }, []);

  useEffect(() => {
    $(selectRef.current).on('change', function(e) {
      const optionSelected = $("option:selected", this).data();
      const {data} = $(this).data()
      onChange(e, data, optionSelected);

    })
    $(selectRef.current).on('blur', function(e) {
      const {data} = $(this).data()
      const optionSelected = $("option:selected", this).data();
      onChange(e, data, optionSelected);
    })
  }, []);

  function resetSelect(){
    $(selectRef.current).val("").trigger('change')
    $(selectRef.current).val("").trigger('click')
  }
  useImperativeHandle(ref, () => ({
    resetSelect
  }));

  return (
    <div className="w-full">
      <select
        ref={selectRef}
        onChange={onChange}
        {...other}
      >
        <option value=""></option>
        {
          options?.map((o, index) => <option data-other={JSON.stringify(o.other)} key={index} value={o.value}>{o.label}</option>)
        }
        {/* Add more options as needed */}
      </select>
    </div>
  );
});

Select2Component.defaultProps= {
  onChange: (e) => {},
}
export default Select2Component;
