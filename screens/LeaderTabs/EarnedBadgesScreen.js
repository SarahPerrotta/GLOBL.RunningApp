import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

// list of earned badges with details
const earnedBadges = [
  {
    emoji: '👯‍♂️',
    title: 'RunClub Connector',
    criteria: 'Join or create a virtual run club and complete a group run',
    date: '1st May 2025',
  },
  {
    emoji: '🔥',
    title: 'Heatmap Hero',
    criteria: 'Run enough in a city to light up the heatmap significantly',
    date: '12th May 2025',
  },
  {
    emoji: '🏃‍♀️',
    title: 'Consistency King/Queen',
    criteria: 'Run for 30 consecutive days',
    date: '15th May 2025',
  },
  {
    emoji: '🗺️',
    title: 'Globetrotter Badge',
    criteria: 'Visit and log runs in 5+ different countries',
    date: '4th June 2025',
  },
  {
    emoji: '🌆',
    title: 'City Sprinter',
    criteria: 'Run in 10 unique cities ',
    date: '13th June 2025',
  },
  {
    emoji: '🧱',
    title: 'Milestone Crusher',
    criteria: 'Reach 500km total distance run',
    date: '6th July 2025',
  },
  {
    emoji: '🧭',
    title: 'Off-the-Beaten-Track Explorer',
    criteria: 'Run in less-touristed or small locations (customisable by city pop. or rural tag)',
    date: '14th July 2025',
  },
  {
    emoji: '🏙️',
    title: 'Landmark Hunter',
    criteria:'Complete runs near 10 famous global landmarks (e.g. Eiffel Tower, Statue of Liberty)',
    date: '22nd July 2025',
    },
  {
    emoji: '🎯',
    title: 'Precision Runner',
    criteria: 'Complete a run with an exact goal (e.g. exactly 5.00km or pace target met)',
    date: '1st August 2025',
  },
];

export default function EarnedBadgesScreen() {
  return (
    <ScrollView style={styles.container}>
      {earnedBadges.map((badge, index) => (
        <View key={index} style={styles.card}>
           {/* badge emoji/icon */}
          <Text style={styles.emoji}>{badge.emoji}</Text>

           {/* badge info */}
          <View style={styles.textContent}>
            <Text style={styles.title}>{badge.title}</Text>
            <Text style={styles.criteria}>Criteria: {badge.criteria}</Text>
            <Text style={styles.date}>You earned this badge on {badge.date}</Text>
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
  textContent: {
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
  date: {
    fontSize: 13,
    color: '#111',
    marginTop: 4,
  },
});
