import { NavigationScreenProps } from '../../Router';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { baseStyles } from '../../styles/base.styles';
import Header from '../../components/ui/Header/Header';
import { useEffect, useState } from 'react';
import { Button, Divider, Text } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import theme from '@config/theme';
import Loading from '@components/ui/Loading/Loading';
import useBLE from '@hooks//useBLE';
import { baseData } from '@components/providers/DataProvider';

type StandScreenProps = NavigationScreenProps<"Stand">;

const CHARACTERISTIC_UUID = "89e2b429-2cd9-44d3-a169-2ec392e1c6f8";

export default function StandScreen({ navigation, route }: StandScreenProps) {

    const [stand, setStand] = useState<IStand>(baseData[1])

    useEffect(() => {
        if (route?.params && JSON.stringify(route.params) !== JSON.stringify(stand)) {
            setStand(route.params);
        }
    }, [route, stand]);


    const { requestPermissions, writeCharacteristicWithResponseForService, connectedDevice, scanForNameToDeviceTemp, disconnectFromDevice, deviceTemp, scanAndConnectByService } = useBLE(stand.id, CHARACTERISTIC_UUID)

    const [intervalRange, setIntervalRange] = useState<number>(2)
    const [speedRange, setSpeedRange] = useState<number>(0)



    useEffect(() => {
        const searchDevice = async () => {
            const isRequestPermissions = await requestPermissions();

            if (isRequestPermissions) {
                scanAndConnectByService()
            } else {
                Alert.alert("Ошибка", "Ошибка при получении разрешений устройства")
            }
        }

        searchDevice()
    }, [stand])


    const handleSendCommand = (command: number, attribute: number = 0) => {

        attribute = command === 5 ? attribute - 2 : attribute

        const commandString = `${stand?.deviceid}${command}${attribute}3e7f6c`

        if (connectedDevice) {
            writeCharacteristicWithResponseForService(connectedDevice, String(commandString), stand.id)
        }
    }

    return (
        <View style={baseStyles.wrapper}>
            <Header title={stand.name} navigation={navigation} />
            <ScrollView style={baseStyles.scrollView}>
                {
                    connectedDevice
                        ?
                        <>
                            <View style={styles.container}>
                                <Text style={styles.text}>Моторы выброса</Text>
                                <View style={styles.row}>
                                    <Button mode="contained" onPress={() => handleSendCommand(2)}>
                                        Запустить
                                    </Button>
                                    <Button mode="contained" onPress={() => handleSendCommand(4)}>
                                        Остановить
                                    </Button>
                                </View>
                            </View>
                            <Divider />
                            <View style={styles.container}>
                                <Text style={styles.text}>Скорость: {speedRange}</Text>
                                <Slider
                                    style={{ height: 40 }}
                                    minimumValue={0}
                                    maximumValue={7}
                                    minimumTrackTintColor={theme.colors.primary}
                                    maximumTrackTintColor="#000000"
                                    thumbTintColor={theme.colors.primary}
                                    onValueChange={setSpeedRange}
                                    value={speedRange}
                                    step={1}
                                />
                                <Button mode="contained" onPress={() => handleSendCommand(1, speedRange)}>
                                    Установить скорость
                                </Button>
                            </View>
                            <Divider />
                            <View style={styles.container}>
                                <Text style={styles.text}>Запуск с интервалом: {intervalRange} сек</Text>
                                <Slider
                                    style={{ height: 40 }}
                                    minimumValue={2}
                                    maximumValue={10}
                                    minimumTrackTintColor={theme.colors.primary}
                                    maximumTrackTintColor="#000000"
                                    thumbTintColor={theme.colors.primary}
                                    onValueChange={setIntervalRange}
                                    value={intervalRange}
                                    step={1}
                                />
                                <Button mode="contained" onPress={() => handleSendCommand(5, intervalRange)}>
                                    Запустить
                                </Button>
                                <Button mode="contained" onPress={() => handleSendCommand(6)}>
                                    Остановить
                                </Button>
                            </View>
                            <Divider />
                            <View style={styles.container}>
                                <Button mode="contained" onPress={() => handleSendCommand(3)}>
                                    Одиночный выброс
                                </Button>
                            </View>
                            <Divider />
                            <View style={styles.container}>
                                <Button mode="contained" onPress={() => handleSendCommand(8)}>
                                    Светодиод
                                </Button>
                            </View>

                        </> :
                        <Loading minimal />}
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        gap: 10,
        padding: 20
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    text: {
        fontSize: 16,
        fontWeight: 500,
        textAlign: 'center'
    }
})