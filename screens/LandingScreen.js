import React from 'react';
import { View, Text, Image, SafeAreaView } from 'react-native';
import { Button } from 'react-native-paper';
import { StyleSheet, Dimensions } from 'react-native';

export default function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
    {/* Top Section */}
    <View style={styles.header}>
      <Text style={styles.title}>GLOBL.</Text>
    </View>
    
    {/* Middle Content */}
    <View style={styles.middle}>
      <Image source={require('../assets/TransparentGloblLogo.png')} style={styles.logo} resizeMode="contain" />
     <Text style={styles.tagline}>RUN THE WORLD</Text>
    </View>

     {/* Bottom Buttons */}
     <View style={styles.bottom}>
        <Button
          mode="contained" 
          onPress={() => navigation.navigate('SignIn')}
          style={[styles.button, styles.signInButton]}
          labelStyle={styles.signInText}
          contentStyle={styles.buttonContent}
        >
          Sign In
        </Button>

       <Button
         mode="outlined"
         onPress={() => navigation.navigate('CreateAccount')}
         style={[styles.button, styles.createAccountButton]}
         labelStyle={styles.createAccountText}
         contentStyle={styles.buttonContent}
        >
         Create account
       </Button>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DE1E26',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 48,
    color: '#FFF',
    fontWeight: '600',
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300, 
    height: 300,
    marginBottom: -20,
  },
  tagline: {
    fontSize: 26,
    color: '#FFF',
    fontWeight: '700',
    marginTop: '0',
  },
  bottom: {
    alignItems: 'center',
    marginBottom: 40,
  },
  button: {
    width: 240,
    borderRadius: 30,
    marginVertical: 10,
  },
  buttonContent: {
    height: 50,
  },
  signInButton: {
    backgroundColor: '#000',
  },
  signInText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createAccountButton: {
    borderColor: '#FFF',
    borderWidth: 2,
  },
  createAccountText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});