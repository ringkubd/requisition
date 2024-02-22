import { Table, Pagination } from "flowbite-react";
import moment from "moment/moment";
import {
    getRunningQueriesThunk,
    productIssueLog,
    useProductIssueLogQuery
} from "@/store/service/product/product";
import { wrapper } from "@/store";
import { useState } from "react";

const IssueLog = ({id}) => {
    const [pageNo, setPageNo] = useState(1)
    const {data: issues, isLoading, isSuccess, isError} = useProductIssueLogQuery({id, page: pageNo}, {
        skip: !id
    });

    return (
        <div className={`w-full gap-2 space-x-4 shadow p-2 overflow-scroll`}>
            <h2
                className={`w-full border-b pb-2 font-bold`}>
                Issue History
            </h2>
            {
                !isLoading && !isError && issues ? (
                        <>
                            <Table className={`border border-gray-300 overflow-x-scroll`} border={1}>
                                <Table.Head>
                                    <Table.HeadCell
                                        className={`border border-gray-300`}>Sl#</Table.HeadCell>
                                    <Table.HeadCell className={`border border-gray-300`}>
                                        Variant
                                    </Table.HeadCell>
                                    <Table.HeadCell className={`border border-gray-300`}>
                                        Department
                                    </Table.HeadCell>
                                    <Table.HeadCell
                                        className={`border border-gray-300`}>Qty</Table.HeadCell>
                                    <Table.HeadCell className={`border border-gray-300`}>Avg. Unit
                                        Price</Table.HeadCell>
                                    {/*<Table.HeadCell className={`border border-gray-300`}>Available*/}
                                    {/*    Qty.</Table.HeadCell>*/}
                                    <Table.HeadCell
                                        className={`border border-gray-300`}>Total</Table.HeadCell>
                                    <Table.HeadCell className={`border border-gray-300`}>Use
                                        Date</Table.HeadCell>
                                    <Table.HeadCell className={`border border-gray-300`}>Issue @</Table.HeadCell>
                                    {/*<Table.HeadCell className={`border border-gray-300`}>Expiry*/}
                                    {/*    Date</Table.HeadCell>*/}
                                </Table.Head>
                                <Table.Body className={`border border-gray-300`}>
                                    {
                                        issues && issues?.data && (
                                            issues?.data?.map((iss, i) => (
                                                <Table.Row key={i} className={`border !p-0`}>
                                                    <Table.Cell className={`border !p-0 text-center`}>{i+1}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{iss?.variant_title}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{iss?.department}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{iss?.quantity}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{iss?.average_rate}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{iss?.total_price}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{moment(iss?.use_date).format("DD MMM Y")}</Table.Cell>
                                                    <Table.Cell className={`border !p-0 text-center`}>{iss?.created_at ? moment(iss?.created_at).format("DD MMM Y @ hh:mm") : ""}</Table.Cell>
                                                </Table.Row>
                                            ))
                                        )
                                    }
                                </Table.Body>
                            </Table>
                            <Pagination
                                currentPage={pageNo}
                                onPageChange={(page) => setPageNo(page)}
                                totalPages={Math.round(issues?.number_of_rows / 30)}
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
    store.dispatch(productIssueLog.initiate())
    await Promise.all(store.dispatch(getRunningQueriesThunk()));
    return {
        props: {},
    };
})

export default IssueLog;
