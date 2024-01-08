import React, { useEffect, useState } from "react";
import { Select } from "flowbite-react";
import {
    useSetBranchMutation,
    useSetDepartmentMutation,
    useSetOrganizationMutation
} from "@/store/service/user/ChangeOrganizationBranch";
import {
    useGetNavigationBranchQuery,
    useGetNavigationDepartmentQuery,
    useGetNavigationOrganizationQuery
} from "@/store/service/navigation";
export default function OrganizationBranch({user, changingEffect}){
    const { selected_organization, selected_branch, selected_department } = user ?? {};
    const [organization_id, setOrganizationId] = useState(selected_organization);
    const [branch_id, setBranchId] = useState(selected_branch);
    const [department_id, setDepartmentId] = useState(selected_department);
    const [updateOrganization, updateOrganizationResult] = useSetOrganizationMutation();
    const [updateBranch, updateBranchResult] = useSetBranchMutation();
    const [updateDepartment, updateDepartmentResult] = useSetDepartmentMutation();
    const {data: organizations, isLoading: organizationISLoading} = useGetNavigationOrganizationQuery();
    const {data: branches, isLoading: branchISLoading} = useGetNavigationBranchQuery({organization_id}, {
        skip: !selected_organization
    });
    const {data: departments, isLoading: departmentISLoading} = useGetNavigationDepartmentQuery({branch_id}, {
        skip: !branch_id
    });


    useEffect(() => {
        if (selected_branch){
            setBranchId(selected_branch)
        }
        if (selected_department){
            setDepartmentId(selected_department)
        }
        if (selected_organization){
            setOrganizationId(selected_organization)
        }
    }, [user])

    useEffect(() => {
        changingEffect(updateBranchResult.isSuccess)
    }, [updateBranchResult.isSuccess]);

    useEffect(() => {
        changingEffect(updateDepartmentResult.isSuccess)
    }, [updateDepartmentResult.isSuccess]);

    return (
        <div className="max-w-7xl flex flex-row mx-auto py-6 px-4 my-1 sm:px-6 lg:px-8 gap-2">
            {
                organizations?.data?.length > 1 && (
                    <label htmlFor={`user_organization_id`} className={`flex flex-row items-center`}>
                        Organization
                        <Select
                            id={`user_organization_id`}
                            value={organization_id}
                            onChange={(e) => {
                                updateOrganization({ organization_id: e.target.value });
                                setOrganizationId(e.target.value);
                            }}
                        >
                            <option></option>
                            {
                                organizations?.data?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)
                            }
                        </Select>
                    </label>
                )
            }
            {
                branches?.data?.length && (
                    <label htmlFor={'user_branch_id'} className={`flex flex-row items-center`}>
                        Branch
                        <Select
                            id={`user_branch_id`}
                            value={branch_id}
                            onChange={(e) => {
                                updateBranch({branch_id: e.target.value});
                                setBranchId(e.target.value);
                            }}
                        >
                            <option></option>
                            {
                                branches?.data?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)
                            }
                        </Select>
                    </label>
                )
            }
            {

                    <label htmlFor={`user_department_id`} className={`flex flex-row items-center`}>
                        Departments
                        <Select
                            id={`user_department_id`}
                            value={department_id}
                            onChange={(e) => {
                                updateDepartment({department_id: e.target.value});
                                setDepartmentId(e.target.value)
                            }}
                        >
                            <option></option>
                            {
                                departments?.data?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)
                            }
                        </Select>
                    </label>

            }
        </div>
    )
}
