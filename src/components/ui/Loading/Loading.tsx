import { ActivityIndicator } from "react-native-paper"
import { Colors } from "react-native/Libraries/NewAppScreen"
import { baseStyles } from "../../../styles/base.styles"
import { StyleSheet, View } from "react-native"


export default function Loading({ minimal = false }: { minimal?: boolean }) {
    return (
        <View style={!minimal && baseStyles.center}>
            <View style={styles.container}>
                <ActivityIndicator animating={true} color={Colors.blue500} size="large" />
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        height: 300,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
})