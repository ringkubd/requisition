import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, FileInput, Label, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import { useStoreBrandsMutation } from "@/store/service/brands";

const create = (props) => {
    const router = useRouter();
    const [storeBrand, storeResult] = useStoreBrandsMutation();
    let formikForm = useRef();

    const initValues = {
        contact: '',
        logo: '',
        address: '',
        name: '',
    }
    useEffect(() => {
        if (storeResult.isError){
            formikForm.current.setErrors(storeResult.error.data.errors)
            formikForm.current.setSubmitting(false);
        }
        if (storeResult.isError || storeResult.isSuccess){
            formikForm.current.setSubmitting(false)
            formikForm.current.setSubmitting(false);
        }
        if (!storeResult.isLoading && storeResult.isSuccess){
            toast.success('Brand stored successfully.')
            formikForm.current.setSubmitting(false);
            router.push('/brands')
        }
    }, [storeResult]);
    const submit = async (values, pageProps) => {
        pageProps.setSubmitting(true);
        const formData = new FormData();
        for ( let key in values ) {
            formData.append(key, values[key]);
        }
        storeBrand(formData)
    }
    const MAX_FILE_SIZE = 1024000; //100KB

    const validFileExtensions = { image: ['jpg', 'gif', 'png', 'jpeg', 'svg', 'webp'] };

    function isValidFileType(fileName, fileType) {
        return fileName && validFileExtensions[fileType].indexOf(fileName.split('.').pop()) > -1;
    }


    const validationSchema = Yup.object().shape({
        contact: Yup.string().label('Contact'),
        logo: Yup.mixed()
            .nullable()
            .notRequired()
          .test("is-valid-type", "Not a valid image type",
            value => !value || isValidFileType(value && value.name.toLowerCase(), "image"))
          .test("is-valid-size", "Max allowed size is 1000KB",
            value => !value || (value && value.size <= MAX_FILE_SIZE))
          .label('Logo'),
        address: Yup.string().label('Address'),
        name: Yup.string().required().label('Brand Name'),
    })

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Add new brand.
                    </h2>
                }
            >
                <Head>
                    <title>Add new brand</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'brands'}
                                href={`/brands`}
                            >
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
                            <Formik
                                initialValues={initValues}
                                onSubmit={submit}
                                validationSchema={validationSchema}
                                innerRef={formikForm}
                            >
                                {
                                    ({handleSubmit, handleChange, setFieldValue, handleBlur, values, errors, isSubmitting, setErrors}) => (
                                        <div className="flex flex-col gap-4 md:w-1/2 w-full">
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                            htmlFor="name"
                                                            value="Brand Name"
                                                        />
                                                    </div>
                                                    <TextInput
                                                        id="name"
                                                        placeholder="Pran"
                                                        type="text"
                                                        required
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                        name='name'
                                                        render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                          htmlFor="contact"
                                                          value="Contact Address"
                                                        />
                                                    </div>
                                                    <TextInput
                                                      id="contact"
                                                      placeholder="+8801737956549"
                                                      type="text"
                                                      required
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                      name='contact'
                                                      render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                          htmlFor="address"
                                                          value="Address"
                                                        />
                                                    </div>
                                                    <TextInput
                                                      id="address"
                                                      placeholder="Dhaka"
                                                      type="text"
                                                      required
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                      name='address'
                                                      render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <div className="w-full">
                                                    <div className="mb-2 block">
                                                        <Label
                                                          htmlFor="logo"
                                                          value="Logo"
                                                        />
                                                    </div>
                                                    <FileInput
                                                      id="logo"
                                                      required
                                                      onChange={(event) => {
                                                          setFieldValue("logo", event.currentTarget.files[0]);
                                                      }}
                                                      onBlur={handleBlur}
                                                    />
                                                    <ErrorMessage
                                                      name='logo'
                                                      render={(msg) => <span className='text-red-500'>{msg}</span>} />
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-4 justify-end">
                                                <Button
                                                    isProcessing={isSubmitting}
                                                    onClick={handleSubmit}
                                                    type='submit'
                                                    color={`success`}>Submit</Button>
                                            </div>
                                        </div>
                                    )
                                }

                            </Formik>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default create;
