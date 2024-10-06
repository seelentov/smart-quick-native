import { Dimensions, StyleSheet } from 'react-native';

const { height } = Dimensions.get('window');
const headerHeight = 50
const footerHeight = 50

export const baseStyles = StyleSheet.create({
    wrapper: {
        height: height + 30,
    },
    container: {
        marginVertical: 30
    },
    header: {
        height: headerHeight,
    },
    scrollView: {
        height: height - (headerHeight + footerHeight) + 30,
    },
    footer: {
        display: 'flex',
        gap: 10,
        height: footerHeight,
        backgroundColor: 'white',
    },
    vertContainer: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    center: {
        display: 'flex',
        justifyContent: 'center',
        overflow: 'scroll',
        height: '100%'
    }
});
