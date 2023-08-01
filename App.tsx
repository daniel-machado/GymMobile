import { StatusBar, View } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import OneSignal from 'react-native-onesignal';
import { useFonts, Roboto_400Regular, Roboto_700Bold} from '@expo-google-fonts/roboto';

import { Routes } from '@routes/index';

import { THEME } from './src/theme';
import { Loading } from '@components/loading';

OneSignal.setAppId('2593f5de-0ca2-40a9-839a-95ae97f7360a');

OneSignal.promptForPushNotificationsWithUserResponse(response => {
  console.log(response);
})

export default function App() {
  const  [fontLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  return (
    <NativeBaseProvider theme={THEME}>
      <StatusBar
        barStyle='light-content'
        backgroundColor='transparent'
        translucent
      />
      {fontLoaded ? <Routes/> : <Loading/>}
    </NativeBaseProvider>
  );
}
