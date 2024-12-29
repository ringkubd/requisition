import { Text, View, StyleSheet } from '@react-pdf/renderer'
const styles = StyleSheet.create({
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    tableCell: {
        margin: 'auto',
        marginTop: 5,
        fontSize: 10,
        fontStyle: 'bold',
    },
})
export const Col = ({ value }) => {
    return (
        <View style={[...styles.tableCol]}>
            <Text style={styles.tableCell}>{value}</Text>
        </View>
    )
}
export default Col
