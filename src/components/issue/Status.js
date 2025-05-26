import React, { useEffect, useState } from 'react'
import { Button, Tooltip } from 'flowbite-react'
import { useAuth } from '@/hooks/auth'
import { useUpdateIssueMutation } from '@/store/service/issue'
import { AiFillCheckSquare, AiFillDelete } from 'react-icons/ai'

const IssueStatus = ( { row } ) =>
{
    // Guard against row being null or undefined
    if (!row) {
        return <span>No data</span>;
    }
    
    const { user } = useAuth()
    const [ selectedDropdown, setSelectedDropdown ] = useState( 'Status' )
    
    // More defensive checks for user and permissions
    const isDepartmentHead = 
        (user && typeof user === 'object') ? 
            (user?.current_department_head === parseInt( user?.id ) ||
            user?.role_names?.includes?.( 'System Administrator' ) || 
            (user?.permissions && Array.isArray(user?.permissions) && 
             user?.permissions.filter( p => p?.name === "approve_department_issue" )?.length)) : false
    const [ isReceiverDepartment, setISReceiverDepartment ] = useState(
        (row?.receiver_department_id && user?.selected_department) ? 
            parseInt( row.receiver_department_id ) === parseInt( user.selected_department )
            : false
    )
    const [ isStoreManager, setISStoreManager ] = useState(
        (user?.role_object && Array.isArray(user.role_object)) ?
            user.role_object.filter( r => r?.name === 'Store Manager' ).length > 0
            : false
    )
    const [
        updateIssue,
        { data, isLoading, isSuccess, isError },
    ] = useUpdateIssueMutation()

    useEffect( () =>
    {
        try {
            if (row && user) {
                setISReceiverDepartment(
                    (row.receiver_department_id && user.selected_department) ? 
                        parseInt( row.receiver_department_id ) === parseInt( user.selected_department )
                        : false
                )
                setISStoreManager(
                    (user.role_object && Array.isArray(user.role_object)) ?
                        user.role_object.filter( r => r?.name === 'Store Manager' ).length > 0
                        : false
                )
            }
        } catch (error) {
            console.error("Error in IssueStatus useEffect:", error);
        }

        if (
            parseInt( row?.receiver_department_id ) ===
            parseInt( user?.selected_department ) &&
            row.department_status
        )
        {
            setSelectedDropdown( 'Approved' )
        } else if (
            parseInt( row?.receiver_department_id ) ===
            parseInt( user?.selected_department ) &&
            !row.department_status
        )
        {
            setSelectedDropdown( 'Pending' )
        }
        if (
            user?.role_object?.filter( r => r.name === 'Store Manager' ).length &&
            row.store_status
        )
        {
            setSelectedDropdown( 'Approved' )
        } else if (
            user?.role_object?.filter( r => r.name === 'Store Manager' ).length &&
            !row.store_status
        )
        {
            setSelectedDropdown( 'Pending' )
        }
    }, [ user, row ] )
    const updateStatus = ( arg, selected ) =>
    {
        const c = confirm( 'Are your sure?' )
        if ( !c ) return
        const both =
            isStoreManager &&
            row?.department_status &&
            isReceiverDepartment &&
            isDepartmentHead
        const storeManager = isStoreManager && row?.department_status
        const department = isReceiverDepartment && isDepartmentHead
        updateIssue( {
            ...arg,
            department: both
                ? 'both'
                : storeManager
                    ? 'store'
                    : department
                        ? 'department'
                        : '',
        } )
        setSelectedDropdown( selected )
    }
    return (
        <div>
            {( ( isStoreManager && row?.department_status ) ||
                ( isReceiverDepartment && isDepartmentHead ) ) &&
                selectedDropdown !== 'Approved' ? (
                <div className="flex flex-wrap">
                    <Tooltip content={`Approved`} placement={`left-start`}>
                        <Button
                            gradientDuoTone="greenToBlue"
                            onClick={() =>
                            {
                                updateStatus(
                                    {
                                        status: 1,
                                        uuid: row.uuid,
                                    },
                                    'Approved',
                                )
                            }}>
                            <AiFillCheckSquare />
                        </Button>
                    </Tooltip>
                    <Tooltip content={`Reject`} placement={`top`}>
                        <Button
                            gradientDuoTone="redToYellow"
                            onClick={() =>
                            {
                                updateStatus(
                                    {
                                        status: 2,
                                        uuid: row.uuid,
                                    },
                                    'Rejected',
                                )
                            }}>
                            <AiFillDelete />
                        </Button>
                    </Tooltip>
                </div>
            ) : (
                <div className={`flex flex-col`}>
                    <div>
                        {!row?.department_status
                            ? 'Pending in department.'
                            : null}
                    </div>
                    <div>
                        {row?.department_status ? (
                            row?.store_status ? (
                                <span className={`text-green-800`}>
                                    {' '}
                                    Approved & Issued.{' '}
                                </span>
                            ) : (
                                'Pending in store.'
                            )
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    )
}

export default IssueStatus
