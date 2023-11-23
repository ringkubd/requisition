import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import $ from 'jquery'; // Import jQuery
import 'select2/dist/js/select2';
import 'select2/dist/css/select2.css';
import axios from "@/lib/axios";

const Select2ComponentAjax = forwardRef(({ajax, onChange,...other}, ref) => {
    const selectRef = useRef(null);
    useEffect(() => {
        // Initialize Select2 on component mount
        $(selectRef.current).select2({
            allowClear: true,
            async: true,
            ajax: {...ajax, transport: function (params, success, failure) {
                    let paramType = 'params';
                    if (params.type.toUpperCase() !== 'GET'){
                        paramType = 'body';
                    }
                    params[paramType] = params['data'];
                    var $request = axios(params);

                    $request.then((data) => {
                        success(data.data)
                    });
                    $request.catch((error) => failure(error));
                    return $request;
                }}
        });

        // Clean up Select2 on component unmount
        return () => {
            $(selectRef.current).select2('destroy');
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
        $(selectRef.current).val("").trigger('change')
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
