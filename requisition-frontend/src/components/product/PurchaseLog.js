import { Table, Pagination } from "flowbite-react";
import moment from "moment/moment";
import {
    getRunningQueriesThunk,
    productPurchaseLog,
    useProductPurchaseLogQuery
} from "@/store/service/product/product";
import { wrapper } from "@/store";
import { useState } from "react";

const PurchaseLog = ({id}) => {
    const [pageNo, setPageNo] = useState(1)
    const {data: purchase, isLoading, isSuccess, isError} = useProductPurchaseLogQuery({id, page: pageNo}, {
        skip: !id
    });

    return (
        <div className={`w-full gap-2 space-x-4 shadow p-2 overflow-scroll`}>
            {
                !isLoading && !isError && purchase ? (
                        <>
                            <Table className={`border border-gray-300 overflow-x-scroll`} border={1}>
                                <Table.Head>
                                        <Table.HeadCell
                                            className={`border border-gray-300`}>Sl#</Table.HeadCell>
                                        <Table.HeadCell
                                            className={`border border-gray-300`}>Variant</Table.HeadCell>
                                        <Table.HeadCell
                                            className={`border border-gray-300`}>Origin</Table.HeadCell>
                                        <Table.HeadCell
                                            className={`border border-gray-300`}>Supplier</Table.HeadCell>
                                        <Table.HeadCell
                                            className={`border border-gray-300`}>Requisition</Table.HeadCell>
                                        <Table.HeadCell
                                            className={`border border-gray-300`}>Chalan</Table.HeadCell>
                                        <Table.HeadCell
                                            className={`border border-gray-300`}>Qty</Table.HeadCell>
                                        <Table.HeadCell className={`border border-gray-300`}>Unit Price
                                        </Table.HeadCell>
                                        <Table.HeadCell className={`border border-gray-300`}>Available Qty.</Table.HeadCell>
                                        <Table.HeadCell
                                            className={`border border-gray-300`}>Total</Table.HeadCell>
                                        <Table.HeadCell
                                            className={`border border-gray-300`}>Stock Value</Table.HeadCell>
                                        <Table.HeadCell className={`border border-gray-300`}>Purchase
                                            Date</Table.HeadCell>
                                        <Table.HeadCell className={`border border-gray-300`}>Expiry Date
                                        </Table.HeadCell>
                                </Table.Head>
                                <Table.Body  className={`border border-gray-300`}>
                                    {
                                        purchase && purchase?.data && (
                                            purchase?.data?.map((p,i) => (
                                                <Table.Row key={i}>
                                                    <Table.Cell className={`border !p-0 text-center`}>{i+1}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{p.variant}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{p.origin}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{p.supplier_name}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{p.prf_no}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{p.chalan_no}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{p.qty}{p.unit}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{p.unit_price}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{p.available_qty}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{p.total_price}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{parseFloat(parseFloat(p.available_qty) * (parseFloat(p.unit_price))).toFixed() }</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{moment(p?.purchase_date).format("DD MMM Y")}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{p?.expiry_date ? moment(p?.expiry_date).format("DD MMM Y") : ''}</Table.Cell>
                                                </Table.Row>
                                            ))
                                        )
                                    }
                                </Table.Body>
                            </Table>
                            <Pagination
                                currentPage={pageNo}
                                onPageChange={(page) => setPageNo(page)}
                                totalPages={Math.ceil(purchase?.number_of_rows / 15)}
                            />
                        </>
                    )
                    : <h2>No data found.</h2>
            }
        </div>
    )
}

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
    // const params = context.params
    store.dispatch(productPurchaseLog.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default PurchaseLog;
