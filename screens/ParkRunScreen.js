import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, SafeAreaView, ScrollView, Dimensions, ActivityIndicator} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';

// backend live on Render and serves static JSON at /api/parkruns
const BASE = 'https://globl-runningapp.onrender.com';
// basic layout sizing: map height scales with device height 
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const RED = '#DE1E26';
const MAP_HEIGHT = Math.min(520, Math.max(360, SCREEN_HEIGHT * 0.55)); // size of map to be focal point of screen

// Colour scheme used across the pins 
const COLOR_OTHER = '#0ea5a8';   // teal = "other" (not saved)
const COLOR_SAVED = '#7c3aed';   // purple = saved by the user
const COLOR_SELECTED = '#ef4444';// red = currently selected event (highlight)

// Glasgow-area example mock events that develops the local chip row of the screen
const PARKRUN_EVENTS = [
  { id: 'strathclyde', name: 'Strathclyde Park', desc: 'Strathclyde Parkrun every Saturday 9:30am. Flat and fast around the loch.', lat: 55.8029, lon: -4.0266 },
  { id: 'tollcross',    name: 'Tollcross Park',   desc: 'Tollcross Parkrun every Saturday 9:30am. A hilly two-lap course.',       lat: 55.8461, lon: -4.1779 },
  { id: 'pollok',       name: 'Pollok Park',      desc: 'Pollok Parkrun every Saturday 9:30am. Popular woodland course.',        lat: 55.8248, lon: -4.3005 },
  { id: 'victoria',     name: 'Victoria Park',    desc: 'Victoria Parkrun every Saturday 9:30am. Three laps around the pond.',   lat: 55.8803, lon: -4.3214 },
  { id: 'springburn',   name: 'Springburn Park',  desc: 'Springburn Parkrun every Saturday 9:30am. Scenic city-park route.',     lat: 55.8859, lon: -4.2236 },
];

// Distance calculations are relative to Glasgow city centre which is users for mock user-location
const GLASGOW = { lat: 55.8642, lng: -4.2518 };

// Quick Haversine helper (km) so I can filter pins by radius
const distKm = (a, b) => {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
};

export default function ParkRunScreen({ navigation }) {
  // The chip-selected Glasgow event (powers the info bubble + red pin)
  const [selected, setSelected] = useState(PARKRUN_EVENTS[4]);

  // Live ParkRun data from my server + loading/error flags
  const [dbEvents, setDbEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');

  // Saved set stored in memory (MVP). Later I can persist with AsyncStorage.
  // Keys are event IDs (prefer slug, else name).
  const [saved, setSaved] = useState({});

  // Runner pop-up state (filter/legend/save box)
  const [filterOpen, setFilterOpen] = useState(false);

  // Distance filter (null = All UK; otherwise km from Glasgow)
  const [radiusKm, setRadiusKm] = useState(null);

  // When true, map auto-fits to show all visible UK pins. Tapping a chip zooms locally and disables this.
  const [autoFitUK, setAutoFitUK] = useState(true);

  const mapRef = useRef(null);

  // fetch all UK ParkRuns from my server (Render, Node/Express, static JSON).
  // I coerce lat/lng to numbers to avoid losing pins due to string types.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setLoadErr('');
        const res = await fetch(`${BASE}/api/parkruns`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const cleaned = (Array.isArray(data) ? data : [])
          .map(e => ({ ...e, lat: Number(e.lat), lng: Number(e.lng) }))
          .filter(e => Number.isFinite(e.lat) && Number.isFinite(e.lng) && e.name);
        if (mounted) setDbEvents(cleaned);
      } catch (e) {
        if (mounted) setLoadErr(String(e?.message || e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // compute which pins to show on the map based on the selected radius.
  // If radius is null, show all UK events (40/40 parkruns)
  const pins = useMemo(() => {
    if (!radiusKm) return dbEvents;
    const c = GLASGOW;
    return dbEvents.filter(e => distKm(c, { lat: e.lat, lng: e.lng }) <= radiusKm);
  }, [dbEvents, radiusKm]);

  // Auto-fit camera to visible pins when "UK view" is on.
  // If I tap a Glasgow chip, I disable autfit and zoom to just that area.
  useEffect(() => {
    if (!mapRef.current || !autoFitUK) return;
    if (pins.length > 0) {
      mapRef.current.fitToCoordinates(
        pins.map(e => ({ latitude: e.lat, longitude: e.lng })),
        { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true }
      );
    } else {
      // Fallback to a UK-wide region
      mapRef.current.animateToRegion({
        latitude: 54.5, longitude: -2.5, latitudeDelta: 7.0, longitudeDelta: 7.0,
      }, 500);
    }
  }, [pins, autoFitUK]);

  // Small camera helper for local zooms (chips / mock pins)
  const zoomTo = (lat, lon) => {
    if (!mapRef.current) return;
    mapRef.current.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 400);
  };

  // Utilities to consistently derive an ID + saved logic
  const idOf = (e) => e.slug || e.id || e.name;
  const isSaved = (e) => !!saved[idOf(e)];
  const toggleSaved = (e) => {
    const id = idOf(e);
    setSaved(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* transparent logo background  */}
      <Image
        source={require('../assets/TransparentGloblLogo.png')}
        style={styles.bgLogo}
        resizeMode="contain"
      />

      {/* header with back buton and title */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={RED} />
        </Pressable>
        <Text style={styles.headerTitle}>ParkRun</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* compact static mock stats - strip of users accomplishments */}
      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Text style={styles.statText}>You came first in the Strathclyde ParkRun!</Text>
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

      {/* local Glasgow chip selector -  quick access to local parkrun spots*/}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {PARKRUN_EVENTS.map(ev => {
          const active = ev.id === selected.id; // highlight the currently selected event
          return (
            <Pressable
              key={ev.id}
              onPress={() => {
                setSelected(ev); // update which event is selected
                setAutoFitUK(false); // stop UK auto-fit so my local zoom stays put
                zoomTo(ev.lat, ev.lon);
              }}
              style={[styles.chip, active && styles.chipActive]}
            >
              {/* Event name shown in the chip, cut off if it overflows */}
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]} numberOfLines={1}>{ev.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* info bubble reacts to selected map pin or chip of parkruns */}
      <View style={styles.infoBubble}>
        <Text style={styles.infoText}>{selected.desc}</Text>
      </View>

      {/* Main map: shows UK pins (from server) + Glasgow mocks, plus a red marker for selected */}
      <View style={[styles.mapWrap, { height: MAP_HEIGHT }]}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{ latitude: 54.5, longitude: -2.5, latitudeDelta: 7.0, longitudeDelta: 7.0 }}
        >
           {/* Server pins: teal for others, purple for saved. I set selected on pin press. */}
           {pins.map(ev => (
          <Marker 
          key={idOf(ev)}
          coordinate={{ latitude: ev.lat, longitude: ev.lng }} 
          title={ev.name}
          description={'Saturday · 09:30'}
          pinColor={isSaved(ev) ? COLOR_SAVED : COLOR_OTHER}
          onPress={() => {
            setSelected({
              id: idOf(ev),
              name: ev.name,
              desc: ev.notes || 'Parkrun — Saturday 09:30',
              lat: ev.lat,
              lon: ev.lng,
            });
          }}
        />
      ))}

        {/* My Glasgow mock pins obey the same saved colouring */}
        {PARKRUN_EVENTS.map(m => (
            <Marker
              key={`mock-${m.id}`}
              coordinate={{ latitude: m.lat, longitude: m.lon }}
              title={m.name}
              description={m.desc}
              pinColor={isSaved(m) ? COLOR_SAVED : COLOR_OTHER}
              onPress={() => {
                setSelected(m);
                setAutoFitUK(false);
                zoomTo(m.lat, m.lon);
              }}
            />
          ))}

           {/* A dedicated red marker for the currently selected item (helps users locate it) */}
           <Marker
            coordinate={{ latitude: selected.lat, longitude: selected.lon }}
            title={selected.name}
            description={selected.desc}
            pinColor={COLOR_SELECTED}
          />
        </MapView>
        
          {/* Small "All UK view" button – resets filter + re-enables auto-fit */}
          <View style={styles.ukResetWrap}>
          <Pressable
            onPress={() => { setAutoFitUK(true); setRadiusKm(null); }}
            style={styles.ukResetBtn}
          >
            <Text style={styles.ukResetTxt}>All UK view</Text>
          </Pressable>
        </View>

        {/* Floating runner button toggles the filter/legend/save pop-up */}
        <Pressable style={styles.fab} onPress={() => setFilterOpen(v => !v)}>
          <Ionicons name="walk-outline" size={22} color="#fff" />
        </Pressable>
           {/* Runner pop-up: colour legend, distance filter, and Save/Unsave for the selected item */}
           {filterOpen && (
          <View style={styles.filterBox}>
            <Text style={styles.filterTitle}>ParkRun visibility</Text>

            {/* Legend explains my colour system so users understand purple vs teal */}
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLOR_OTHER }]} />
              <Text style={styles.legendTxt}>Other ParkRuns</Text>
              <View style={[styles.legendDot, { backgroundColor: COLOR_SAVED, marginLeft: 14 }]} />
              <Text style={styles.legendTxt}>Saved ParkRuns</Text>
            </View>

            {/* Distance filter anchored on Glasgow – quick way to declutter the map */}
            <Text style={styles.subHeading}>Show ParkRuns within…</Text>
            <View style={styles.filterRow}>
               {/* Button: All UK view (resets filter + zooms map out) */}
              <Pressable
                onPress={() => { 
                  setRadiusKm(null);      // remove distance filter (null = show all UK parkruns)
                  setAutoFitUK(true);     // re-enable map autofit so it zooms to whole UK
                  setFilterOpen(false);   // close the popup after selecting
                }}
                style={[styles.filterBtn, radiusKm === null && styles.filterBtnActive]} //highlight if active
              >
                <Text style={[styles.filterTxt, radiusKm === null && styles.filterTxtActive]}>All UK</Text>
              </Pressable>

               {/* Buttons for specific distance filters (50km, 100km, 200km, 400km from Glasgow) */}
              {[50, 100, 200, 400].map(km => (
                <Pressable
                  key={km}
                  onPress={() => {
                   setRadiusKm(km);     // set distance filter (e.g., only show clubs within 100km)
                   setAutoFitUK(true);  // re-enable autofit to zoom map to filtered pins
                   setFilterOpen(false); //close pop-up after choosing
                }}
                  style={[styles.filterBtn, radiusKm === km && styles.filterBtnActive]} // highlight if active
                >
                  <Text style={[styles.filterTxt, radiusKm === km && styles.filterTxtActive]}>{km} km</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.filterHint}>
              <Ionicons name="navigate-outline" size={14} color="#0E2B32" />
              <Text style={styles.hintTxt}>from Glasgow city centre</Text>
            </View>
                {/* Save/Unsave for whichever ParkRun is currently selected (chip or pin) */}
                <View style={styles.saveRow}>
              <Text style={styles.subHeading}>Selected:</Text>
              <Text style={styles.selName} numberOfLines={1}>{selected?.name || '—'}</Text>
              <Pressable
                onPress={() => toggleSaved(selected)}
                style={[styles.saveBtn, isSaved(selected) && styles.unsaveBtn]}
              >
                <Ionicons
                  name={isSaved(selected) ? 'bookmark' : 'bookmark-outline'}
                  size={16}
                  color={isSaved(selected) ? '#fff' : '#0E2B32'}
                />
                <Text style={[styles.saveTxt, isSaved(selected) && styles.unsaveTxt]}>
                  {isSaved(selected) ? 'Unsave' : 'Save'}
                </Text>
              </Pressable>
            </View>

            {/* status badge showing loading/errorstate and data counts for demo transparency*/}
            <View style={styles.statusBadge}>
              {loading ? (
                 // CASE 1: still fetching data
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.statusTxt}>Loading…</Text>
                </View>
                 // CASE 2: fetch failed
              ) : loadErr ? (
                <Text style={styles.statusTxtErr}>Failed to load: {loadErr}</Text>
              ) : (
                //CASE 3: loading succeeded
                <Text style={styles.statusTxt}>
                  Showing {pins.length} / {dbEvents.length || 0}  ·  Saved {Object.keys(saved).filter(k => saved[k]).length}
                </Text>
              )}
            </View>
          </View>
        )}
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

  // map card - focal point of screen
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
    // UK reset button
    ukResetWrap: { position: 'absolute', top: 10, left: 10 },
    ukResetBtn: {
      backgroundColor: 'rgba(255,255,255,0.96)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    ukResetTxt: { fontWeight: '700', color: '#0E2B32', fontSize: 12 },
  
    // Floating runner action button
    fab: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLOR_OTHER,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 5,
    },
  
    // Runner pop-up content
    filterBox: {
      position: 'absolute',
      bottom: 70,
      right: 12,
      left: 12,
      backgroundColor: 'rgba(255,255,255,0.98)',
      borderRadius: 14,
      padding: 12,
      gap: 10,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    filterTitle: { color: '#0E2B32', fontSize: 14, fontWeight: '800' },
  
    // Legend (teal vs purple)
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendTxt: { color: '#0E2B32', fontSize: 12, fontWeight: '700' },
  
    // Distance filter controls
    subHeading: { color: '#0E2B32', fontSize: 12, fontWeight: '800', marginTop: 2 },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    filterBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#eef2f7' },
    filterBtnActive: { backgroundColor: COLOR_OTHER },
    filterTxt: { fontSize: 12, fontWeight: '800', color: '#0E2B32' },
    filterTxtActive: { color: '#fff' },
    filterHint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    hintTxt: { color: '#0E2B32', fontSize: 12, fontWeight: '700' },
  
    // Save/Unsave row for the selected ParkRun
    saveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'nowrap' },
    selName: { flex: 1, color: '#0E2B32', fontSize: 12, fontWeight: '700' },
    saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#eef2f7' },
    unsaveBtn: { backgroundColor: COLOR_SAVED },
    saveTxt: { fontSize: 12, fontWeight: '800', color: '#0E2B32' },
    unsaveTxt: { color: '#fff' },
  
    // Status badge (for demo/debugging)
    statusBadge: { alignSelf: 'flex-start', backgroundColor: '#eef2f7', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
    statusTxt: { color: '#0E2B32', fontWeight: '700', fontSize: 12 },
    statusTxtErr: { color: '#b91c1c', fontWeight: '800', fontSize: 12 },
});

