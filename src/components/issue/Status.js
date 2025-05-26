import React, { useEffect, useState } from 'react'
import { Button, Tooltip } from 'flowbite-react'
import { useAuth } from '@/hooks/auth'
import { useUpdateIssueMutation } from '@/store/service/issue'
import { AiFillCheckSquare, AiFillDelete } from 'react-icons/ai'

// Create ErrorBoundary for this component
class StatusErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error("Error in IssueStatus component:", error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return <span>Status unavailable</span>;
        }
        
        return this.props.children;
    }
}

const IssueStatus = ( { row } ) =>
{
    // Guard against row being null or undefined
    if (!row || typeof row !== 'object') {
        return <span>No data</span>;
    }
    
    const { user } = useAuth()
    const [ selectedDropdown, setSelectedDropdown ] = useState( 'Status' )
    
    // More defensive checks for user and permissions
    const isDepartmentHead = 
        (user && typeof user === 'object') ? 
            (user?.current_department_head === parseInt( user?.id || 0 ) ||
            (user?.role_names && Array.isArray(user?.role_names) && user?.role_names?.includes?.( 'System Administrator' )) || 
            (user?.permissions && Array.isArray(user?.permissions) && 
             user?.permissions.filter( p => p && typeof p === 'object' && p?.name === "approve_department_issue" )?.length > 0)) : false
    
    const [ isReceiverDepartment, setISReceiverDepartment ] = useState(
        (row?.receiver_department_id && user?.selected_department) ? 
            parseInt( row.receiver_department_id || 0 ) === parseInt( user.selected_department || 0 )
            : false
    )
    
    const [ isStoreManager, setISStoreManager ] = useState(
        (user?.role_object && Array.isArray(user.role_object)) ?
            user.role_object.filter( r => r && typeof r === 'object' && r?.name === 'Store Manager' ).length > 0
            : false
    )
    const [
        updateIssue,
        { data, isLoading, isSuccess, isError },
    ] = useUpdateIssueMutation()

    useEffect( () =>
    {
        try {
            // Make sure we have valid objects
            if (row && typeof row === 'object' && user && typeof user === 'object') {
                // Safely update the receiver department state
                setISReceiverDepartment(
                    (row.receiver_department_id && user.selected_department) ? 
                        parseInt( row.receiver_department_id || 0 ) === parseInt( user.selected_department || 0 )
                        : false
                )
                
                // Safely update the store manager state
                setISStoreManager(
                    (user.role_object && Array.isArray(user.role_object)) ?
                        user.role_object.filter( r => r && typeof r === 'object' && r?.name === 'Store Manager' ).length > 0
                        : false
                )
                
                // Handle dropdown state with defensive checks
                try {
                    // For department status
                    if (
                        row.receiver_department_id && 
                        user.selected_department &&
                        parseInt( row.receiver_department_id || 0 ) === parseInt( user.selected_department || 0 )
                    ) {
                        // Set based on the department status
                        setSelectedDropdown(row.department_status ? 'Approved' : 'Pending')
                    }
                    
                    // For store manager
                    if (
                        user.role_object &&
                        Array.isArray(user.role_object) && 
                        user.role_object.filter( r => r && typeof r === 'object' && r.name === 'Store Manager' ).length > 0
                    ) {
                        // Set based on the store status
                        if (typeof row.store_status !== 'undefined') {
                            setSelectedDropdown(row.store_status ? 'Approved' : 'Pending')
                        }
                    }
                } catch (innerError) {
                    console.error("Error processing status in IssueStatus:", innerError);
                    setSelectedDropdown('Status');
                }
            }
        } catch (error) {
            console.error("Error in IssueStatus useEffect:", error);
            // Set a safe default
            setSelectedDropdown('Status');
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

// Wrap the component with an error boundary
const SafeIssueStatus = (props) => {
    return (
        <StatusErrorBoundary>
            <IssueStatus {...props} />
        </StatusErrorBoundary>
    );
};

export default SafeIssueStatus
