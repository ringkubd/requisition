import { useAuth } from "@/hooks/auth";
import { Dropdown } from 'flowbite-react';
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
const Status = ({ requisition, type }) => {
    const { user } = useAuth()
    const [url, setUrl] = useState(`api/update_initial_status/${requisition.id}`);
    const [selectedDropdown, setSelectedDropdown] = useState('Status')
    const isDepartmentHead = user.current_department_head === parseInt(user.id);

    useEffect(() => {
        switch (type){
            case 'initial':
                setUrl(`api/update_initial_status/${requisition.id}`);
                break;
            case 'purchase':
                requisition = requisition.purchase_requisitions
                setUrl(`api/update_purchase_status/${requisition.id}`);
                break;
            case 'cash':
                setUrl(`api/update_cash_status/${requisition.id}`);
                break;
        }
        setSelectedDropdown(requisition?.current_status?.status ?? 'Status')
    }, [])

    const updateStatus = async ({status, notes} = {}) => {
        if (status)
            await axios.put(url, {
                'notes': notes,
                'status': status,
                'stage': requisition?.current_status?.stage
            })
    }
    console.log( (requisition?.current_status?.stage ===  "accounts" && requisition?.current_status?.status !== "Approved" && isDepartmentHead && type !== "initial" && user.default_department_name === "Accounts"))
    return (
        <div>
            {
                (requisition?.current_status?.stage ===  "ceo" && requisition?.current_status?.status !== "Approved" && user.designation_name === "CEO") ||
                (requisition?.current_status?.stage ===  "department" && requisition?.current_status?.status !== "Approved" && isDepartmentHead && (parseInt(requisition.department_id) === user.current_department_head)) ||
                (requisition?.current_status?.stage ===  "accounts" && requisition?.current_status?.status !== "Approved" && isDepartmentHead && type !== "initial" && user.default_department_name === "Accounts") ||
                (parseInt(requisition.department_id) === parseInt(user.selected_department) && isDepartmentHead && (requisition?.current_status?.stage ===  "department" || !requisition?.current_status?.stage))
                    ? (
                    <Dropdown
                        label={selectedDropdown}
                        dismissOnClick={true}
                    >
                        <Dropdown.Item
                            onClick={() => {
                                setSelectedDropdown('Approved');
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
                                setSelectedDropdown('Rejected');
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
                    : requisition?.current_status?.stage ? requisition?.current_status?.stage?.toUpperCase() + " " +  requisition?.current_status?.status : null
            }
        </div>
    )
}
export default Status;
