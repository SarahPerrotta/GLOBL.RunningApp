import React from 'react';
import { SafeAreaView, View, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { Text } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ArticlesListScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header with circlar arrow, route back to Navigation */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.navigate('NavigationHub')}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back to Navigation"
        >
          <Ionicons name="chevron-back" size={22} color="#DE1E26" />
        </Pressable>
        <Text style={styles.headerTitle}>Articles</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Article cards */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {/* Injury */}
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() => navigation.navigate('ArticleInjury')}
        >
          <Image source={require('../../assets/ManRunning.jpeg')} style={styles.cardImage} />
          <Text style={styles.cardTitle}>Injury Prevention</Text>
        </Pressable>

        {/* Zone 2 + VO2 Max */}
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() => navigation.navigate('ArticleZone2')}
        >
          <Image source={require('../../assets/Vo2Max.jpeg')} style={styles.cardImage} />
          <Text style={styles.cardTitle}>Understanding Zone 2 Training </Text>
        </Pressable>

        {/* Nutrition */}
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() => navigation.navigate('ArticleNutrition')}
        >
          <Image source={require('../../assets/Nutrition.jpeg')} style={styles.cardImage} />
          <Text style={styles.cardTitle}>Nutrition for Runners</Text>
        </Pressable>

        <View style={{ height: 8 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const COLORS = {
  brand: '#DE1E26',
  textDark: '#0E2B32',
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.brand },

  // Header row
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF', // white title against red background
  },
  headerSpacer: { width: 40, height: 40 },

  // List of article cards
  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 16 },

  // Card style (white background for contrast)
  card: {
    marginTop: 14, // helps space out the article cards
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.brand,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  cardImage: { width: '100%', height: 165, resizeMode: 'cover' },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.textDark,
    paddingVertical: 12,
    paddingHorizontal: 10,
    textAlign: 'center',
  },

  // Pressed visual feedback - shadows
  pressed: { opacity: 0.95, transform: [{ scale: 0.995 }] },
});

