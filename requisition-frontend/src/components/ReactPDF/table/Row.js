import { View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    tableRow: {
        margin: "auto",
        flexDirection: "row"
    },
});

export const Row = ({children}) => {
    return (
        <View style={styles.tableRow}>
            {...children}
        </View>
    )
}
export default Row;
