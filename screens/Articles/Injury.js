import React from 'react';
import { SafeAreaView, ScrollView, View, Image, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Injury({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        
        {/* Back button row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Pressable
            onPress={() => navigation.goBack()} // routes back to ArticlesListScreen
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#DE1E26" />
          </Pressable>
          <View style={{ flex: 1 }} />
        </View>

        {/* image */}
        <Image
          source={require('../../assets/ManRunning.jpeg')}
          style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 12 }}
        />

        {/* Title */}
        <Text style={styles.title}>Injury Prevention</Text>
        <View style={styles.rule} />

        {/* Article Content */}
        <Text style={styles.p}>
  Running is one of the most accessible and effective forms of exercise, but without proper care it can lead to injuries like shin splints, runner’s knee, or Achilles tendonitis. 
  Staying consistent, building strength, and progressing gradually are the keys to remaining injury-free.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>1. Warm up first: </Text>
  Spend 5–10 minutes walking or jogging lightly, followed by dynamic stretches such as leg swings and high knees.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>2. Increase gradually: </Text>
  Avoid sudden spikes in mileage or speed. Stick to the 10% rule, no more than a 10% increase per week.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>3. Strength train: </Text>
  Twice a week, focus on strengthening your glutes, calves, hamstrings, and core to support your joints.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>4. Vary your terrain: </Text>
  Alternate between road, trail, and track running to distribute impact and reduce repetitive strain.
</Text>

<Text style={styles.p}>
  <Text style={styles.bold}>5. Listen to your body: </Text>
  Address any discomfort early by reducing training load or resting to prevent small issues from becoming serious injuries.
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
