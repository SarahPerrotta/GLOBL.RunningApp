import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-paper';

export default function LandingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GLOBL.</Text>
      <Image source={require('../assets/GLOBL.Logo.png')} style={styles.logo} />
      <Text style={styles.tagline}>RUN THE WORLD</Text>
      <Button mode="contained" onPress={() => navigation.navigate('SignIn')} style={styles.button}>Sign In</Button>
      <Button mode="outlined" onPress={() => navigation.navigate('CreateAccount')} style={styles.button}>Create account</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF0000', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 48, color: '#FFF', fontWeight: 'bold' },
  logo: { width: 150, height: 150, marginVertical: 20 },
  tagline: { fontSize: 24, color: '#FFF', marginBottom: 50 },
  button: { marginVertical: 10, width: 200 }
});