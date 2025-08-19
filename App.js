import * as React from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import ArticlesListScreen from './screens/Articles/ArticlesListScreen';
import Injury from './screens/Articles/Injury';
import Nutrition from './screens/Articles/Nutrition';
import Zone2 from './screens/Articles/Zone2';
import Settings from './screens/SettingsScreen';
import RunClub from './screens/RunClubScreen';
import ParkRun from './screens/ParkRunScreen';
import PinnedTrails from './screens/PinnedTrailsScreen';
import FriendSuggestionsScreen from './screens/FriendSuggestionsScreen';



const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Stack.Screen name="Articles" component={ArticlesListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ArticleInjury" component={Injury} options={{ headerShown: false }} />
          <Stack.Screen name="ArticleNutrition" component={Nutrition} options={{ headerShown: false }} />
          <Stack.Screen name="ArticleZone2" component={Zone2} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false}} />
          <Stack.Screen name="RunClub" component={RunClub} options={{ headerShown: false}} />
          <Stack.Screen name="ParkRun" component={ParkRun} options={{ headerShown: false}} />
          <Stack.Screen name="PinnedTrails" component={PinnedTrails} options={{ headerShown: false}} />
          <Stack.Screen name="Friends" component={FriendSuggestionsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
      </GestureHandlerRootView>
  );
}