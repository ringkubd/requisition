import { forwardRef } from "react";

const IssueReport = forwardRef(({data}, ref) => {
    return (
        <div
            className={`flex flex-col w-[21cm] m-2 justify-center justify-items-center p-4 shadow-none`}
            ref={ref}>
            Issue
        </div>
    )
});

export default IssueReport;
