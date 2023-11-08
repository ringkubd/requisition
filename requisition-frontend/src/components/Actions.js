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
                    ) :  view && isElement(view) ? {...view} : <span></span>
                }
                {
                    edit ? (
                        <Button
                            onClick={submitEdit}
                            gradientMonochrome={`lime`}
                        >
                            <HiPencilSquare />
                        </Button>
                    ) : <span></span>
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
                    ) : <span></span>
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
                    ) : <span></span>
                }
                {!edit && !view && !destroy && !print ? <Button>No Action</Button> : <span></span>}
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
