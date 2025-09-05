import React, { useState } from 'react';
import { View, Image, SafeAreaView, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db} from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { CommonActions } from '@react-navigation/native';

export default function CreateAccountScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCreateAccount = async () => {
    setError('');
    if (password.length < 8) return setError('Password must be 8 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');

    try {
      // 1) Create the Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // 2) Seed their Firestore profile (one-time)
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: cred.user.email,
        firstName: null,
        age: null,
        gender: null,
        avgKmPerWeek: null,
        profileComplete: false,   
        createdAt: serverTimestamp()
      });
      
      //mark onboarding as NOT done for brand-new accounts 
      await AsyncStorage.setItem('hasOnboarded', 'false');

      const rootNav = navigation.getParent?.() ?? navigation;
      rootNav.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Onboard' }],  // this now always exists
        })
      );

    } catch (err) {
      console.log(err.code); // helpful for debugging in console
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Try signing in.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email format.');
          break;
        case 'auth/weak-password':
          setError('Password must be at least 8 characters.');
          break;
        default:
          setError(err.message);
      }
    }
  };

return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80} 
      >
         {/* Logo behind everything */}
        <Image
         source={require('../assets/BackgroundLogo.png')}
         style={styles.fadedLogo}
         resizeMode="contain"
        />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
        >
        <Text style={styles.logo}>GLOBL.</Text>
        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.label}>Email</Text>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Create a password</Text>
          <TextInput
           value={password} 
           onChangeText={setPassword} 
           secureTextEntry={!showPassword} 
           mode="outlined"
           style={styles.input}
           textContentType="oneTimeCode" // Prevent password autofill - I did this because firebase gave the user the option to use automated 'strong password'
           autoComplete="off" //  Disable browser-like autocomplete 
           right={
            <TextInput.Icon // click on 'eye' icon to choose visibility for show password section
             icon={showPassword ? 'eye' : 'eye-off'}
             onPress={() => setShowPassword(!showPassword)}
            />
          }
        />

      <Text style={styles.label}>Confirm password</Text>
      <TextInput
         label="Confirm password"
         value={confirmPassword}
         onChangeText={setConfirmPassword}
         secureTextEntry={!showConfirm}
         mode="outlined"
         style={styles.input}
         right={
          <TextInput.Icon // click on 'eye' icon to choose visibility for confirm password section
           icon={showConfirm ? 'eye' : 'eye-off'}
           onPress={() => setShowConfirm(!showConfirm)}
          />
        }
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      
     <Button //Ensure the Button uses both custom styles
       mode="contained" 
       onPress={handleCreateAccount} 
       style={styles.button} // applies black background, width, padding, etc.
       labelStyle={styles.buttonLabel} // applies white bold text
     >
       Create Account
    </Button>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
 );
} 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DE1E26',
    padding: 24,
  },
  logo: {
    fontSize: 42,
    fontWeight: '600', // 600 for all GLOBL. 
    color: '#fff',
    alignSelf: 'center',
    marginTop: 20,
  },
  heading: { //'create account'
    fontSize: 24,
    fontWeight: '500',
    color: '#fff',
    alignSelf: 'flex-start',
    marginTop: 100,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 50,
    paddingHorizontal: 12,
    width: '100%',
    maxWidth: 360,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#000', //black
    borderRadius: 30,
    paddingVertical: 8,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 360, // like SignInScreen’s width limit
  },
  buttonLabel: {
    fontWeight: '500',
    fontSize: 16,
    color: '#fff', // white text
  },
  label: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 6,
    marginTop: 16,
  },  
  error: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  fadedLogo: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    width: 350,
    height: 350,
    zIndex: -1, // pushes it behind content
  },
  
});