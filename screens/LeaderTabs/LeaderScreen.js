import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

// mock leaderboard data for display
const leaderboardData = [
  {
    name: 'Nick',
    level: 10,
    description: 'West end RunClub',
    progress: 1.0,
    color: '#FFD700', // yellow
    image: require('../../assets/ProfileM1.png'),
  },
  {
    name: 'Jason',
    level: 7,
    description: 'Complete 14 runs together',
    progress: 0.7,
    color: '#1E90FF', // blue
    image: require('../../assets/ProfileM2.png'),
  },
  {
    name: 'Maddie',
    level: 6,
    description: 'Completed 2 ParkRun events together',
    progress: 0.6,
    color: '#800080', // purple
    image: require('../../assets/ProfileW.png'),
  },
  {
    name: 'Sean',
    level: 5,
    description: 'East Dunbartonshire RunClub together',
    progress: 0.5,
    color: '#4CAF50', // green
    image: require('../../assets/ProfileM3.png'),
  },
];

// component to render the leaderboard screen
export default function LeaderScreen() {
  return (
    <ScrollView style={styles.container}>
      {leaderboardData.map((user, index) => (
        <View key={index} style={styles.card}>
          <Image source={user.image} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.name}>
              {user.name} <Text style={styles.level}>Lvl.{user.level}</Text>
            </Text>
            <Text style={styles.description}>{user.description}</Text>
            {/* progress bar */}
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${user.progress * 100}%`,
                    backgroundColor: user.color,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // each card row for a leaderboard entry
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  // avatar image style
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 25,
    marginRight: 12,
  },
    // container for text and progress inside the card
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  level: {
    fontWeight: 'normal',
    color: '#555',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
    // background of the progress bar
  progressBackground: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    width: '100%',
  },
   // filled portion of the progress bar
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
});
