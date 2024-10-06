import { NavigationScreenProps } from '../../Router';
import { Alert, ScrollView, View } from 'react-native';
import { baseStyles } from '../../styles/base.styles';
import Header from '../../components/ui/Header/Header';
import { useContext, useEffect, useState } from 'react';
import { baseData, DataContext } from '@components/providers/DataProvider';
import { Button, Divider, IconButton, List, TextInput } from 'react-native-paper';

type SettingsScreenProps = NavigationScreenProps<"Settings">;

export default function SettingsScreen({ navigation }: SettingsScreenProps) {

    const { data, setData } = useContext(DataContext);
    const [devicesForm, setDevicesForm] = useState<IStand[]>([]);

    useEffect(() => {
        setDevicesForm(data)
    }, [data])

    const handleSave = () => {
        setData(devicesForm);
        Alert.alert("OK", "Save stands list");
    };

    const handleChangeDevice = (index: number, updatedDevice: IStand) => {
        const updatedDevices = [...devicesForm];
        updatedDevices[index] = updatedDevice;
        setDevicesForm(updatedDevices);
    };

    const handleDeleteDevice = (index: number) => {
        const updatedDevices = [...devicesForm];
        updatedDevices.splice(index, 1);
        setDevicesForm(updatedDevices);
    };

    const handleAddDevice = () => {
        const newDevice: IStand = {
            id: (devicesForm.length + 1).toString(),
            name: 'Smart passer',
            deviceid: (devicesForm.length + 1)
        };

        setDevicesForm([...devicesForm, newDevice]);
    };

    return (
        <View style={baseStyles.wrapper}>
            <Header title={"Настройки"} navigation={navigation} />
            <ScrollView style={baseStyles.scrollView}>
                <List.Section style={{ gap: 10 }}>
                    {devicesForm.map((device, index) => (
                        <View key={device.id + device.deviceid}>
                            <View style={{ alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <TextInput
                                        label={"UUID"}
                                        style={{ flex: 1 }}
                                        value={device.id.toString()}
                                        onChangeText={(text) =>
                                            handleChangeDevice(index, { ...device, id: text })
                                        }
                                    />
                                    <IconButton
                                        icon="delete"
                                        onPress={() => handleDeleteDevice(index)}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <TextInput
                                        label={"Name"}

                                        style={{ flex: 1, marginRight: 10 }}
                                        value={device.name}
                                        onChangeText={(text) =>
                                            handleChangeDevice(index, { ...device, name: text })
                                        }
                                    />
                                    <TextInput
                                        label={"Device ID"}

                                        style={{ flex: 1 }}
                                        value={device.deviceid?.toString()}
                                        onChangeText={(text) =>
                                            handleChangeDevice(index, { ...device, deviceid: parseInt(text) })
                                        }
                                    />
                                </View>
                            </View>
                            {index !== devicesForm.length - 1 && <Divider />}
                        </View>
                    ))}
                    <Button mode="text" onPress={handleAddDevice}>
                        Добавить
                    </Button>
                </List.Section>
            </ScrollView>
            <View style={baseStyles.footer}>
                <Button mode="contained" onPress={handleSave}>
                    Сохранить
                </Button>

            </View>
        </View>
    );
}
