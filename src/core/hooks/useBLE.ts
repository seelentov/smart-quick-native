/* eslint-disable no-bitwise */
import { useEffect, useMemo, useState } from "react";
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
    disconnectFromDevice: () => Promise<void>;
    connectedDevice: Device | null;
    allDevices: Device[];
    deviceTemp: Device[];
    writeCharacteristicWithResponseForService: (device: Device, value: string, serviceUUID: string) => void;
    scanAndConnect: (name: string) => Promise<void>;
    scanForNameToDeviceTemp: (name: string) => void;
    scanAndConnectByService: () => void
}

function useBLE(SERVICE_UUID: string, CHARACTERISTIC: string): BluetoothLowEnergyApi {
    const bleManager = useMemo(() => new BleManager(), []);
    const [allDevices, setAllDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [deviceTemp, setDeviceTemp] = useState<Device[]>([]);

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
        bleManager.startDeviceScan(null, null, async (error, device) => {
            if (error) {
                console.log("scanForPeripherals__ERR", JSON.stringify(error));
            }
            if (device) {
                const services = await bleManager.servicesForDevice(device.id)
                device.serviceUUIDs = services.map(s => s.uuid)
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


    const scanAndConnectByService = () => {
        bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.log("scanForPeripherals__ERR", JSON.stringify(error));
            }

            if (device && device.serviceUUIDs?.includes(SERVICE_UUID)) {
                connectToDevice(device)
                bleManager.stopDeviceScan();
            }
        });
    }

    const scanForNameToDeviceTemp = (name: string) => {
        bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.log("scanForPeripherals__ERR", JSON.stringify(error));
            }
            if (device && device.name === name) {
                setDeviceTemp((prevState: Device[]) => {
                    if (!isDuplicteDevice(prevState, device)) {
                        return [...prevState, device];
                    }
                    return prevState;
                });
            }
        });
    }

    const connectToDevice = async (device: Device) => {
        try {
            if (connectedDevice) {
                await disconnectFromDevice()
            }

            if (!(await bleManager.isDeviceConnected(device.id))) {
                const deviceConnection = await bleManager.connectToDevice(device.id);
                const check = await deviceConnection.discoverAllServicesAndCharacteristics();
                setConnectedDevice(check);
            }

            setConnectedDevice(device);
            bleManager.stopDeviceScan();
        } catch (e) {
            console.log("FAILED TO CONNECT", JSON.stringify(e));
        }
    };

    const disconnectFromDevice = async () => {
        if (connectedDevice) {
            bleManager.cancelDeviceConnection(connectedDevice.id);
            setConnectedDevice(null);
        }
    };

    const writeCharacteristicWithResponseForService = async (device: Device, value: string, serviceUUID: string) => {
        try {
            const discoveredDevice = await device.discoverAllServicesAndCharacteristics();

            const services = await discoveredDevice.services();

            const neededService = services.find(s => s.uuid === serviceUUID)

            if (!neededService) {
                console.log(`Service with UUID ${serviceUUID} not found`);
                return;
            }

            const characteristics = (await neededService.characteristics());

            const neededChar = characteristics.find(c => c.uuid === CHARACTERISTIC)

            if (!neededChar) {
                console.log(`Characteristic with UUID ${CHARACTERISTIC} not found in service`);
                return;
            }

            const charValue = btoa(value)

            try {
                await neededChar.writeWithoutResponse(charValue);
                return
            }
            catch (e) {
                console.log(`writeCharacteristicWithResponseForService__ERR2: ${JSON.stringify(e)}`);

            }

            try {
                await neededChar.writeWithResponse(charValue);
                return
            }
            catch (e) {
                console.log(`writeCharacteristicWithResponseForService__ERR3: ${JSON.stringify(e)}`);
            }

            try {
                await discoveredDevice.writeCharacteristicWithoutResponseForService(
                    serviceUUID,
                    CHARACTERISTIC,
                    charValue
                )
                return
            }
            catch (e) {
                console.log(`writeCharacteristicWithResponseForService__ERR4: ${JSON.stringify(e)}`);
            }

            try {
                await discoveredDevice.writeCharacteristicWithResponseForService(
                    serviceUUID,
                    CHARACTERISTIC,
                    charValue
                )
                return
            }
            catch (e) {
                console.log(`writeCharacteristicWithResponseForService__ERR1: ${JSON.stringify(e)}`);
            }

        } catch (error) {
            console.log(`writeCharacteristicWithResponseForService__ERR: ${JSON.stringify(error)}`);
        }
    };



    return {
        scanForPeripherals,
        requestPermissions,
        connectToDevice,
        allDevices,
        connectedDevice,
        disconnectFromDevice,
        writeCharacteristicWithResponseForService,
        scanAndConnect,
        scanForNameToDeviceTemp,
        deviceTemp, scanAndConnectByService
    };
}

export default useBLE;