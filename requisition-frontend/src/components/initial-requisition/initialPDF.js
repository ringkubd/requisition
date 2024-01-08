import React, { forwardRef, useEffect, useRef } from "react";
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import moment from "moment";
import Table from "@/components/ReactPDF/table";

const InitialPDF = forwardRef(({mainData, requisition_products}, ref) => {
    const styles = StyleSheet.create({
        headerContainer: {
            display: 'flex',
            flexDirection: 'row'
        },
        headerTitleLeft: {
            width: "100%",
            textAlign: 'left',
            fontStyle: 'bold'
        },
        headerTitleRight: {
            width: "100%",
            textAlign: 'left',
            fontStyle: 'bold'
        },
        h2: {
            fontStyle: 'italic',
            fontSize: 20,
            // lineHeight: '1.75rem',
            fontWeight: 'bold',
        }
    });
    return (
        <Document>
            <Page size="A4">
                <View style={styles.headerContainer}>
                    <View style={styles.headerTitleLeft}>
                        <Text style={styles.h2}>
                            IsDB-BISEW
                        </Text>
                    </View>
                    <View style={styles.headerTitleRight}>
                        <Text style={{fontStyle: 'italic', margin: 10, fontWeight: 'normal', fontSize: 10, textAlign: 'right'}}>Form: IsDB-BISEW/Forms/ED/IR-05</Text>
                    </View>
                </View>
                <View>
                    <Table>
                        <Table.Head>
                            <Table.HeadCell title={`SL`} width={`33%`}>SL</Table.HeadCell>
                            <Table.HeadCell title={`Product`} width={`33%`}>Product</Table.HeadCell>
                            <Table.HeadCell title={`Variant`} width={`33%`}>Variant</Table.HeadCell>
                        </Table.Head>
                    </Table>
                </View>
            </Page>
        </Document>
    )
})

export default InitialPDF;
