import { Alert, NativeModules, PermissionsAndroid, Platform, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Router from './src/Router';
import { DataProvider } from './src/components/providers/DataProvider';
import { PaperProvider } from 'react-native-paper';
import theme from './src/core/config/theme';

const { StatusBarManager } = NativeModules;

export default function App() {

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS !== 'android' ? StatusBarManager.HEIGHT : 0,
      }}>
        <NavigationContainer>
          <DataProvider>
            <Router />
          </DataProvider>
        </NavigationContainer>
      </SafeAreaView>
    </PaperProvider>
  );
}
