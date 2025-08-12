import * as React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LandingScreen from './screens/LandingScreen';
import SignInScreen from './screens/SignInScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import GlobalHeatMapScreen from './screens/MainGlobalHeatMapScreen';
import UserLocationMap from './screens/UserLocationMapScreen';
import LeaderBoardScreen from './screens/BadgesScreen';
import NavigationScreen from './screens/NavigationScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Landing">
          <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="CreateAccount" component={CreateAccountScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Main" component={GlobalHeatMapScreen} options={{ headerShown: false }} /> 
          <Stack.Screen name="CurrentLocation" component={UserLocationMap} options={{ headerShown: false }}/>
          <Stack.Screen name="LeaderBoard" component={LeaderBoardScreen} options={{ headerShown: false}} />
          <Stack.Screen name="NavigationHub" component={NavigationScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}