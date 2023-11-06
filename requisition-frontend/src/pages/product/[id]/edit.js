import Head from 'next/head'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button, Card } from 'flowbite-react'
import NavLink from '@/components/NavLink'
import { useRouter } from 'next/router'
import VariantForm from "@/components/product/VariantForm";
import MetaForm from "@/components/product/MetaForm";
import { FaFontAwesome } from "react-icons/fa";
import { SiMetafilter } from "react-icons/si";
import { TbHttpOptions } from "react-icons/tb";
import BasicForm from "@/components/product/BasicForm";
import { useDispatch, useSelector } from "react-redux";
import { setActiveForm } from "@/store/service/product/product_active_form";
import {
    useEditProductQuery,
    useUpdateProductMutation
} from "@/store/service/product/product";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { resetProductBasicInfo, setProductBasicInfo } from "@/store/service/product/product_basic_form";
import { resetProductMeta, setProductMeta, setEditProductMeta } from "@/store/service/product/productMetaSlice";
import { resetProductOptionsLocal, setProductOptionsLocal, setEditProductOptionsLocal } from "@/store/service/options/optionSlice";

const edit = props => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [storeProduct, storeResult] = useUpdateProductMutation()
    const {activeForm} = useSelector(state => state.product_active_form);

    const {data, isLoading, isError} = useEditProductQuery(router.query.id, {
        skip: !router.query.id
    });
    const { productOptions } = useSelector((state) => state.product_option_local);
    const { metas } = useSelector((state) => state.product_meta);
    const { basic } = useSelector(state => state.product_basic_form)
    function setCurrentForm (formId) {
        dispatch(setActiveForm(formId));
    }
    function currentForm() {
        switch (activeForm){
            case 1:
                return <BasicForm basic={data?.data} />
            case 2:
                return <VariantForm />
            case 3:
                return  <MetaForm submit={submitForm} />
            default:
                return <BasicForm />
        }
    }

    useEffect(() => {
        if (!isError && !isLoading && data){
            dispatch(setProductBasicInfo(data?.data));
            dispatch(setEditProductOptionsLocal(data?.data?.product_options));
            dispatch(setEditProductMeta(data?.data?.product_metas));
        }
    }, [isLoading, isError, data])

    useEffect(() => {
        if (!storeResult.isLoading && storeResult.isSuccess) {
            toast.success('Product stored successfully.')
            router.push('/product')
        }
    }, [storeResult])

    function submitForm(){
        // storeProduct()
        console.log(productOptions)
        storeProduct({
            id: data.data.id,
            basic,
            metas,
            productOptions
        })
    }

    useEffect(() => {
        if (!storeResult.isLoading && !storeResult.isError && storeResult.isSuccess){
            dispatch(resetProductBasicInfo());
            dispatch(resetProductMeta());
            dispatch(resetProductOptionsLocal());
            dispatch(setActiveForm(1));
        }
    }, [storeResult])

    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Add new product.
                    </h2>
                }>
                <Head>
                    <title>Add new product</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'product'}
                                href={`/product`}>
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div
                            className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
                            <ol className="flex justify-center justify-items-center items-center w-full mb-4 sm:mb-5">
                                <li
                                    onClick={() => setCurrentForm(1)}
                                    className={`flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b  after:border-4 after:inline-block  cursor-pointer ${activeForm === 1 ? 'text-blue-600 dark:text-blue-500 after:border-blue-100 dark:after:border-blue-800': 'dark:after:border-gray-700 after:border-gray-100'}`}>
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${activeForm === 1 ? 'bg-blue-200 dark:bg-blue-800' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                        <FaFontAwesome name='FaProductHunt' size={24} />
                                    </div>
                                </li>
                                <li
                                    onClick={() => Object.values(basic).length ? setCurrentForm(2): ''}
                                    className={`flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block cursor-pointer ${activeForm === 2 ? 'text-blue-600 dark:text-blue-500 after:border-blue-100 dark:after:border-blue-800': 'dark:after:border-gray-700 after:border-gray-100'}`}>
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${activeForm === 2 ? 'bg-blue-200 dark:bg-blue-800' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                        <TbHttpOptions size={24} />
                                    </div>
                                </li>
                                <li
                                    onClick={() => Object.values(productOptions).length ? setCurrentForm(3) : "" }
                                    className={`flex items-center w-full after:content-[''] after:w-full after:h-1 after:border-b  after:border-4 after:inline-block  cursor-pointer ${activeForm === 3 ? 'text-blue-600 dark:text-blue-500 after:border-blue-100 dark:after:border-blue-800': 'dark:after:border-gray-700 after:border-gray-100'}`}>
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${activeForm === 3 ? 'bg-blue-200 dark:bg-blue-800' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                        <SiMetafilter  size={24} />
                                    </div>
                                </li>
                            </ol>
                            <div
                                className={`flex flex-col md:flex-row w-full md:space-x-4`}>
                                <div className="flex flex-col gap-4 w-full border rounded p-2 shadow">
                                    { !isLoading && !isError ? currentForm() : isLoading ? 'Loading....' : 'error'}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default edit;
