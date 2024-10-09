import { createNativeStackNavigator, NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import theme from './core/config/theme';
import SettingsScreen from './core/types/SettingsScreen';
import StandScreen from './screens/Stand/StandScreen';

export type RootStackParamList = {
    Settings: undefined;
    Stand: IStand | undefined;
};

export type NavigationScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type INavigation = NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList, undefined>

const defaultOptions = {
    title: 'Smart Quick',
    headerShown: false,
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Router() {

    return (
        <>
            <Stack.Navigator>
                <Stack.Screen
                    name="Stand"
                    component={StandScreen}
                    options={defaultOptions}
                />
                <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={defaultOptions}
                />

            </Stack.Navigator>
            <StatusBar
                animated={false}
                backgroundColor={theme.text}
            />
        </>
    );
}
