import { Text, View, StyleSheet } from '@react-pdf/renderer'
const styles = StyleSheet.create({
    tableCol: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#bbbb',
    },
    tableCell: {
        margin: 'auto',
        marginTop: 5,
        fontSize: 10,
        fontStyle: 'bold',
    },
})
export const HeadCell = ({ title, width = '100%' }) => {
    return (
        <View style={[styles.tableCol, { width }]}>
            <Text style={styles.tableCell}>{title}</Text>
        </View>
    )
}
export default HeadCell
