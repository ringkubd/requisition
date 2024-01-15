import { forwardRef } from "react";
import './Print.module.css';

const PurchaseReport = forwardRef(({data}, ref) => {
    console.log(data)
    return (
        <div
            className={`flex flex-col w-[21cm] m-2 justify-center justify-items-center p-4 shadow-none`}
            ref={ref}>
            Purchase
        </div>
    )
});

export default PurchaseReport;
