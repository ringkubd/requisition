import { useDispatch, useSelector } from 'react-redux'
import DataTable from 'react-data-table-component'
import { Button, Label, TextInput } from 'flowbite-react'
import { ErrorMessage, Formik } from 'formik'
import { setProductMeta } from '@/store/service/product/productMetaSlice'
import * as Yup from 'yup'
import { useEffect } from 'react'

export default function MetaForm(props) {
    const dispatch = useDispatch()
    const { metas } = useSelector(state => state.product_meta)
    const { meta, submit } = props
    const metaInitials = {
        key: '',
        value: '',
    }
    useEffect(() => {
        if (meta) {
            dispatch(setProductMeta([...meta]))
        }
    })
    const submitMeta = (values, props) => {
        dispatch(setProductMeta(values))
        props.resetForm()
        props.setSubmitting(false)
    }
    const validateMeta = Yup.object().shape({
        key: Yup.string().required().label('Key'),
        value: Yup.string().required().label('Value'),
    })
    const metaColumns = [
        {
            name: 'Key',
            selector: row => row.key,
            sortable: true,
        },
        {
            name: 'Value',
            selector: row => row.value,
            sortable: true,
        },
    ]

    const submitProduct = () => {
        props.submit()
    }

    return (
        <>
            <Formik
                initialValues={metaInitials}
                onSubmit={submitMeta}
                validationSchema={validateMeta}>
                {({
                    handleBlur,
                    handleChange,
                    handleSubmit,
                    isSubmitting,
                    setFieldValue,
                    errors,
                    values,
                }) => (
                    <>
                        <h2 className={`w-full border-b pb-2 font-bold`}>
                            Meta Informations
                        </h2>
                        <div className="flex flex-row gap-4">
                            <DataTable columns={metaColumns} data={metas} />
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="w-full">
                                <div className="flex flex-row mb-2 w-full space-x-4">
                                    <div className={`w-full`}>
                                        <Label htmlFor={`key`} value={`Key`} />
                                        <TextInput
                                            id={`key`}
                                            name={`key`}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.key}
                                        />
                                        <ErrorMessage
                                            name="key"
                                            render={msg => (
                                                <span className="text-red-500">
                                                    {msg}
                                                </span>
                                            )}
                                        />
                                    </div>
                                    <div className={`w-full`}>
                                        <Label
                                            htmlFor={`value`}
                                            value={`Value`}
                                        />
                                        <TextInput
                                            id={`value`}
                                            name={`value`}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.value}
                                        />
                                        <ErrorMessage
                                            name="value"
                                            render={msg => (
                                                <span className="text-red-500">
                                                    {msg}
                                                </span>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row gap-4 justify-end">
                            <Button
                                isProcessing={isSubmitting}
                                onClick={handleSubmit}
                                type="submit"
                                color={`info`}>
                                Add
                            </Button>
                            <Button
                                isProcessing={isSubmitting}
                                onClick={submitProduct}
                                type="submit"
                                color={`success`}>
                                Submit Product
                            </Button>
                        </div>
                    </>
                )}
            </Formik>
        </>
    )
}
