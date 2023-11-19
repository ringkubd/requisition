import React from "react";
import { Button } from "flowbite-react";
import { useRouter } from "next/router";
import { HiEye, HiPencilSquare, HiTrash } from "react-icons/hi2";
import { HiPrinter } from "react-icons/hi";
import Link from "next/link";
import { isElement, isReactComponent } from "@/lib/helpers";

const Actions = (props) => {
    const router = useRouter();
    const {edit, destroy, view , itemId, progressing, print} = props;
    const submitEdit = () => {
        router.push(edit)
    }
    const submitDestroy = () => {
        const yes = confirm('Are you sure?')
        destroy && yes && destroy(itemId);
    }
    const submitView = () => {
        router.push(view);
    }
    return (
        <>
            <Button.Group>
                {
                    view && !isElement(view) ?  (
                        <Button
                            onClick={submitView}
                            gradientMonochrome={`cyan`}
                        >
                            <HiEye />
                        </Button>
                    ) :  view && isElement(view) ? {...view} : <></>
                }
                {
                    edit ? (
                        <Button
                            onClick={submitEdit}
                            gradientMonochrome={`lime`}
                        >
                            <HiPencilSquare />
                        </Button>
                    ) : <></>
                }
                {
                    destroy ?  (
                        <Button
                            onClick={submitDestroy}
                            gradientMonochrome={`failure`}
                            isProcessing={progressing}
                        >
                            <HiTrash />
                        </Button>
                    ) : <></>
                }
                {
                    print ? (
                        <Link href={print}>
                            <Button
                                gradientDuoTone="purpleToBlue"
                                outline
                            >
                                <HiPrinter />
                            </Button>

                        </Link>
                    ) : <></>
                }
                {!edit && !view && !destroy && !print ? <Button>No Action</Button> : <></>}
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
}
export default Actions;
