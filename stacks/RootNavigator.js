import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

import OnboardStack from './OnboardStack';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

const RootStack = createNativeStackNavigator();

export default function RootNavigator() {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboarded(flag === 'true');
      } finally {
        unsub = onAuthStateChanged(auth, (user) => {
          setAuthed(!!user);
          setBootstrapped(true);
        });
      }
    })();
    return () => unsub();
  }, []);

  if (!bootstrapped) return null;
  
 // Decide starting route (but keep all routes mounted)
 const initialRoute = authed
 ? (hasOnboarded ? 'App' : 'Onboard')
 : 'Auth';

return (
 <RootStack.Navigator
   screenOptions={{ headerShown: false }}
   key={`root-${initialRoute}`}              // forces remount when the start changes
   initialRouteName={initialRoute}
 >
   <RootStack.Screen name="Onboard" component={OnboardStack} />
   <RootStack.Screen name="Auth" component={AuthStack} />
   <RootStack.Screen name="App" component={AppStack} />
 </RootStack.Navigator>
);
}
