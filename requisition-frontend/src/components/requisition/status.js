import { useAuth } from "@/hooks/auth";
import { Button, Tooltip } from "flowbite-react";
import { useEffect, useState } from "react";
import { AiFillCheckSquare, AiFillDelete } from "react-icons/ai";
import {
    DashboardAPI,
    useUpdateCashStatusMutation,
    useUpdateInitialStatusMutation,
    useUpdatePurchaseStatusMutation
} from "@/store/service/dashboard";
import { dispatch } from "@/store";
import { PurchaseRequisitionApi } from "@/store/service/requisitions/purchase";
const Status = ({ requisition, type, from='dashboard' }) => {
    const { user } = useAuth()
    const [selectedDropdown, setSelectedDropdown] = useState('Status')
    const isDepartmentHead = user?.current_department_head === parseInt(user?.id);
    const [currentStatus, setCurrentStatus] = useState(requisition.current_status);
    const [manualPermission, setManualPermission] = useState(false);
    const [updateInitial, {data: initialResponse, isSuccess: isSuccessInitialUpdate}] = useUpdateInitialStatusMutation();
    const [updatePurchase, {data: purchaseResponse, isSuccess: isSuccessPurchaseUpdate}] = useUpdatePurchaseStatusMutation();
    const [updateCash, {data: cashResponse, isSuccess: isSuccessCashUpdate}] = useUpdateCashStatusMutation();
    const [rowID, setRowID] = useState(requisition.id);

    useEffect(() => {
        switch (type){
            case 'purchase':
                if (from === "print_view"){
                    setManualPermission(user?.purchase_approval_permission);
                }else {
                    setCurrentStatus(requisition.purchase_current_status)
                    requisition = requisition.purchase_requisitions
                    setManualPermission(user?.purchase_approval_permission);
                    setRowID(requisition.id)
                }
                break;
            case 'cash':
                setManualPermission(user?.cash_approval_permission);
                break;
        }
        setSelectedDropdown(currentStatus?.status ?? 'Status')
    }, [])

    useEffect(() => {
        if (isSuccessPurchaseUpdate){
            dispatch(PurchaseRequisitionApi.util.invalidateTags(['edit-purchase-requisition']));
            dispatch(DashboardAPI.util.invalidateTags(['general_requisition', 'cash_requisition']));
        }
        if (isSuccessCashUpdate || isSuccessInitialUpdate){
            dispatch(DashboardAPI.util.invalidateTags(['general_requisition', 'cash_requisition']));
            console.log(cashResponse?.data?.current_status)
            setCurrentStatus(cashResponse?.data?.current_status)

        }
    }, [isSuccessInitialUpdate, isSuccessCashUpdate, isSuccessPurchaseUpdate]);


    const updateStatus = async ({status, notes} = {}) => {
        const confirmation = confirm("Are you sure?");
        if (status && confirmation) {
            const statusText = status === 2 ? 'Approved' : 'Rejected';
            setSelectedDropdown(statusText);
            switch (type) {
                case 'initial':
                    updateInitial({
                        id: requisition.id,
                        'notes': notes,
                        'status': status,
                        'stage': currentStatus?.stage
                    })
                    break;
                case 'purchase':
                    updatePurchase({
                        id: rowID,
                        'notes': notes,
                        'status': status,
                        'stage': currentStatus?.stage
                    })
                    break;
                case 'cash':
                    updateCash({
                        id: requisition.id,
                        'notes': notes,
                        'status': status,
                        'stage': currentStatus?.stage
                    })
                    break;
            }
        }
    }
    return (
        <div>
            {
                (currentStatus?.stage ===  "ceo" && currentStatus?.status !== "Approved" && user?.designation_name === "CEO" && type !== "initial") ||
                (currentStatus?.stage ===  "department" && currentStatus?.status !== "Approved" && isDepartmentHead && (parseInt(requisition.department_id) === user?.current_department_head)) ||
                (currentStatus?.stage ===  "accounts" && currentStatus?.status !== "Approved" && (isDepartmentHead || manualPermission) && user?.default_department_name === "Accounts"  && type !== "initial") ||
                (parseInt(requisition.department_id) === parseInt(user?.default_department_id) && isDepartmentHead && (currentStatus?.stage ===  "department" || !currentStatus?.stage))
                    ? (
                        <div className="flex flex-wrap">
                            <Tooltip content={`Approved`} placement={`left-start`}>
                                <Button
                                    gradientDuoTone="greenToBlue"
                                    onClick={() => {
                                        updateStatus({
                                            status: 2,
                                            notes: ''
                                        });
                                    }}
                                >
                                    <AiFillCheckSquare />
                                </Button>
                            </Tooltip>
                            <Tooltip content={`Reject`} placement={`top`}>
                                <Button
                                    gradientDuoTone="redToYellow"
                                    onClick={() => {
                                        updateStatus({
                                            status: 3,
                                            notes: ''
                                        });
                                    }}
                                >
                                    <AiFillDelete />
                                </Button>
                            </Tooltip>

                        </div>
                    )
                    : (currentStatus?.stage ? (currentStatus?.status === "Pending" ? 'Pending at ' : currentStatus?.status + ' by ') +  currentStatus?.stage : "").replace('ceo', 'CEO')
            }
        </div>
    )
}
export default Status;
