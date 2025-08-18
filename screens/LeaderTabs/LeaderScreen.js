import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Swipeable, ScrollView as GHScrollView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';

//level colors - streamline with friendSuggestion
function getLevelColor(level) {
  const palette = [
   '#DE1E26', // 1  red
    '#1E90FF', // 2  blue
    '#32CD32', // 3  lime
    '#FF8C00', // 4  orange
    '#8A2BE2', // 5  violet
    '#FFD700', // 6  gold
    '#FF1493', // 7  pink
    '#00CED1', // 8  teal
    '#A52A2A', // 9  brown
    '#2F4F4F', // 10 dark blue
  ];
  const idx = Math.max(1, Math.min(10, Math.floor(Number(level) || 1))) - 1;
  return palette[idx];
}

// avatar profile pictures 
const AVATARS = [
  require('../../assets/ProfileM1.png'),
  require('../../assets/ProfileM2.png'),
  require('../../assets/ProfileM3.png'),
  require('../../assets/ProfileW.png'),
  require('../../assets/ProfileW1.png'),
];

// base leaderboard entries (existing mock users)
const BASE_LEADERBOARD = [
  {
    id: 'nick',
    name: 'Nick',
    level: 10,
    description: 'West end RunClub',
    progress: 1.0,
    color: getLevelColor(10),
    image: require('../../assets/ProfileM1.png'),
    isBase: true,
  },
  {
    id: 'jason',
    name: 'Jason',
    level: 7,
    description: 'Complete 14 runs together',
    progress: 0.7,
    color: getLevelColor(7),
    image: require('../../assets/ProfileM2.png'),
    isBase: true,
  },
  {
    id: 'maddie',
    name: 'Maddie',
    level: 6,
    description: 'Completed 2 ParkRun events together',
    progress: 0.6,
    color: getLevelColor(6),
    image: require('../../assets/ProfileW.png'),
    isBase: true,
  },
  {
    id:'sean',
    name: 'Sean',
    level: 5,
    description: 'East Dunbartonshire RunClub together',
    progress: 0.5,
    color: getLevelColor(5),
    image: require('../../assets/ProfileM3.png'),
    isBase: true,
  },
];

// randomised mock data for avatars lvl. 
function ensureStats(friend) {
  const level = friend.level ?? (Math.floor(Math.random() * 10) + 1);
  const progress = friend.progress ?? Math.max(0.05, Math.min(0.95, Math.random()));
  return { ...friend, level, progress };
}

// component to render the leaderboard screen
export default function LeaderScreen() {
  const [data, setData] = useState(BASE_LEADERBOARD);

  /* This hook runs every time the LeaderScreen is at the forefront;
  newly added friends show up immediately without needing to refresh or restart the app. */
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        try {
          const raw = await AsyncStorage.getItem('leaderboard_friends');
          const friends = raw ? JSON.parse(raw) : [];

          // Map/normalise to row shape
          const friendRows = friends.map((f) => {
            const withStats = ensureStats(f);
            return {
              id: withStats.id || `${withStats.name}:${withStats.source}:${withStats.avatarIndex}`,
              name: withStats.name,
              level: withStats.level,
              description: withStats.source || 'Newly added friend',
              progress: withStats.progress,
              color: getLevelColor(withStats.level),
              image: AVATARS[withStats.avatarIndex],
              isBase: false,
            };
          });

          // Merge (avoid dupes by id if present; otherwise by name+desc+image)
          const merged = [...BASE_LEADERBOARD]; //array merge was created with all the default/base leaderboard users (Nick, Jason, Maddie, Sean).
          for (const fr of friendRows) { // iterates through all the friends added from AsyncStorage
            //merged.some(...) looks at each entry already in the merged leaderboard to check if the new friend fr is already there.
            const exists = merged.some(
              (m) =>
                (fr.id && m.id === fr.id) || 
                (!fr.id && m.name === fr.name && m.image === fr.image && m.description === fr.description) //compare by name + image + description (a fallback to avoid duplicates).
            );
            if (!exists) merged.push(fr); //Only adds the friend to the merged list if they aren’t already in it.
          }

          if (isActive) setData(merged); //isActive flag ensures we don’t update state after unmount; update with merged list
        } catch (e) {
          console.warn('Error loading friends:', e); //if something fails show warning and all back to only using base leaderboard
          if (isActive) setData(BASE_LEADERBOARD);
        }
      })();

      return () => {
        isActive = false; //if the user leaves screen before the async task finishes, it won’t try to update state on an unmounted component
      };
    }, [])
  );

  // Asking the user if they really want to delete a friend
  const confirmDelete = (row) => {
    Alert.alert(
      'Remove friend?', // title of the pop-up
      `This will remove ${row.name} from your leaderboard.`, //message with friends name
      [
        { text: 'Cancel', style: 'cancel' }, //option to back out
        { text: 'Remove', style: 'destructive', onPress: () => deleteFriend(row) }, //deletes friend when pressed
      ]
    );
  };

// Handle deleting a friend from the leaderboard + AsyncStorage
  const deleteFriend = async (row) => {
    try {
      // Smooth update of leaderboard, no blank flicker
      setData((prev) => prev.filter((r) => r.isBase || r.id !== row.id));
      //get the saved friends list from AsyncStorage
      const raw = await AsyncStorage.getItem('leaderboard_friends');
      const friends = raw ? JSON.parse(raw) : [];
      //filter out he deleted friends (keep others+base friends)
      const updated = friends.filter(
        (f) => (f.id || `${f.name}:${f.source}:${f.avatarIndex}`) !== row.id
      );
      //saved updatedlist back into AsyncStorage
      await AsyncStorage.setItem('leaderboard_friends', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete friend:', e); //if something fails, log warning 
    }
  };
  // UI, small swipeable delete button
  const RightAction = () => (
    <View style={styles.deleteAction}>
      <Ionicons name="trash-outline" size={22} color="#fff" />
      <Text style={styles.deleteText}>Delete</Text>
    </View>
  );
 
  return (
    // Main scrollable container for the leaderboard screen
    <GHScrollView 
    style={styles.container} 
    contentContainerStyle={{ paddingBottom: 16 }}>
      {/* loops through every user (base friends and added friends*/}
      {data.map((user, index) => {
        //build the row layout for a single leaderboard entry
        const Row = (
        <View style={styles.card}>
          {/* Avatar / profile picture */}
          <Image source={user.image} style={styles.avatar} />
          {/* tesxt + progress bar */}
          <View style={styles.textContainer}>
             {/* Show the user's name and their level beside it */}
            <Text style={styles.name}>
              {user.name} <Text style={styles.level}>Lvl.{user.level}</Text>
            </Text>
             {/* Small description about shared activity (ParkRun,RunClub etc.) */}
            <Text style={styles.description}>{user.description}</Text>
            {/* progress bar */}
            <View style={styles.progressBackground}>
              {/* filled value of avatars progress bar*/}
              <View
                style={[
                  styles.progressFill,
                  {
                    //ensures bar doesnt exceed 100%
                    width: `${Math.min((user.progress || 0) * 100, 100)}%`,
                    backgroundColor: user.color, //color tied to their level
                  },
                ]}
              />
            </View>
          </View>
        </View>
      );
      // If this user is a "base" leaderboard entry (mock starter data),
      // render them directly without swipe-to-delete functionality.
      if (user.isBase) {
        return <View key={`base-${index}`}>{Row}</View>;
       }
       /* If this user is NOT a base entry (i.e., a friend added via suggestions),
       wrap their row inside a Swipeable component so the user can swipe left
       to reveal the "Delete" action.*/
       // NOTE: Swipeable from gesture-handler is deprecated.
       // Works fine here, but could be migrated to Reanimated's Swipeable in future.
       return (
         <Swipeable
           key={user.id || `row-${index}`} //unique key per row
           renderRightActions={RightAction} //what shows when swiped left
           rightThreshold={40} //how far to swift before triggering
           overshootRight={false} //prevetn swipe "bounce"
           onSwipeableRightOpen={() => confirmDelete(user)} //show confirmation prompt
         >
           {Row} {/* reuse the same ROW UI inside swipeable wrapper*/}
         </Swipeable>
       );
     })}
   </GHScrollView>
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
  textContainer: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 14 },
  level: { fontWeight: 'normal', color: '#555'},
  description: { fontSize: 13, color: '#666', marginBottom: 4 },
    // background of the progress bar
  progressBackground: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    width: '100%',
  },
   // filled portion of the progress bar
  progressFill: { height: 8, borderRadius: 4 },

  deleteAction: {
    width: 88,
    backgroundColor: '#DE1E26',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: { color: '#fff', marginTop: 4, fontWeight: '700' },
});
