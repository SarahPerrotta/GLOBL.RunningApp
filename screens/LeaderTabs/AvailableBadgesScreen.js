import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// list of badges available with details
const availableBadges = [
  {
    emoji: '📍',
    title: 'Local Legend',
    criteria: 'Run in the same local area 10+ times',
  },
  {
    emoji: '🏔️',
    title: 'Altitude Achiever',
    criteria: 'Run in a high-altitude city or mountainous region (e.g., Denver, Cusco)',
  },
  {
    emoji: '👯',
    title: 'Social Starter',
    criteria: 'Add 5 friends or be part of a RunClub group',
  },
  {
    emoji: '🌍',
    title: 'Continental Conqueror',
    criteria: 'Run in 3+ continents',
  },
  {
    emoji: '🇪🇺',
    title: 'EU Tour Badge',
    criteria: 'Log runs in 5+ European countries',
  },
  {
    emoji: '🌐',
    title: 'Hemisphere Hopper',
    criteria: 'Run in both the Northern and Southern Hemispheres',
  },
  {
    emoji: '🌙',
    title: 'Night Owl',
    criteria: 'Run after 10pm 5+ times',
  },
  {
    emoji:'🏞️',
    title: 'Nature Nomad',
    criteria: 'Complete runs in 3+ green or non-urban locations',
  },
  {
    emoji: '🏖️',
    title: 'Beach Strider',
    criteria: 'Complete a run tagged near a coastal or beach city (e.g., Brighton, Nice, Bondi)',
  }
];

export default function AvailableBadgesScreen() {
  return (
    <ScrollView style={styles.container}>
      {availableBadges.map((badge, index) => (
        <View key={index} style={styles.card}>
          {/* badge emoji/icon */}
          <Text style={styles.emoji}>{badge.emoji}</Text>
          {/* badge info */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{badge.title}</Text>
            <Text style={styles.criteria}>Criteria: {badge.criteria}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// main component to display earned badges with scroll enabled
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // card layout for each badge
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'red',
    backgroundColor: '#fff',
  },
  emoji: {
    fontSize: 50,
    marginRight: 14,
  },
  // text block layout beside emoji
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  criteria: {
    fontSize: 13,
    color: '#555',
  },
});
