import Head from "next/head";
import AppLayout from "@/components/Layouts/AppLayout";
import { Button, Card, Label, Textarea, TextInput } from "flowbite-react";
import NavLink from "@/components/navLink";
import { useRouter } from "next/router";
import { ErrorMessage, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import { useGetUsersQuery } from "@/store/service/user/management";
import { useEditIssueQuery, useStoreIssueMutation, useUpdateIssueMutation } from "@/store/service/issue";
import moment from "moment";
import Select from "react-select";
import DataTable from "react-data-table-component";
import Actions from "@/components/actions";
import axios from "@/lib/axios";
import { AsyncPaginate } from "react-select-async-paginate";
import { useAuth } from "@/hooks/auth";
import Quantity from "@/components/issue/Quantity";
const Edit = (props) => {
    const router = useRouter();
    const { user } = useAuth()
    const [storeProductIssue, storeResult] = useUpdateIssueMutation();
    let formikForm = useRef();
    const selectRef = useRef();
    const {data: users , isLoading: userIsLoading} = useGetUsersQuery({
        branch_id: user?.selected_branch,
        department_id: user?.selected_department
    });
    const { data: issue, isLoading: issueISLoading, isError: issueISError, isSuccess: issueISSuccess } = useEditIssueQuery(router.query.id, {
        skip: !router.query.id
    })
    const [productOptions, setProductOptions] = useState([]);
    const [stock, setStock] = useState(0);
    const [items, setItems] = useState([]);
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        setItems(issue?.data ?? [])
    }, [issue, issueISSuccess]);

    useEffect(() => {
        if (items.length){
            setColumns([
                {
                    name: 'Product',
                    selector: row => row.product_title ? row.product_title + " - " + row.product_option_name : row?.product?.title + " - " + row?.variant?.option_value,
                    sortable: true,
                },
                {
                    name: 'Qty',
                    selector: row => <Quantity row={row} />,
                    sortable: true,
                },
                {
                    name: 'Receiver',
                    selector: row => row.receiver_name ?? row?.receiver?.name,
                    sortable: true,
                },
                {
                    name: 'Purpose',
                    selector: row => row.purpose,
                    sortable: true,
                },
                {
                    name: 'Uses Area',
                    selector: row => row.uses_area,
                    sortable: true,
                },
                {
                    name: 'Note',
                    selector: row => row.note,
                    sortable: true,
                },
                {
                    name: 'issue_time',
                    selector: row => row.issue_time,
                    sortable: true,
                }
            ]);
        }
    }, [items]);


    return (
        <>
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Issue a product.
                    </h2>
                }
            >
                <Head>
                    <title> Issue a product.</title>
                </Head>
                <div className="md:py-8 md:mx-16 mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="min-h-screen">
                        <div className="flex flex-row space-x-4 gap-4 border-b-2 shadow-lg p-4 rounded">
                            <NavLink
                                active={router.pathname === 'issue'}
                                href={`/issue`}
                            >
                                <Button>Back</Button>
                            </NavLink>
                        </div>
                        <div className={`flex flex-col justify-center justify-items-center items-center basis-2/4 w-full`}>
                            <DataTable
                                columns={columns}
                                data={items}
                            />
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    )
}
export default Edit;
