import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <Text style={styles.title}>GLOBL.</Text>
      <Text style={styles.subtitle}>Sign In</Text>
      <TextInput label="Email address" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button mode="contained" onPress={handleSignIn} style={styles.button}>Log in</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF0000', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 48, color: '#FFF', fontWeight: 'bold' },
  subtitle: { fontSize: 24, color: '#FFF', marginBottom: 20 },
  input: { width: '100%', marginVertical: 10, backgroundColor: '#FFF' },
  button: { marginTop: 20, width: 200 },
  error: { color: '#FFF', marginTop: 10 }
});