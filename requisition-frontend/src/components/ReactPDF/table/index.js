import { View, StyleSheet } from "@react-pdf/renderer";
import Col from "./Col";
import Head from "./Head";
import HeadCell from "./HeadCell";
import Row from "./Row";

const styles = StyleSheet.create({
    table: {
        display: "table",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0
    }
});
const TableComponent = ({children}) => {
    return (
        <View style={styles.table}>
            {children}
        </View>
    )
}

export const Table = Object.assign(TableComponent, {
    Col,
    Head,
    HeadCell,
    Row
});
export default Table;
