import React from "react";
import { Button } from "flowbite-react";
import { useRouter } from "next/router";
import { AiFillSetting , AiFillPrinter, AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import Link from "next/link";
import { isElement } from "@/lib/helpers";
import { useAuth } from "@/hooks/auth";

const Actions = ({edit, destroy, view , itemId, progressing, print, other, permissionModule}) => {
    const router = useRouter();
    const { user } = useAuth({ middleware: 'auth' });
    const submitEdit = () => {
        router.push(edit)
    }
    const submitDestroy = () => {
        const yes = confirm('Are you sure?');
        destroy && yes && destroy(itemId);
    }
    const submitView = () => {
        router.push(view);
    }

    function checkPermission(permission){
        if (user){
            const roles = user.role_object
            const permissions = user.permissions;
            if (roles.filter(r => r.name === "Super Admin").length){
                return true;
            }else{
                return permissions.filter((p) => {
                        return permission+'_'+permissionModule === p.name ? p.name: null;
                }).length
            }
        }
        return false;
    }
    return (
        <>
            <Button.Group>
                {
                    checkPermission('view') ?
                    view && !isElement(view) ?  (
                        <Button
                            onClick={submitView}
                            gradientMonochrome={`cyan`}
                        >
                            <AiFillEye />
                        </Button>
                    ) :  view && isElement(view) ? {...view} : <></> : <></>
                }
                {
                    checkPermission('update') ?
                      edit ? (
                        <Button
                            onClick={submitEdit}
                            gradientMonochrome={`lime`}
                        >
                            <AiFillEdit />
                        </Button>
                    ) : <></> : <></>
                }
                {
                    checkPermission('delete') ?
                      destroy ?  (
                        <Button
                            onClick={submitDestroy}
                            gradientMonochrome={`failure`}
                            isProcessing={progressing}
                        >
                            <AiFillDelete />
                        </Button>
                    ) : <></> : <></>
                }
                {
                    checkPermission('view') ?
                      print ? (
                        <Link href={print}>
                            <Button
                              gradientMonochrome="info"
                            >
                                <AiFillPrinter />
                            </Button>

                        </Link>
                    ) : <></> : <></>
                }
                {
                    checkPermission('view') ?
                      other ? (
                      <Link href={other}>
                          <Button
                            gradientMonochrome="teal"
                          >
                              <AiFillSetting />
                          </Button>

                      </Link>
                    ) : <></> : <></>
                }
                {!edit && !view && !destroy && !print && !other ? <Button>No Action</Button> : <></>}
            </Button.Group>
        </>
    )
}

Actions.defaultProps = {
    edit : false,
    destroy : false,
    view : false,
    itemId : false,
    progressing: false,
    other: false,
    createPermission: false,
    editPermission: false,
    deletePermission: false,
    viewPermission: false
}
export default Actions;
