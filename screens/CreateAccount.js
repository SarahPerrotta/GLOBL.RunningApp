import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function CreateAccountScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

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
    <View style={styles.container}>
      <Text style={styles.title}>GLOBL.</Text>
      <Text style={styles.subtitle}>Create Account</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput label="Create a password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TextInput label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={styles.input} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button mode="contained" onPress={handleCreateAccount} style={styles.button}>Create Account</Button>
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