import React from 'react';
import { SafeAreaView, ScrollView, View, Image, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Zone2({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        
        {/* Back button row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Pressable
            onPress={() => navigation.goBack()} // <- returns to ArticlesListScreen
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#DE1E26" />
          </Pressable>
          <View style={{ flex: 1 }} />
        </View>

        {/* Hero image */}
        <Image
          source={require('../../assets/Vo2Max.jpeg')}
          style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 12 }}
        />

        {/* Title */}
        <Text style={styles.title}>Understanding Zone 2 Training</Text>
        <View style={styles.rule} />

        {/* Content */}
        <Text style={styles.p}>
  Zone 2 running is a low-intensity training method that improves aerobic fitness, fat metabolism, and endurance. 
  It involves keeping your heart rate in a specific range so you can run at a comfortable pace while building long-term stamina.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>1. Know your heart rate zone: </Text>
  Zone 2 is typically 60–70% of your maximum heart rate. You can calculate this by subtracting your age from 220, then multiplying by 0.6–0.7.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>2. Use the talk test: </Text>
  You should be able to hold a conversation without gasping for air while running.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>3. Be patient: </Text>
  Your pace may feel slower at first, but consistency in Zone 2 leads to faster speeds at the same heart rate over time.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>4. Train consistently: </Text>
  Aim for 2–4 Zone 2 runs per week, ideally lasting 45–90 minutes.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>5. Avoid creeping into higher zones: </Text>
  Stay disciplined, if your heart rate drifts higher, slow your pace or take walk breaks to remain in Zone 2.
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
