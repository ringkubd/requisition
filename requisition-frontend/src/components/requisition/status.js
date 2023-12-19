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


    return (
        <div>
            {
                (requisition?.current_status?.stage ===  "ceo" && requisition?.current_status?.status !== "Approved") ||
                (requisition?.current_status?.stage ===  "department" && requisition?.current_status?.status !== "Approved" && isDepartmentHead && (parseInt(requisition.department_id) === user.current_department_head)) ||
                (requisition?.current_status?.stage ===  "accounts" && requisition?.current_status?.status !== "Approved" && isDepartmentHead) ||
                (parseInt(requisition.department_id) === parseInt(user.selected_department) && isDepartmentHead)
                    ? (
                    <Dropdown
                        label={selectedDropdown}
                        dismissOnClick={true}
                        onSelect={(s) => console.log(s)}
                        onClick={(a) => console.log(a)}
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
                        <Dropdown.Item
                            onClick={() => {
                                setSelectedDropdown('Need Change');
                                updateStatus({
                                    status: 4,
                                    notes: ''
                                });
                            }}
                        >
                            Need Change
                        </Dropdown.Item>
                    </Dropdown>
                )
                    : requisition?.current_status?.stage ? requisition?.current_status?.stage?.toUpperCase() + " " +  requisition?.current_status?.status : null
            }
        </div>
    )
}
export default Status;
