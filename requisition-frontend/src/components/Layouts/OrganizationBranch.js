import React, { useEffect, useState } from "react";
import { Select } from "flowbite-react";
import { useSetBranchMutation, useSetOrganizationMutation } from "@/store/service/user/ChangeOrganizationBranch";
export default function OrganizationBranch({user, changingEffect}){
  const {organizations, branches, selected_organization, selected_branch} = user ?? {};
  const [organization_id, setOrganizationId] = useState(selected_organization);
  const [branch_id, setBranchId] = useState(selected_branch);
  const [updateOrganization, updateOrganizationResult] = useSetOrganizationMutation();
  const [updateBranch, updateBranchResult] = useSetBranchMutation();

  useEffect(() => {
    if (selected_branch){
      setBranchId(selected_branch)
    }
  }, [selected_branch])

    useEffect(() => {
        changingEffect(updateBranchResult.isSuccess)
    }, [updateBranchResult.isSuccess]);

  return (
    <div className="max-w-7xl flex flex-row mx-auto py-6 px-4 my-1 sm:px-6 lg:px-8 gap-2">
      {
        organizations?.length > 1 && (
          <Select
            value={organization_id}
            onChange={(e) => {
              updateOrganization({ organization_id: e.target.value });
              setOrganizationId(e.target.value);
            }}
          >
            <option></option>
            {
              organizations?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)
            }
          </Select>
        )
      }
      {
        selected_branch && (
          <Select
            value={branch_id}
            onChange={(e) => {
              updateBranch({branch_id: e.target.value});
              setBranchId(e.target.value);
            }}
          >
            <option></option>
            {
              branches?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)
            }
          </Select>
        )
      }
    </div>
  )
}
