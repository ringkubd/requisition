import { forwardRef } from "react";
import { Table } from "flowbite-react";
import moment from "moment";

const IssueReport = forwardRef(({data}, ref) => {

    return (
        <div
            className={`flex flex-col m-2 justify-center justify-items-center p-4 shadow-none`}
            ref={ref}>
            <Table className={`w-full border-2`}>
                <Table.Head className={`border-2`}>
                    <Table.HeadCell className={`border-2`}>SL#</Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>
                        Category
                    </Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>Item</Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>Variant</Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>
                        Issue Date
                    </Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>
                        Issuer
                    </Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>
                        Department
                    </Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>Qty.</Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>
                        Avg. Rate
                    </Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>Sum</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                    {data &&
                        Object.keys(data)?.map((d, i) => (
                            <>
                                {data[d].map((item, j) => (
                                    <Table.Row
                                        className={`border-2`}
                                        key={j}>
                                        {
                                            j === 0 ? (
                                                <>
                                                    <Table.Cell
                                                        className={`border-2`}
                                                        rowSpan={data[d].length}>
                                                        {i + 1}
                                                    </Table.Cell>
                                                    <Table.Cell
                                                        className={`border-2`}
                                                        rowSpan={data[d].length}>
                                                        {d}
                                                    </Table.Cell>
                                                </>
                                            ) : null
                                        }
                                        <Table.Cell className={`border-2`}>
                                            {item.product.title}
                                        </Table.Cell>
                                        <Table.Cell>{item.variant.option_value}</Table.Cell>
                                        <Table.Cell
                                            className={`border-2`}>{moment(item.issue_time).format('DD MMM Y')}</Table.Cell>
                                        <Table.Cell
                                            className={`border-2`}>{item.issuer.name}</Table.Cell>
                                        <Table.Cell
                                            className={`border-2`}>{item.issuer_department?.name}</Table.Cell>
                                        <Table.Cell
                                            className={`border-2`}>{item.quantity}</Table.Cell>
                                        <Table.Cell
                                            className={`border-2`}>{item.average_rate}</Table.Cell>
                                        <Table.Cell
                                            className={`border-2`}>{item.total_price}</Table.Cell>
                                    </Table.Row>
                                ))}
                            </>
                        ))}
                </Table.Body>
            </Table>
        </div>
    )
});

export default IssueReport;
