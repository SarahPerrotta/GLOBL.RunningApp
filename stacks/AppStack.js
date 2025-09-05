import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GlobalHeatMapScreen from '../screens/MainGlobalHeatMapScreen';
import ProfileScreen from '../screens/ProfileScreen'; 
import LeaderBoardScreen from '../screens/BadgesScreen';
import NavigationScreen from '../screens/NavigationScreen';
import ArticlesListScreen from '../screens/Articles/ArticlesListScreen';
import Injury from '../screens/Articles/Injury';
import Nutrition from '../screens/Articles/Nutrition';
import Zone2 from '../screens/Articles/Zone2';
import Settings from '../screens/SettingsScreen';
import RunClub from '../screens/RunClubScreen';
import ParkRun from '../screens/ParkRunScreen';
import PinnedTrails from '../screens/PinnedTrailsScreen';
import FriendSuggestionsScreen from '../screens/FriendSuggestionsScreen';
import UserLocationMapScreen from '../screens/UserLocationMapScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="GlobalHeatMap" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GlobalHeatMap" component={GlobalHeatMapScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="LeaderBoard" component={LeaderBoardScreen} />
      <Stack.Screen name="CurrentLocation" component={UserLocationMapScreen}/>

      {/*Articles */}
      <Stack.Screen name="NavigationHub" component={NavigationScreen} />
      <Stack.Screen name="Articles" component={ArticlesListScreen} />
      <Stack.Screen name="ArticleInjury" component={Injury} />
      <Stack.Screen name="ArticleNutrition" component={Nutrition} />
      <Stack.Screen name="ArticleZone2" component={Zone2} />
      
      {/*Settings and misc*/}
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="RunClub" component={RunClub} />
      <Stack.Screen name="ParkRun" component={ParkRun} />
      <Stack.Screen name="PinnedTrails" component={PinnedTrails} />
      <Stack.Screen name="Friends" component={FriendSuggestionsScreen} />
    </Stack.Navigator>
  );
}