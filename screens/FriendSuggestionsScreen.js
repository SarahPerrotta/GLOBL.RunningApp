import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Modal, Switch, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useIncognito } from '../components/IncognitoContext';
import IncognitoToggle from '../components/IncognitoToggle';

const RED = '#DE1E26'; // main theme colour for the app 
/* Keys used to save/retrieve data in AsyncStorage
- FRIENDS: the list of selected friends stored for the leaderboard */
const STORAGE_KEYS = {
  FRIENDS: 'leaderboard_friends',
};
// Number of friend cards shown in each suggestion block
const CARDS_PER_SECTION = 6;
// Width of each friend card so that 3 fit nicely in one row
const CARD_W = '30%'; 

// profile pictures for avatars
const AVATARS = [
  require('../assets/ProfileM1.png'),
  require('../assets/ProfileM2.png'),
  require('../assets/ProfileM3.png'),
  require('../assets/ProfileW.png'),
  require('../assets/ProfileW1.png'),
];

// randomised name pool for suggested friends 
const POOL = ['Ava', 'Ben', 'Ella', 'Harris', 'Luca', 'Poppy', 'Orla', 'Skye', 'Will', 'Isla'];

// color pallete for GLOBL. levels
function getLevelColor(level) {
  const LEVEL_PALETTE = [
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
  const idx = Math.max(1, Math.min(10, Math.floor(level))) - 1;
  return LEVEL_PALETTE[idx]; 
}

// develop mock data for avatars and prevents reshuffling when app reloads 
// implementing of the Fowler–Noll–Vo hash function, variant 1a (FNV-1a)
const hashSeed = (str) => {
  let h = 2166136261 >>> 0; // FNV-1a offset basis
  for (let i = 0; i < str.length; i++) { //^= (XOR) with character code 
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0; //forced unsigned 32 bit result 
};
// takes a seed (a number) and turns it into a repeatable random value between 0 and 1
const rand01 = (seed) => {
  // run the seed through sine to “scramble” it, then multiply to spread out the values
  const x = Math.sin(seed) * 10000;
  // remove the whole number part, leaving only the decimal (which will always be between 0 and 1)
  return x - Math.floor(x);
};
const mockStatsFor = (name, source, avatarIndex) => { 
  const seed = hashSeed(`${name}|${source}|${avatarIndex}`); //name + where they came from + avatar
  const r1 = rand01(seed); // two random decimals (r1, r2) to set stats.
  const r2 = rand01(seed + 1337); // seed plus random value 
  const level = 1 + Math.floor(r1 * 10); // between level 1 and 10
  const progress = Math.min(0.95, Math.max(0.05, r2)); // the progress bar is always between 5% and 95% so it’s never empty or full.
  return { level, progress };
};

// Build people for a section (deterministic), seed allows it to look different and 'shift' selection but still reproduible
const buildPeople = (count, seed = 0, source = '') =>
  Array.from({ length: count }, (_, i) => {
    const name = POOL[(i + seed) % POOL.length]; //ensures that names cycle through the pool and change if the seed changes.
    const avatarIndex = (i + seed) % AVATARS.length; //picks avatars profile pic; uses i + seed, but this time cycles through the AVATARS array.
    const { level, progress } = mockStatsFor(name, source, avatarIndex);// calls mockStatsFor, this creates fake but deterministic stats (level and progress bar).
    return {
      id: `${source}:${name}:${avatarIndex}`, // Returns an object representing one friend suggestion.
      name,
      avatarIndex,
      img: AVATARS[avatarIndex],
      source,
      level,
      progress,
    };
  });

// Section component = one block of suggested friends (e.g. Run Club / Park Run / Trail)
function Section({ title, seed, source, selected, onToggle }) {
 // useMemo ensures we only rebuild the people list if seed or source changes
  const people = useMemo(
    () => buildPeople(CARDS_PER_SECTION, seed, source),
    [seed, source]
  );

  return (
    <View style={styles.section}>
      <View style={styles.grid}>
        {people.map((p) => {
          // Check if this person is already selected as a friend
          const isSelected = selected.some((f) => f.id === p.id);
          // Assign a unique color to this friend’s level bar
          const barColor = getLevelColor(p.level);
          return (
              // Each friend suggestion is a clickable card
            <Pressable
              key={p.id} // unique ID for React list rendering
              style={[styles.card, isSelected && styles.cardSelected]} // highlight if selected
              onPress={() => onToggle(p)} //toggle when selection is tapped
              accessibilityRole="button"
              accessibilityLabel={`Toggle ${p.name} friend`}
            >
               {/* Avatar + optional green tick overlay when selected */}
              <View style={styles.avatarCircle}>
                <Image source={p.img} style={styles.avatarImg} />
                {isSelected && (
                  <View style={styles.tickOverlay}>
                    <Ionicons name="checkmark" size={28} color="#32CD32" />
                  </View>
                )}
              </View>
               {/* Friend’s display name */}
              <Text style={styles.cardName} numberOfLines={1}>
                {p.name}
              </Text>
               {/* Friend’s current mock level */}
              <Text style={styles.levelText}>Lvl. {p.level}</Text>

              {/* tiny progress, preview of level */}
              <View style={styles.progressBG}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${p.progress * 100}%`, backgroundColor: barColor },
                  ]}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
      {/* Section label (e.g. "Suggested Friends from Run Clubs") */}
      <Text style={styles.sectionLabel}>{title}</Text>
    </View>
  );
}

//Main screen for friend suggestions 
export default function FriendSuggestionsScreen({ navigation }) {
  //local state
  const [showInfo, setShowInfo] = useState(false); // local - whether the privacy modal is open
  const [selected, setSelected] = useState([]); // local - stores all friends the user has chosen
  const { incognito, setIncognito } = useIncognito(); //global incognito state

  // * Initial load from AsyncStorage *
  // This runs once when the screen first mounts and tries to restore previous settings
  useEffect(() => {
    (async () => {
      try {
        // load previously selected friends list from storage
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.FRIENDS);
        if (raw) {
          try {
            // only set state if the parsed value is an array
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) setSelected(parsed);
          } catch {
            // if stored JSON is corrupted, wipe it clean so app doesn’t break
            await AsyncStorage.removeItem(STORAGE_KEYS.FRIENDS);
          }
        }
      } catch (e) {
        console.warn('Init load error:', e);
      }
    })();
  }, []);

  // Toggle incognito via global setter
  const handleToggleIncognito = useCallback((next) => setIncognito(next), [setIncognito]);
  
  // * Toggle friend selection *
  // Adds or removes a friend from the selected list
  // Also saves the updated list to AsyncStorage so it survives reload
  const handleToggleSelect = useCallback(
    async (person) => {
      if (incognito) return; // block action when incognito veil is on
      try {
        let updated;
        //if a friend is already selected remove them
        if (selected.some((f) => f.id === person.id)) {
          updated = selected.filter((f) => f.id !== person.id);
        } else {
          //otherwise add them
          updated = [...selected, person];
        }
        setSelected(updated); //update local state
        await AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update selection:', e);
      }
    },
    [incognito, selected] //dependency array for useCallBack
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={RED} />
        </Pressable>
        <Text style={styles.headerTitle}>Friend Suggestions</Text>
        <Pressable
          onPress={() => setShowInfo(true)}
          style={styles.incognitoBtn}
          accessibilityLabel="Friend suggestions privacy"
        >
          <Ionicons name={incognito ? 'eye-off' : 'eye'} size={20} color="#fff" />
        </Pressable>
      </View>

      {/* types of friend suggestion sections x3 sources */}
      <ScrollView contentContainerStyle={styles.content}>
        <Section
          title="Suggested Friends from shared Run Clubs"
          seed={0}
          source="Participated in same Run Club"
          selected={selected}
          onToggle={handleToggleSelect}
        />
        <View style={styles.hr} />
        <Section
          title="Suggested Friends from shared Park Runs"
          seed={3}
          source="Completed the same Park Run"
          selected={selected}
          onToggle={handleToggleSelect}
        />
        <View style={styles.hr} />
        <Section
          title="Suggested Friends from shared Trails"
          seed={6}
          source="Ran the same Trail"
          selected={selected}
          onToggle={handleToggleSelect}
        />
      </ScrollView>

      {/* Privacy mode feature pop up */}
      <Modal
        visible={showInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Friend Suggestions Privacy</Text>
            <Text style={styles.modalBody}>
              Turning this off means your profile won’t be shared as a friend
              suggestion to other users based on shared clubs, parkruns, or trails.
            </Text>
            <View style={styles.toggleRow}>
            <IncognitoToggle label="Incognito mode" />
            </View>
            <Pressable onPress={() => setShowInfo(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Global red veil if incognito */}
      {incognito && <View style={styles.incognitoVeil} pointerEvents="none" />}
    </SafeAreaView>
  );
}

//Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RED },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: RED,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 24, fontWeight: '700' },
  incognitoBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  content: { paddingBottom: 24 },
  section: { paddingHorizontal: 16, marginBottom: 14 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  card: {
    width: CARD_W,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    position: 'relative',
  },
  cardSelected: { borderWidth: 2, borderColor: RED },

  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF1F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImg: { width: 64, height: 64, borderRadius: 32 },

  // Centered tick overlay on avatar profile
  tickOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)', // subtle veil so the tick pops
    borderRadius: 32,
  },

  cardName: { fontWeight: '800', color: '#0E2B32' },
  levelText: { fontSize: 12, color: '#555', fontWeight: '600', marginTop: 2 },

  // tiny progress preview under the name/level
  progressBG: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EBEEF0',
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3 },

  sectionLabel: { color: '#fff', fontWeight: '800', textAlign: 'center', marginTop: 6 },

  hr: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: 16,
    marginBottom: 10,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8, color: '#0E2B32' },
  modalBody: { color: '#16333B', lineHeight: 20, marginBottom: 12, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toggleLabel: { fontSize: 16, fontWeight: '700', color: '#0E2B32' },
  modalCloseBtn: {
    alignSelf: 'center',
    backgroundColor: RED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  modalCloseText: { color: '#fff', fontWeight: '700' },

  // Global incognito red veil (blocks taps)
  incognitoVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(222,30,38,0.35)',
  },
});
