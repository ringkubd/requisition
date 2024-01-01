import { useAuth } from "@/hooks/auth";
import { Dropdown } from 'flowbite-react';
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
const Status = ({ requisition, type }) => {
    const { user } = useAuth()
    const [url, setUrl] = useState(`api/update_initial_status/${requisition.id}`);
    const [selectedDropdown, setSelectedDropdown] = useState('Status')
    const isDepartmentHead = user?.current_department_head === parseInt(user?.id);
    const [currentStatus, setCurrentStatus] = useState(requisition.current_status);


    useEffect(() => {
        switch (type){
            case 'initial':
                setUrl(`api/update_initial_status/${requisition.id}`);
                break;
            case 'purchase':
                setCurrentStatus(requisition.purchase_current_status)
                requisition = requisition.purchase_requisitions
                setUrl(`api/update_purchase_status/${requisition.id}`);
                break;
            case 'cash':
                setUrl(`api/update_cash_status/${requisition.id}`);
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
                (currentStatus?.stage ===  "accounts" && currentStatus?.status !== "Approved" && isDepartmentHead && user?.default_department_name === "Accounts"  && type !== "initial") ||
                (parseInt(requisition.department_id) === parseInt(user?.default_department_id) && isDepartmentHead && (currentStatus?.stage ===  "department" || !currentStatus?.stage))
                    ? (
                    <Dropdown
                        label={selectedDropdown}
                        dismissOnClick={true}
                    >
                        <Dropdown.Item
                            onClick={() => {
                                updateStatus({
                                    status: 2,
                                    notes: ''
                                });
                            }}
                        >
                            Approved
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                updateStatus({
                                    status: 3,
                                    notes: ''
                                });
                            }}
                        >
                            Reject
                        </Dropdown.Item>
                    </Dropdown>
                )
                    : currentStatus?.stage ? (currentStatus?.status === "Pending" ? 'Pending at ' : currentStatus?.status + ' by ') +  currentStatus?.stage : null
            }
        </div>
    )
}
export default Status;
