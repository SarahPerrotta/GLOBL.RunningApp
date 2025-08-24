import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, SafeAreaView, ScrollView, Dimensions} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';

const BASE = 'https://globl-runningapp.onrender.com';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const RED = '#DE1E26';
const MAP_HEIGHT = Math.min(520, Math.max(360, SCREEN_HEIGHT * 0.55)); // size of map to be focal point of screen

// Glasgow-area example mock events
const PARKRUN_EVENTS = [
  { id: 'strathclyde', name: 'Strathclyde Park', desc: 'Strathclyde Parkrun every Saturday 9:30am. Flat and fast around the loch.', lat: 55.8029, lon: -4.0266 },
  { id: 'tollcross',    name: 'Tollcross Park',   desc: 'Tollcross Parkrun every Saturday 9:30am. A hilly two-lap course.',       lat: 55.8461, lon: -4.1779 },
  { id: 'pollok',       name: 'Pollok Park',      desc: 'Pollok Parkrun every Saturday 9:30am. Popular woodland course.',        lat: 55.8248, lon: -4.3005 },
  { id: 'victoria',     name: 'Victoria Park',    desc: 'Victoria Parkrun every Saturday 9:30am. Three laps around the pond.',   lat: 55.8803, lon: -4.3214 },
  { id: 'springburn',   name: 'Springburn Park',  desc: 'Springburn Parkrun every Saturday 9:30am. Scenic city-park route.',     lat: 55.8859, lon: -4.2236 },
];

export default function ParkRunScreen({ navigation }) {
  const [selected, setSelected] = useState(PARKRUN_EVENTS[4]);

  return (
    <SafeAreaView style={styles.container}>
      {/* transparent logo background  */}
      <Image
        source={require('../assets/TransparentGloblLogo.png')}
        style={styles.bgLogo}
        resizeMode="contain"
      />

      {/* header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={RED} />
        </Pressable>
        <Text style={styles.headerTitle}>ParkRun</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* compact stats strip of users accomplishments */}
      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Text style={styles.statText}>You came first in the StrathKelvin ParkRun!</Text>
        </View>
        <View style={styles.vDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statText}>Attended 9{'\n'}ParkRuns in the UK</Text>
        </View>
        <View style={styles.vDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statText}>Your fastest{'\n'}time 19:35 mins!</Text>
        </View>
      </View>

      {/* compact chip selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {PARKRUN_EVENTS.map(ev => {
          const active = ev.id === selected.id; // highlight the currently selected event
          return (
            <Pressable
              key={ev.id}
              onPress={() => setSelected(ev)} // update which event is selected
              style={[styles.chip, active && styles.chipActive]}
            >
              {/* Event name shown in the chip, cut off if it overflows */}
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]} numberOfLines={1}>
                {ev.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* info bubble of selected parkrun */}
      <View style={styles.infoBubble}>
        <Text style={styles.infoText}>{selected.desc}</Text>
      </View>

      {/* map card showing the selected event’s location */}
      <View style={[styles.mapWrap, { height: MAP_HEIGHT }]}>
        <MapView
          style={StyleSheet.absoluteFill}
          region={{
            latitude: selected.lat,
            longitude: selected.lon,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          <Marker coordinate={{ latitude: selected.lat, longitude: selected.lon }} title={selected.name} />
        </MapView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // page background
  container: { flex: 1, backgroundColor: RED },

  // background logo
  bgLogo: {
    position: 'absolute',
    top: 64,
    alignSelf: 'center',
    width: '88%',
    height: 230,
    opacity: 0.08,
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: RED, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center', color: '#fff',
    fontSize: 26, fontWeight: '700', letterSpacing: 0.5,
  },

  // stats strip
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)', //faded red 
    marginBottom: 10,
  },
  statCell: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, justifyContent: 'center' },
  statText: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center', lineHeight: 18 },
  vDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.55)' },

  // parkrun chips 
  chipsRow: {
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 8,
  },
  chip: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  chipLabel: { color: '#0E2B32', fontWeight: '600', fontSize: 12, maxWidth: 160 },
  chipLabelActive: { color: '#0E2B32' },

  // info bubble of selected parkrun 
  infoBubble: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  infoText: { color: '#0E2B32', fontSize: 15, fontWeight: '700', textAlign: 'center' },

  // large map with rounded corners
  mapWrap: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});

