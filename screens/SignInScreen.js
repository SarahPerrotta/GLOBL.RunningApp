import React, { useState } from 'react';
import { View, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.navigate('Main');
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    setError('Password reset email sent!');
  } catch (err) {
    console.log(err.code);
    switch (err.code) {
      case 'auth/user-not-found':
        setError('No account found for this email.');
        break;
      case 'auth/invalid-email':
        setError('Enter a valid email address.');
        break;
      default:
        setError(err.message);
    }
  }
};

  return (
    <SafeAreaView style={styles.wrapper}> 
    {/* Wrapping Background logo */}
    <Image
      source={require('../assets/BackgroundLogo.png')}
      style={styles.fadedLogo}
      resizeMode="contain"
    />
     {/* GLOBL. title at the top center */}
  <View style={styles.header}>
    <Text style={styles.title}>GLOBL.</Text>
  </View>
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.subtitle}>Sign In</Text>

      <TextInput 
       label="Email address" 
       value={email} 
       onChangeText={setEmail} 
       mode="flat"
       style={styles.input}
       underlineColor="transparent"
       theme={{ colors: { primary: '#000', background: '#fff' } } }
       right={
         email ? (
          <TextInput.Icon icon="check-circle" color="#004d40" /> 
         ): null
       }
    />

    <TextInput 
       label="Password" 
       value={password} 
       onChangeText={setPassword} 
       secureTextEntry= {!showPassword}
       style={styles.input} 
       mode="flat"
       underlineColor="transparent"
       theme={{ colors: { primary: '#000' } }}
       right={
        <TextInput.Icon
         icon={showPassword ? 'eye-off' : 'eye'}
         onPress={() => setShowPassword(!showPassword)}
        />
      }
    />
      <TouchableOpacity onPress={handlePasswordReset}>
        <Text style={styles.forgotLink}>Forgot password?</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleSignIn}
        style={styles.button}
        labelStyle={{ color: '#ffff', fontWeight: 'bold' }}
      >
         Sign in
      </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#DE1E26',
    padding: 24,
  },
  fadedLogo: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    width: 350,
    height: 350,
    zIndex: -1,
    opacity: 1, // because image is already transparent
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: -40, //  move all content up
  },
  title: {
    fontSize: 42,
    fontWeight: '600', //do 600 for all GLOBL. 
    color: '#fff',
    alignSelf: 'center',
    marginTop: 30,
  },
  subtitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    alignSelf: 'left',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  button: {
    marginTop: 20,
    width: '100%',
    backgroundColor: 'black',
    borderRadius: 8,
    paddingVertical: 6,
  },
  error: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  forgotLink: {
    color: '#fff',
    textAlign: 'right',
    marginTop: 10,
    textDecorationLine: 'underline',
  },  
});