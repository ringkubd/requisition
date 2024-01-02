import { useAuth } from "@/hooks/auth";
import { Button, Dropdown, Tooltip } from "flowbite-react";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { AiFillCheckSquare, AiFillDelete } from "react-icons/ai";
const Status = ({ requisition, type }) => {
    const { user } = useAuth()
    const [url, setUrl] = useState(`api/update_initial_status/${requisition.id}`);
    const [selectedDropdown, setSelectedDropdown] = useState('Status')
    const isDepartmentHead = user?.current_department_head === parseInt(user?.id);
    const [currentStatus, setCurrentStatus] = useState(requisition.current_status);
    const [manualPermission, setManualPermission] = useState(false);


    useEffect(() => {
        switch (type){
            case 'initial':
                setUrl(`api/update_initial_status/${requisition.id}`);
                break;
            case 'purchase':
                setCurrentStatus(requisition.purchase_current_status)
                requisition = requisition.purchase_requisitions
                setUrl(`api/update_purchase_status/${requisition.id}`);
                setManualPermission(user?.purchase_approval_permission);
                break;
            case 'cash':
                setUrl(`api/update_cash_status/${requisition.id}`);
                setManualPermission(user?.cash_approval_permission);
                break;
        }
        setSelectedDropdown(currentStatus?.status ?? 'Status')
    }, [])

    const updateStatus = async ({status, notes} = {}) => {
        const confirmation = confirm("Are you sure?");
        if (status && confirmation) {
            const statusText = status === 2 ? 'Approved' : 'Rejected';
            setSelectedDropdown(statusText);
            await axios.put(url, {
                'notes': notes,
                'status': status,
                'stage': currentStatus?.stage
            })
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
                            <Tooltip content={`Reject`} placement={`right-start`}>
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
                    : currentStatus?.stage ? (currentStatus?.status === "Pending" ? 'Pending at ' : currentStatus?.status + ' by ') +  currentStatus?.stage : null
            }
        </div>
    )
}
export default Status;
