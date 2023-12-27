import React, { useEffect, useState } from "react";
import { Dropdown } from "flowbite-react";
import { useAuth } from "@/hooks/auth";
import { useUpdateIssueMutation } from "@/store/service/issue";

const IssueStatus = ({row}) => {
    const { user } = useAuth()
    const [selectedDropdown, setSelectedDropdown] = useState('Status');
    const isDepartmentHead = user?.current_department_head === parseInt(user?.id);
    const [isReceiverDepartment, setISReceiverDepartment] = useState(parseInt(row?.receiver_department_id) === parseInt(user?.selected_department));
    const [isStoreManager, setISStoreManager] = useState(user?.role_object?.filter(r => r.name === "Store Manager").length);
    const [updateIssue, {data, isLoading, isSuccess, isError}] = useUpdateIssueMutation();

    useEffect(() => {
        setISReceiverDepartment(parseInt(row?.receiver_department_id) === parseInt(user?.selected_department));
        setISStoreManager(user?.role_object?.filter(r => r.name === "Store Manager").length);

        if (parseInt(row?.receiver_department_id) === parseInt(user?.selected_department) && row.department_status){
            setSelectedDropdown('Approved');
        }else if (parseInt(row?.receiver_department_id) === parseInt(user?.selected_department) && !row.department_status){
            setSelectedDropdown('Pending');
        }
        if (user?.role_object?.filter(r => r.name === "Store Manager").length && row.store_status){
            setSelectedDropdown('Approved');
        }else if (user?.role_object?.filter(r => r.name === "Store Manager").length && !row.store_status){
            setSelectedDropdown('Pending');
        }
    }, [user, row])
    const updateStatus = (arg, selected) => {
        const c = confirm("Are your sure?");
        console.log(c)
        if (!c) return;
        const both = isStoreManager && row?.department_status && isReceiverDepartment && isDepartmentHead;
        const storeManager = isStoreManager && row?.department_status;
        const department = isReceiverDepartment && isDepartmentHead;
        updateIssue({ ...arg, department: both ? 'both' : storeManager ? 'store' : department ? 'department' : "" })
        setSelectedDropdown(selected);
    }

    return (
        <>
            {
                ((isStoreManager && row?.department_status) || (isReceiverDepartment && isDepartmentHead)) && selectedDropdown !== "Approved"  ? (
                    <Dropdown
                        label={selectedDropdown}
                        dismissOnClick={true}
                    >
                        <Dropdown.Item
                            onClick={() => {
                                updateStatus({
                                    status: 1,
                                    id: row.id
                                }, 'Approved');
                            }}
                        >
                            Approve
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                updateStatus({
                                    status: 2,
                                    id: row.id
                                }, 'Rejected');
                            }}
                        >
                            Reject
                        </Dropdown.Item>
                    </Dropdown>
                ) : (
                    <div className={`flex flex-col`}>
                        <div>{ !row?.department_status ? 'Pending in department.' : null}</div>
                        <div>{row?.department_status ? row?.store_status ? <span className={`text-green-800`}> Approved & Issued. </span> : 'Pending in store.' : null}</div>
                    </div>
                )
            }
        </>
    )
}

export default IssueStatus;
