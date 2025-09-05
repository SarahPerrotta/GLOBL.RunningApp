import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

export default function OnboardingScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [avgKm, setAvgKm] = useState('');
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    if (!firstName.trim()) {
      Alert.alert('Missing name', 'Please enter your first name.');
      return;
    }

    try {
      setSaving(true);
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('No signed-in user');

      await setDoc(
        doc(db, 'users', uid),
        {
          firstName: firstName.trim(),
          age: age ? Number(age) : null,
          gender: gender || null,
          avgKmPerWeek: avgKm ? Number(avgKm) : null,
          profileComplete: true
        },
        { merge: true } 
      );

        // mark onboarding complete
        await AsyncStorage.setItem('hasOnboarded', 'true');
        // then reset to App so they land on GlobalHeatMap
        navigation.getParent()?.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });
        
        const rootNav = navigation.getParent?.() ?? navigation;
        rootNav.dispatch(
          CommonActions.reset({
           index: 0,
           routes: [{ name: 'App' }],
          })
        );
      } catch (e) {
        Alert.alert('Error', e?.message ?? String(e));
      } finally {
        setSaving(false);
      }
    };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#DE1E26' }}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={s.title}>Welcome to GLOBL.</Text>
        <Text style={s.sub}>Tell us a bit about you</Text>

        <TextInput label="First name *" value={firstName} onChangeText={setFirstName} style={s.in} mode="flat" />
        <TextInput label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" style={s.in} mode="flat" />
        <TextInput label="Gender (optional)" value={gender} onChangeText={setGender} style={s.in} mode="flat" />
        <TextInput label="Average km/week" value={avgKm} onChangeText={setAvgKm} keyboardType="decimal-pad" style={s.in} mode="flat" />

        <Button mode="contained" onPress={saveProfile} loading={saving} style={s.btn} labelStyle={{ color: '#fff', fontWeight: 'bold' }}>
          Save & continue
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap:{ padding:24 },
  title:{ fontSize:32, fontWeight:'700', color:'#fff', marginBottom:8 },
  sub:{ fontSize:16, color:'#fff', marginBottom:20 },
  in:{ backgroundColor:'#fff', marginBottom:12, borderRadius:10 },
  btn:{ backgroundColor:'#000', borderRadius:10, marginTop:8 }
});
