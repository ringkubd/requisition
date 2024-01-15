import { forwardRef } from "react";
import { Table } from "flowbite-react";

const IssueReport = forwardRef(({data}, ref) => {
    console.log(data)
    return (
        <div
            className={`flex flex-col m-2 justify-center justify-items-center p-4 shadow-none`}
            ref={ref}>
            <Table className={`w-full border-2`}>
                <Table.Head className={`border-2`}>
                    <Table.HeadCell className={`border-2`}>SL#</Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>Category</Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>Item</Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>Issue Date</Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>Issuer</Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>Department</Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>Qty.</Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>Avg. Rate</Table.HeadCell>
                    <Table.HeadCell className={`border-2`}>Sum</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                    {
                        data && Object.keys(data)?.map((d, i) => (
                            <>
                                <Table.Row className={`border-2`} key={i}>
                                    <Table.Cell className={`border-2`} rowSpan={data[d].length}>{i+1}</Table.Cell>
                                    <Table.Cell className={`border-2`} rowSpan={data[d].length}>{d}</Table.Cell>
                                    <Table.Cell className={`border-2`}></Table.Cell>
                                    <Table.Cell className={`border-2`}></Table.Cell>
                                    <Table.Cell className={`border-2`}></Table.Cell>
                                    <Table.Cell className={`border-2`}></Table.Cell>
                                    <Table.Cell className={`border-2`}></Table.Cell>
                                    <Table.Cell className={`border-2`}></Table.Cell>
                                    <Table.Cell className={`border-2`}></Table.Cell>
                                </Table.Row>
                                {
                                    data[d].map((item, i) => (
                                        <Table.Row className={`border-2`} key={i * 99}>
                                            <Table.Cell className={`border-2`}>{item.product.title}</Table.Cell>
                                            <Table.Cell className={`border-2`}></Table.Cell>
                                            <Table.Cell className={`border-2`}></Table.Cell>
                                            <Table.Cell className={`border-2`}></Table.Cell>
                                            <Table.Cell className={`border-2`}></Table.Cell>
                                            <Table.Cell className={`border-2`}></Table.Cell>
                                            <Table.Cell className={`border-2`}></Table.Cell>
                                        </Table.Row>
                                    ))
                                }
                            </>
                        ))
                    }

                </Table.Body>
            </Table>
        </div>
    )
});

export default IssueReport;
