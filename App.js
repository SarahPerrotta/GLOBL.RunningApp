import * as React from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { IncognitoProvider } from './components/IncognitoContext';
import Toast from 'react-native-toast-message';
import RootNavigator from './stacks/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <IncognitoProvider>  
        <NavigationContainer>
            <RootNavigator />
         </NavigationContainer>
         <Toast />
      </IncognitoProvider>  
    </GestureHandlerRootView>
  );
}