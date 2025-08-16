import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, SafeAreaView} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView from 'react-native-maps';

const RED = '#DE1E26';

// mock content data 
const PINNED_CLUB_LABEL = 'Pinned RunClub : West end, Glasgow';
const PINNED_CLUB_NOTE = 'Meets Tuesday & Thursday';
const STAT_1 = 'Attended 4\nRun Clubs\nworldwide';
const STAT_2 = '3 friends\nadded via\nRunClubs';

export default function RunClubScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* background logo */}
      <Image
        source={require('../assets/TransparentGloblLogo.png')}
        style={styles.bgLogo}
        resizeMode="contain"
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={RED} />
        </Pressable>
        <Text style={styles.headerTitle}>Run Clubs</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Pinned location pill with subtext */}
      <View style={styles.pinnedPill}>
        <Ionicons name="location" size={18} color={RED} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.pinnedText}>{PINNED_CLUB_LABEL}</Text>
          <Text style={styles.pinnedSub}>{PINNED_CLUB_NOTE}</Text>
        </View>
      </View>

      {/* Two-column stats strip */}
      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{STAT_1}</Text>
        </View>
        <View style={styles.vDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statText}>{STAT_2}</Text>
        </View>
      </View>

      {/* Map card Glasgow,Scotland */}
      <View style={styles.mapWrap}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: 55.8642,
            longitude: -4.2518,
            latitudeDelta: 0.25,
            longitudeDelta: 0.25,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RED },
 //background logo postioning
  bgLogo: {
    position: 'absolute',
    top: 64,
    alignSelf: 'center',
    width: '88%',
    height: 230,
    opacity: 0.08,
  },

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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
 //pinned location pill styling
  pinnedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  pinnedText: {
    color: '#222',
    fontSize: 14.5,
    fontWeight: '700',
  },
  pinnedSub: {
    marginTop: 2,
    color: '#666',
    fontSize: 12.5,
    fontWeight: '600',
  },

  // Two-column stats on faded red background
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  statCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  vDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
 // map card postioning
  mapWrap: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
