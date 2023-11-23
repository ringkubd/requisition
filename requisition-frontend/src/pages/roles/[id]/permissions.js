import AppLayout from "@/components/Layouts/AppLayout";
import { useRouter } from "next/router";
import { useEditRolesQuery, useGetPermissionsForRoleQuery, useUpdateRolePermissionMutation } from "@/store/service/roles";
import { useEffect, useState } from "react";
import Head from "next/head";
import NavLink from "@/components/navLink";
import { Button, Card, Checkbox, Label, Table } from "flowbite-react";

export default function Permissions(){
    const [maxColumn, setMaxColumn] = useState(1);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [checkedModule, setCheckedModule] = useState([]);
    const router = useRouter();
    const {data: role, isLoading: roleIsLoading, isError: roleIsError} = useEditRolesQuery(router.query.id, {
        skip: !router.query.id
    })
    const {data: permissions, isLoading: permissionsIsLaoding, isError: permissionsIsError} = useGetPermissionsForRoleQuery();

    const [updatePermission, result] = useUpdateRolePermissionMutation();

    useEffect(() => {
        if (permissions){
            const max = Object.keys(permissions.data).map((module) => (
                permissions.data[module].length
            ))
            setMaxColumn(Math.max(...max));
        }
    }, [permissionsIsLaoding, permissions])

    useEffect(() => {
        if (role && selectedPermissions.length){
            const permissionsData = permissions.data;
            let newPermissionModel = [];
            let removePermissionModel = [];
            Object.keys(permissionsData).map(k => {
                const modulePermission = permissionsData[k].map((mp) => mp.id);
                if (modulePermission.length === selectedPermissions.filter(sp => modulePermission.indexOf(sp) !== -1).length){
                    checkedModule.indexOf(k) === -1 ? newPermissionModel.push(k) : '';
                }else{
                    removePermissionModel.push(k);
                }
            })
            if (newPermissionModel.length){
                setCheckedModule(newPermissionModel);
            }else{
                setCheckedModule(checkedModule.filter(cm => removePermissionModel.indexOf(cm) === -1));
            }
        }
    }, [selectedPermissions, permissions, role])

    useEffect(() => {
        if (role){
            setSelectedPermissions(role.data.permissions_array);
        }
    }, [role, roleIsLoading, roleIsError]);

    const permissionChange = (permission, updateType) => {
        updatePermission({id : router.query.id, permission: permission, update_type: updateType});
        if (updateType == "attach"){
            setSelectedPermissions([...selectedPermissions, parseInt(permission)])
        }else{
            setSelectedPermissions(selectedPermissions.filter(p => p != permission))
        }
    }

    const permissionGroupChange = (moduleName) => {
        const permissionIdArray = permissions.data[moduleName].map((p) => p.id);
        var attach = [];
        var detach = [];
        const sp = permissionIdArray.map((p) => {
            if (selectedPermissions.indexOf(p) === -1){
                return attach.push(p)
            }else{
                return detach.push(p)
            }
        })
        if (attach.length){
            updatePermission({id : router.query.id, permission: attach, update_type: "attach"});
            setSelectedPermissions([...selectedPermissions, ...attach])
            setCheckedModule([...checkedModule, moduleName]);
        }else{
            updatePermission({id : router.query.id, permission: detach, update_type: "detach"});
            setSelectedPermissions(selectedPermissions.filter(sp => {
                if (detach.indexOf(sp) === -1){
                    return sp;
                }
            }).filter(Number))
            setCheckedModule(checkedModule.filter(m => m !== moduleName))
        }
    }

    return (
        <AppLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">
                Role Permissions.
            </h2>}
        >
            <Head>
                <title>Permissions update for role {role?.name} .</title>
            </Head>
            <div className="md:py-8 md:mx-16 mx-0 md:px-4 sm:px-6 lg:px-8">
                <Card>
                    <div className="flex flex-row space-x-4 space-y-4  shadow-lg py-4 px-4">
                        <NavLink
                            active={router.pathname === 'roles'}
                            href={`/roles`}
                        >
                            <Button>Back</Button>
                        </NavLink>
                    </div>
                    <Table>
                        <Table.Head className={`border`}>
                            <Table.HeadCell scope="col">Module</Table.HeadCell>
                            <Table.HeadCell scope="col" className={`text-center`} colSpan={maxColumn}>Permissions</Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                            {
                                !permissionsIsLaoding && !permissionsIsError && permissions ? Object.keys(permissions?.data)?.map((p, i) => (
                                    <Table.Row key={i}>
                                        <Table.HeadCell>
                                            <Label htmlFor={p}>{p.toUpperCase()}</Label>
                                            <Checkbox
                                                className={`form-checkbox rounded focus:ring-2`}
                                                id={p}
                                                value={p}
                                                onChange={(e) => permissionGroupChange(p)}
                                                checked={checkedModule.indexOf(p) !== -1}
                                            />
                                            {checkedModule[p]}
                                        </Table.HeadCell>
                                        {
                                            permissions?.data[p]?.map((per) => (
                                                <Table.Cell key={per.id}>
                                                    <div className={`space-x-4 flex flex-row items-center align-middle`}>
                                                        <Checkbox
                                                            className={`form-checkbox rounded focus:ring-2`}
                                                            id={per.id}
                                                            checked={selectedPermissions.indexOf(per.id) != -1}
                                                            value={per.id}
                                                            onChange={(e) => {
                                                                permissionChange(e.target.value, e.target.checked ? 'attach' : 'detach');
                                                            }}
                                                        />
                                                        <label htmlFor={per.id}>{per.name.replaceAll('_', ' ').toUpperCase()}</label>
                                                    </div>
                                                </Table.Cell>
                                            ))
                                        }
                                    </Table.Row>
                                )) : (
                                    <Table.Row>
                                        <Table.Cell>No Data</Table.Cell>
                                    </Table.Row>
                                )
                            }
                        </Table.Body>
                    </Table>
                </Card>
            </div>
        </AppLayout>
    )
}
