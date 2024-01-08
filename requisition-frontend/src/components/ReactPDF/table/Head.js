import { View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    tableHead: {
        margin: "auto",
        flexDirection: "row",
        fontStyle: 'bold',
        justifyContent: 'space-between'
    }
});

export const Head = ({children}) => {
    return (
        <View style={styles.tableHead}>
            {children}
        </View>
    )
}
export default Head;
