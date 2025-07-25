import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Main');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Faded logo in background */}
      <Image
        source={require('../assets/10%TransparentGloblLogo.png')}
        style={styles.fadedLogo}
        resizeMode="contain"
      />

      <Text style={styles.title}>GLOBL.</Text>
      <Text style={styles.subtitle}>Sign In</Text>

      <TextInput 
      label="Email address" 
      value={email} 
      onChangeText={setEmail} 
      mode="flat"
      style={styles.input}
      underlineColor="transparent"
      theme={{ colors: { primary: '#000' } }}
      right={email ? <TextInput.Icon icon="check-circle" color="#004d40" /> : null}
     />

      <TextInput 
      label="Password" 
      value={password} 
      onChangeText={setPassword} 
      secureTextEntry style={styles.input} 
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

{error ? <Text style={styles.error}>{error}</Text> : null}

<Button
        mode="contained"
        onPress={handleSignIn}
        style={styles.button}
        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
      >
         Log in
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D50000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fadedLogo: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    width: 280,
    height: 280,
    opacity: 1, //  image is already 10% opaque
  },
  title: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 25,
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
    backgroundColor: '#002b2b',
    borderRadius: 8,
    paddingVertical: 6,
  },
  error: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
});