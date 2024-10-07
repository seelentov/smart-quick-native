/* eslint-disable no-bitwise */
import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
    BleManager,
    Device,
} from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

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
                console.log("scanForPeripherals__ERR", JSON.stringify(error));
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

    const scanAndConnect = async (name: string) => {

        if (connectedDevice && connectedDevice.name === name) {
            return
        }

        bleManager.startDeviceScan(null, null, async (error, device) => {
            if (error) {
                console.log("scanForPeripherals__ERR", JSON.stringify(error));
            }
            if (device && device.name === name) {
                connectToDevice(device)
                bleManager.stopDeviceScan();
            }
        });
    }

    const connectToDevice = async (device: Device) => {
        try {
            if (connectedDevice) {
                disconnectFromDevice()
            }

            const deviceConnection = await bleManager.connectToDevice(device.id);
            const check = await deviceConnection.discoverAllServicesAndCharacteristics();
            setConnectedDevice(check);
            bleManager.stopDeviceScan();
        } catch (e) {
            console.log("FAILED TO CONNECT", JSON.stringify(e));
        }
    };

    const disconnectFromDevice = () => {
        if (connectedDevice) {
            bleManager.cancelDeviceConnection(connectedDevice.id);
            setConnectedDevice(null);
            setHeartRate(0);
        }
    };

    const writeCharacteristicWithResponseForService = (value: string) => {
        if (connectedDevice) {
            connectedDevice.writeCharacteristicWithResponseForService(
                SERVICE_UUID,
                CHARACTERISTIC,
                btoa(value)
            ).catch((e) => {
                console.log("writeCharacteristicWithResponseForService__ERR", JSON.stringify(e));
            })
        }
        else {
            console.log("writeCharacteristicWithResponseForService__ERR", "No Device Connected");
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
        scanAndConnect
    };
}

export default useBLE;