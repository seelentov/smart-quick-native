import { NavigationScreenProps } from '../../Router';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { baseStyles } from '../../styles/base.styles';
import Header from '../../components/ui/Header/Header';
import { useContext, useEffect, useState } from 'react';
import { Appbar, Button, Divider, Text } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import theme from '@config/theme';
import Loading from '@components/ui/Loading/Loading';
import useBLE from '@hooks//useBLE';
import { DataContext } from '@components/providers/DataProvider';

type StandScreenProps = NavigationScreenProps<"Stand">;

const CHARACTERISTIC_UUID = "89e2b429-2cd9-44d3-a169-2ec392e1c6f8";

export default function StandScreen({ navigation, route }: StandScreenProps) {

    const { data } = useContext(DataContext);


    const stand =
        route?.params ||
        data[0] ||
        {
            id: "null",
            name: "null",
            deviceid: 1
        };

    const { requestPermissions, writeCharacteristicWithResponseForService, connectedDevice, scanAndConnect } = useBLE(stand.id, CHARACTERISTIC_UUID)

    const [intervalRange, setIntervalRange] = useState<number>(2)
    const [speedRange, setSpeedRange] = useState<number>(0)

    const [connectionStatus, setConnectionStatus] = useState("Поиск...");

    useEffect(() => {
        setConnectionStatus(stand.name)
        const searchDevice = async () => {
            const isRequestPermissions = await requestPermissions();

            if (isRequestPermissions) {
                setConnectionStatus("Поиск...")
                await scanAndConnect("Smart passer")
                    .then(() => {
                        setConnectionStatus(stand.name)
                    })
                    .catch(() => {
                        Alert.alert("Ошибка", "Тренажер не подключен")
                        setConnectionStatus("Ошибка")
                    })
            } else {
                Alert.alert("Ошибка", "Ошибка при получении разрешений устройства")
                setConnectionStatus("Ошибка")
            }
        }

        searchDevice()
    }, [stand])


    const handleSendCommand = (command: number, attribute: number = 0) => {
        const commandString = `${stand.deviceid}${command}${attribute}3e7f6c`

        attribute = command === 5 ? attribute - 2 : attribute

        writeCharacteristicWithResponseForService(String(commandString))
    }

    return (
        <View style={baseStyles.wrapper}>
            <Header title={connectionStatus} navigation={navigation} />
            <ScrollView style={baseStyles.scrollView}>
                {connectedDevice ?
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
                            <Button mode="contained" onPress={() => handleSendCommand(6)}>
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