import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function CreateAccountScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCreateAccount = async () => {
    if (password.length < 8) return setError('Password must be 8 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate('Main');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
     <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>GLOBL.</Text>
      <Text style={styles.heading}>Create Account</Text>

    <Text style={styles.label}>Email</Text>
     <TextInput
       label="Email"
       value={email}
       onChangeText={setEmail}
       style={styles.input}
       mode="outlined"
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
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'center',
    marginTop: -10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'flex-start',
    marginTop: 80,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#000', // black background for create account button
    borderRadius: 30,
    paddingVertical: 8,
    alignSelf: 'center',
    width: '100%',
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff', // white text
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    marginTop: 16,
  },  
  error: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
});