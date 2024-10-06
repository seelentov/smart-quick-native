/* eslint-disable no-bitwise */
import { useMemo, useState } from "react";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import {
    BleError,
    BleManager,
    Characteristic,
    Device,
} from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

import base64 from "react-native-base64";
import { btoa } from "react-native-quick-base64";
interface BluetoothLowEnergyApi {
    requestPermissions(): Promise<boolean>;
    scanForPeripherals(): void;
    connectToDevice: (deviceId: Device) => Promise<void>;
    disconnectFromDevice: () => void;
    connectedDevice: Device | null;
    allDevices: Device[];
    heartRate: number;
    writeCharacteristicWithResponseForService: (value: string) => void;
    scanAndConnect: (name: string) => Promise<void>;
    scanAndConnectByService: () => Promise<void>
}

function useBLE(SERVICE_UUID: string, CHARACTERISTIC: string): BluetoothLowEnergyApi {
    const bleManager = useMemo(() => new BleManager(), []);
    const [allDevices, setAllDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [heartRate, setHeartRate] = useState<number>(0);

    const requestAndroid31Permissions = async () => {
        const bluetoothScanPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
                title: "Location Permission",
                message: "Bluetooth Low Energy requires Location",
                buttonPositive: "OK",
            }
        );
        const bluetoothConnectPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
                title: "Location Permission",
                message: "Bluetooth Low Energy requires Location",
                buttonPositive: "OK",
            }
        );
        const fineLocationPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Location Permission",
                message: "Bluetooth Low Energy requires Location",
                buttonPositive: "OK",
            }
        );

        return (
            bluetoothScanPermission === "granted" &&
            bluetoothConnectPermission === "granted" &&
            fineLocationPermission === "granted"
        );
    };

    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "Bluetooth Low Energy requires Location",
                        buttonPositive: "OK",
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const isAndroid31PermissionsGranted =
                    await requestAndroid31Permissions();

                return isAndroid31PermissionsGranted;
            }
        } else {
            return true;
        }
    };

    const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
        devices.findIndex((device) => nextDevice.id === device.id) > -1;

    const scanForPeripherals = () =>
        bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                Alert.alert("scanForPeripherals__ERR", JSON.stringify(error));
            }
            if (device) {
                setAllDevices((prevState: Device[]) => {
                    if (!isDuplicteDevice(prevState, device)) {
                        return [...prevState, device];
                    }
                    return prevState;
                });
            }
        });

    const scanAndConnect = async (name: string) =>
        bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                Alert.alert("scanAndConnect__ERR", JSON.stringify(error));
            }
            if (device && name && device.name === name) {
                bleManager.stopDeviceScan();
                connectToDevice(device)
            }
            else {
                Alert.alert("scanAndConnect__ERR", `Not find ${name}`);
            }
        });
    const scanAndConnectByService = async () =>
        bleManager.startDeviceScan([SERVICE_UUID], null, (error, device) => {
            if (error) {
                Alert.alert("scanAndConnectByService__ERR", JSON.stringify(error));
            }
            if (device) {
                bleManager.stopDeviceScan();
                connectToDevice(device)
            }
            else {
                Alert.alert("scanAndConnectByService__ERR", `Not find ${SERVICE_UUID}`);
            }
        });

    const connectToDevice = async (device: Device) => {
        try {
            const deviceConnection = await bleManager.connectToDevice(device.id);
            const check = await deviceConnection.discoverAllServicesAndCharacteristics();
            setConnectedDevice(check);
            bleManager.stopDeviceScan();
            startStreamingData(deviceConnection);
        } catch (e) {
            Alert.alert("FAILED TO CONNECT", JSON.stringify(e));
        }
    };

    const disconnectFromDevice = () => {
        if (connectedDevice) {
            bleManager.cancelDeviceConnection(connectedDevice.id);
            setConnectedDevice(null);
            setHeartRate(0);
        }
    };

    const onHeartRateUpdate = (
        error: BleError | null,
        characteristic: Characteristic | null
    ) => {
        if (error) {
            return -1;
        } else if (!characteristic?.value) {
            return -1;
        }

        const rawData = base64.decode(characteristic.value);
        let innerHeartRate: number = -1;

        const firstBitValue: number = Number(rawData) & 0x01;

        if (firstBitValue === 0) {
            innerHeartRate = rawData[1].charCodeAt(0);
        } else {
            innerHeartRate =
                Number(rawData[1].charCodeAt(0) << 8) +
                Number(rawData[2].charCodeAt(2));
        }

        setHeartRate(innerHeartRate);
    };

    const startStreamingData = async (device: Device) => {
        if (device) {
            device.monitorCharacteristicForService(
                SERVICE_UUID,
                CHARACTERISTIC,
                onHeartRateUpdate
            );
        } else {
            Alert.alert("startStreamingData__ERR", "No Device Connected");
        }
    };

    const writeCharacteristicWithResponseForService = (value: string) => {
        if (connectedDevice) {
            connectedDevice.writeCharacteristicWithResponseForService(
                SERVICE_UUID,
                CHARACTERISTIC,
                btoa(value)
            ).catch((e) => {
                Alert.alert("writeCharacteristicWithResponseForService__ERR", JSON.stringify(e));
            })
        }
        else {
            Alert.alert("writeCharacteristicWithResponseForService__ERR", "No Device Connected");
        }
    }

    return {
        scanForPeripherals,
        requestPermissions,
        connectToDevice,
        allDevices,
        connectedDevice,
        disconnectFromDevice,
        heartRate,
        writeCharacteristicWithResponseForService,
        scanAndConnect,
        scanAndConnectByService
    };
}

export default useBLE;