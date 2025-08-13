import React from 'react';
import { SafeAreaView, ScrollView, View, Image, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Nutrition({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        
        {/* Back button row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Pressable
            onPress={() => navigation.goBack()} // routes back to ArticlesListScreen
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color="#DE1E26" />
          </Pressable>
          <View style={{ flex: 1 }} />
        </View>

        {/* image */}
        <Image
          source={require('../../assets/Nutrition.jpeg')}
          style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 12 }}
        />

        {/* Title */}
        <Text style={styles.title}>Nutrition for Runners</Text>
        <View style={styles.rule} />

        {/* Article Content */}
        <Text style={styles.p}>
  Proper nutrition fuels your runs, aids recovery, and helps you perform at your best. 
  Eating the right foods before and after training ensures you have the energy to run and the nutrients to rebuild your muscles.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>1. Pre-run fuel: </Text>
  Eat a light meal or snack 1–3 hours before running. Focus on easy-to-digest carbs such as oatmeal, a banana, or toast with honey.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>2. Hydration: </Text>
  Drink water throughout the day and have a small glass 30 minutes before your run. For runs over an hour, consider an electrolyte drink.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>3. Post-run recovery: </Text>
  Within 30–60 minutes after running, eat a mix of protein and carbohydrates, examples include a smoothie with fruit and yogurt, or chicken with rice.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>4. Daily balance: </Text>
  Maintain a diet rich in whole grains, lean proteins, fruits, vegetables, and healthy fats to support overall performance and recovery.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>5. Listen to your body: </Text>
  Adjust portion sizes and food choices based on your training load, energy levels, and personal digestion.
</Text>
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', color: '#0E2B32' },
  rule: { height: 1, backgroundColor: '#E6E6E6', marginVertical: 10, marginHorizontal: 40 },
  p: { fontSize: 16, lineHeight: 22, color: '#222', marginBottom: 10 },
  bold: { fontWeight: '700' },
  
  // Back button style
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#DE1E26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

