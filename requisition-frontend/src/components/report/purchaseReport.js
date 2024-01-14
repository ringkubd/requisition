import { forwardRef } from "react";

const PurchaseReport = forwardRef(({data}, ref) => {
    return (
        <div
            className={`flex flex-col w-[21cm] m-2 justify-center justify-items-center p-4 shadow-none`}
            ref={ref}>
            Purchase
        </div>
    )
});

export default PurchaseReport;
