import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

import AuthStack from './stacks/AuthStack';
import AppStack from './stacks/AppStack';
import OnboardStack from './stacks/OnboardStack';

export default function AppEntry() {
  const [state, setState] = useState({ loading: true, user: null, needsOnboarding: false });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return setState({ loading: false, user: null, needsOnboarding: false });
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        const needs = !snap.exists() || snap.data()?.profileComplete !== true;
        setState({ loading: false, user: u, needsOnboarding: needs });
      } catch {
        setState({ loading: false, user: u, needsOnboarding: true });
      }
    });
    return unsub;
  }, []);

  if (state.loading) return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#fff' }}>
      <ActivityIndicator />
    </View>
  );

  if (!state.user) return <AuthStack />;              // Landing → SignIn → SignUp
  if (state.needsOnboarding) return <OnboardStack />; // one-time preview form
  return <AppStack />;                                // main app (heatmap, etc.)
}

 
