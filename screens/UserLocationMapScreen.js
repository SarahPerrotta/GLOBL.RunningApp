import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal,
  TextInput, KeyboardAvoidingView, Platform, FlatList, ScrollView, Pressable } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomNav from '../components/BottomNav';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';

// mock static dataset for Glasgow ParkRuns and Run Clubs.
// These are used for location type-ahead suggestions for logging runs.
const GLASGOW_PLACES = [
  { name: 'Pollok parkrun (Pollok Park)',        lat: 55.8249, lng: -4.3137 },
  { name: 'Victoria parkrun, Glasgow',           lat: 55.8734, lng: -4.3118 },
  { name: 'Springburn parkrun (Alexandra Park)', lat: 55.8674, lng: -4.2103 },
  { name: 'Drumchapel parkrun',                  lat: 55.9190, lng: -4.3656 },
  { name: 'Queen’s parkrun (Queen’s Park)',      lat: 55.8356, lng: -4.2676 },
  { name: 'Glasgow Green parkrun',               lat: 55.8530, lng: -4.2367 },
  { name: 'Bellahouston Road Runners',           lat: 55.8391, lng: -4.3135 },
  { name: 'Glasgow FrontRunners',                lat: 55.8681, lng: -4.2703 },
];

const COLORS = {
  brand: '#DE1E26', // main brand red used for headers, buttons, markers
  text: '#0E2B32',    // dark text colour for high readability
  dim: '#6B7280',     // muted grey used for secondary text and placeholders
  bg: '#FFFFFF',      // default white background
  card: '#FFFFFF',    // white for cards and panels
  border: '#E5E7EB',  // light grey for borders and dividers
};

export default function UserLocationMapScreen({ navigation }) {
  // Default map centre (Glasgow) -this acts as user’s GPS location for MVP.
  const userLat = 55.8642;
  const userLng = -4.2518;

  const initialRegion = useMemo(() => ({
    latitude: userLat,
    longitude: userLng,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  }), []);

  // State for runs (from Firestore) and UI
  const [runs, setRuns] = useState([]); // 
  const [logOpen, setLogOpen] = useState(false);        //controls whether the quick log form slides up on screen.
  const [distanceKm, setDistanceKm] = useState('');     //saved into Firestore when logging a run.
  const [durationMin, setDurationMin] = useState('');   // display log run distance and time in firestore
  const [locationText, setLocationText] = useState(''); //displayed in the run log and used for heatmap naming.
  const [selectedCoords, setSelectedCoords] = useState(null); //plots exact run locations on the heatmap.
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10)); //displays the date of the run in “my runs" list.
  const [saving, setSaving] = useState(false);           //disable Save button and change text to "Saving..."
  const [errorMsg, setErrorMsg] = useState('');          // shows error
  const [activeTab, setActiveTab] = useState('HEAT');     // toggles between "Heat Map" and "My Runs"
  const [showSuggestions, setShowSuggestions] = useState(false); //hides the ParkRun / Run Club type-ahead list.

  // Real-time Firestore listener for the "runs" collection
  useEffect(() => {
    // build a query on 'runs' collection, order newest first by createdAt
    const q = query(collection(db, 'runs'), orderBy('createdAt', 'desc'));
    // subscribe to updates with onSnapshot
    const unsub = onSnapshot(
      q,
      (snap) => {
        // map each Firestore document into a plain JS object
        const list = snap.docs.map((doc) => {
          const d = doc.data() || {};
          return {
            id: doc.id,                  //document id
            distanceKm: d.distanceKm,   // distance of run
            durationMin: d.durationMin, //time of run
            location: d.location,       // {label, lat, lng}
            date: d.date,               //run date string
            createdAt: d.createdAt?.toDate?.() ?? new Date(d.createdAt),
          };
        });
        // update local state so UI re-renders with latest runs
        setRuns(list);
      },
      (err) => {
        // if snapshot fails, log warning 
        console.warn('Firestore listener error:', err?.code || err?.message);
        setErrorMsg(String(err?.message || err?.code || 'Listener error'));
      }
    );
    // unsubscribe from listener when component unmounts
    return () => unsub();
  }, []);

  // Validation check for saving a run
  // only allow Save if distance & duration are numbers, date is YYYY-MM-DD, and location not empty
  const canSave =
    distanceKm.trim() !== '' &&                  
    !Number.isNaN(Number(distanceKm)) &&
    durationMin.trim() !== '' &&
    !Number.isNaN(Number(durationMin)) &&
    dateStr.match(/^\d{4}-\d{2}-\d{2}$/) &&
    locationText.trim() !== '';

  // clears form: reset inputs, coords, suggestions, error messsage, date back to today
  const resetForm = () => {
    setDistanceKm('');
    setDurationMin('');
    setLocationText('');
    setSelectedCoords(null);
    setDateStr(new Date().toISOString().slice(0, 10));
    setShowSuggestions(false);
    setErrorMsg('');
  };

  // Save a run to Firestore
  const handleSaveRun = async () => {
    // don’t run if form fails validation
    if (!canSave) return;
    try {
      setSaving(true); //flag, saving in progress
      setErrorMsg('');  // clear any old error

      // coords: use suggestion or long-press if available
      let lat = selectedCoords?.lat ?? null;
      let lng = selectedCoords?.lng ?? null;
      
      // if no coords selected; try to parse "lat, lng" from text input
      if (lat == null || lng == null) {
        const parts = locationText.split(',').map(s => s.trim());
        if (parts.length === 2) {
          const nLat = Number(parts[0]);
          const nLng = Number(parts[1]);
          if (!Number.isNaN(nLat) && !Number.isNaN(nLng)) {
            lat = nLat; lng = nLng;
          }
        }
      }

      // create new doc in Firestore 'runs' collection
      await addDoc(collection(db, 'runs'), {
        distanceKm: Number(distanceKm),
        durationMin: Number(durationMin),
        location: { label: locationText, lat, lng },
        date: dateStr,
        createdAt: serverTimestamp(),
      });

      // Reset state after saved success
      setSaving(false);     // stop "saving…" state
      setLogOpen(false);    // close the log run 
      resetForm();           // clear all form inputs
      setActiveTab('HEAT');   // switch back to Heat Map tab
    } catch (e) {
      setSaving(false);     // if save fails; stop saving and show error message
      const msg = e?.message || e?.code || 'Failed to save run';
      setErrorMsg(msg);       //show error message 
      console.warn('Save run error:', msg); // log to console for debugging
    }
  };

  // Build heatmap 'buckets' by grouping runs with nearby coordinates
  const heatBuckets = useMemo(() => {
    const buckets = new Map(); // Map() used here as a lookup table keyed by lat+lng strings

      // helper function rounds coordinates to 3 decimal places (~100m radius).
      // This prevents tiny GPS variations from creating separate points.
    const round = (n) => Math.round(n * 1000) / 1000; 

    runs.forEach(r => {
      const loc = r?.location;
      if (!loc) return; // skip runs without a location

      if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        // round coords to make a bucket key (so nearby runs get grouped)
        const key = `${round(loc.lat)},${round(loc.lng)}`;
        // if bucket exists, use it; else create new bucket
        const current = buckets.get(key) || {
          lat: round(loc.lat),
          lng: round(loc.lng),
          count: 0,          // number of runs in this bucket
          labels: {},         // track how many times each label was used here
        };
        current.count += 1;   // increment run count for this bucket
        const label = (loc.label || '').trim();
        // track how many times each location name was used in this bucket (to choose most common later)
        if (label) current.labels[label] = (current.labels[label] || 0) + 1;
        buckets.set(key, current);   // save bucket back into the Map
      }
    });

    let max = 0;
    // find the highest run count across all buckets (used for normalising intensity)
    buckets.forEach(b => { if (b.count > max) max = b.count; });

    return Array.from(buckets.values()).map(b => {
      let bestLabel = '';
      let bestCount = 0;
      // choose the most frequent label for this bucket
      Object.entries(b.labels).forEach(([lbl, c]) => {
        if (c > bestCount) { bestLabel = lbl; bestCount = c; }
      });
      // fallback: if no label stored, show coords instead
      if (!bestLabel) bestLabel = `${b.lat.toFixed(3)}, ${b.lng.toFixed(3)}`;
      // pick name + scale intensity (0–1) so hotspots with more runs show denser, but still one bucket marker
      return { ...b, name: bestLabel, intensity: max ? b.count / max : 0 };
    });
  }, [runs]);

  // when the user long-press on the map it will prefills coords in the form
  const handleLongPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate || {};
    // only continue if both values are numbers
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      // fill location field with coords string
      setLocationText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      // store coords object for later (heatmap, saving run)
      setSelectedCoords({ lat: latitude, lng: longitude });
      //open run log straight away
      setLogOpen(true);
    }
  };

  // Suggestion filtering for Glasgow running locations, list based on input text
  const filteredSuggestions = useMemo(() => {
    const q = locationText.trim().toLowerCase(); //case-insensitive
    if (!q) return [];
    return GLASGOW_PLACES.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8); // only return top 8 matches
  }, [locationText]);

  // pickSuggestion fills input, coords then hides dropdown
  const pickSuggestion = (place) => {
    setLocationText(place.name);
    setSelectedCoords({ lat: place.lat, lng: place.lng });
    setShowSuggestions(false);
  };
  // typing again resets coords and toggles dropdown
  const onChangeLocationText = (t) => {
    setLocationText(t);
    setSelectedCoords(null);
    setShowSuggestions(!!t.trim());
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Red header with chevron back and centered title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityLabel="Back">
          <Icon name="chevron-left" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Location</Text>
      </View>

      {/* Map with user location marker, heatmap overlays, and add button */}
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}   // centre map on Glasgow (or user coords later)
          onLongPress={handleLongPress}   // allow long-press to prefill run location
        >
          {/* fixed marker for current user location */}
          <Marker coordinate={{ latitude: userLat, longitude: userLng }} title="You are here" />

          {/* loop through heatBuckets -> draw one circle + marker per hotspot */}
          {heatBuckets.map((b) => {
            // radius of heatmap circle and intensity
            const radius = 150 + 450 * b.intensity;
            const alpha = 0.18 + 0.27 * b.intensity;
            return (
              <React.Fragment key={`${b.lat},${b.lng}`}>
                 {/* hotspot circle showing density */}
                <Circle
                  center={{ latitude: b.lat, longitude: b.lng }}
                  radius={radius}
                  strokeColor="rgba(222,30,38,0.0)" //no stroke outline
                  fillColor={`rgba(222,30,38,${alpha.toFixed(2)})`} //opacity; red fill
                />
                {/* marker dot at hotspot centre w/ popup info */}
                <Marker
                  coordinate={{ latitude: b.lat, longitude: b.lng }}
                  title={b.name}        // most common label or coords
                  description={`${b.count} run${b.count > 1 ? 's' : ''}`} // e.g. "5 runs"
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View style={styles.heatDot}/>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapView>

        <TouchableOpacity style={styles.fab} onPress={() => setLogOpen(true)} accessibilityLabel="Quick log run">
          <Icon name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom panel with tabs: Heat Map or My Runs */}
      <View style={styles.panel}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'HEAT' && styles.tabBtnActive]}
            onPress={() => setActiveTab('HEAT')}
          >
            <Text style={[styles.tabText, activeTab === 'HEAT' && styles.tabTextActive]}>Heat Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'RUNS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('RUNS')}
          >
            <Text style={[styles.tabText, activeTab === 'RUNS' && styles.tabTextActive]}>My Runs</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'HEAT' ? (
          <View style={styles.heatLegend}>
            <Text style={styles.legendTitle}>Your hotspots</Text>
            {heatBuckets.length === 0 ? (
              <Text style={styles.legendEmpty}>
                No hotspots yet. Log a run (type a place or long-press the map) to see heat.
              </Text>
            ) : (
              heatBuckets
                .sort((a, b) => b.count - a.count)
                .slice(0, 6)
                .map((b) => (
                  <View key={`${b.lat},${b.lng}`} style={styles.legendItem}>
                    <View style={[styles.dot, { opacity: 0.5 + 0.5 * b.intensity }]} />
                    <Text style={styles.legendText}>
                      {b.name} — {b.count} run{b.count > 1 ? 's' : ''}
                    </Text>
                  </View>
                ))
            )}
          </View>
        ) : (
          <FlatList
            data={runs}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
            ListEmptyComponent={<Text style={styles.legendEmpty}>No runs yet. Tap + to log your first run.</Text>}
            renderItem={({ item }) => (
              <View style={styles.runCard}>
                <View style={styles.runRow}>
                  <Text style={styles.runTitle}>{item.date}</Text>
                  <Text style={styles.runMeta}>{item.distanceKm} km • {item.durationMin} min</Text>
                </View>
                <Text style={styles.runLoc} numberOfLines={1}>
                  <Icon name="place" size={14} /> {item.location?.label || '—'}
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Bottom navigation bar */}
      <BottomNav navigation={navigation} active="CurrentLocation" />

      {/* Modal for logging a run */}
      <Modal visible={logOpen} transparent animationType="slide" onRequestClose={() => setLogOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          style={styles.modalWrapper}
        >
          <View style={styles.sheet}>
            <View style={styles.handleBar} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Quick Log Run</Text>
              <TouchableOpacity onPress={() => setLogOpen(false)}>
                <Icon name="close" size={22} color={COLORS.dim} />
              </TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Distance (km)</Text>
              <TextInput
                value={distanceKm}
                onChangeText={setDistanceKm}
                keyboardType="decimal-pad"
                placeholder="e.g., 5"
                placeholderTextColor={COLORS.dim}
                style={styles.input}
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Time (minutes)</Text>
              <TextInput
                value={durationMin}
                onChangeText={setDurationMin}
                keyboardType="number-pad"
                placeholder="e.g., 32"
                placeholderTextColor={COLORS.dim}
                style={styles.input}
              />
            </View>

            {/* Location input with suggestions dropdown */}
            <View style={styles.formRow}>
              <Text style={styles.label}>Location (search Glasgow ParkRuns/Clubs or paste "lat, lng")</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={locationText}
                  onChangeText={onChangeLocationText}
                  onFocus={() => setShowSuggestions(!!locationText.trim())}
                  placeholder="Start typing… e.g., Kelvingrove, Pollok, Victoria…"
                  placeholderTextColor={COLORS.dim}
                  style={styles.input}
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <View style={styles.suggestionsBox}>
                    <ScrollView keyboardShouldPersistTaps="handled">
                      {filteredSuggestions.map((place) => (
                        <Pressable key={`${place.name}-${place.lat}`} style={styles.suggestionItem} onPress={() => pickSuggestion(place)}>
                          <Icon name="place" size={18} color={COLORS.brand} />
                          <Text numberOfLines={1} style={styles.suggestionText}>{place.name}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput
                value={dateStr}
                onChangeText={setDateStr}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.dim}
                style={styles.input}
              />
            </View>

            {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={resetForm}>
                <Text style={styles.secondaryBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, !canSave || saving ? styles.btnDisabled : null]}
                onPress={handleSaveRun}
                disabled={!canSave || saving}
              >
                <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save Run'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// Style definitions
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    backgroundColor: COLORS.brand,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: { position: 'absolute', left: 12, padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  mapWrapper: { flex: 1, position: 'relative' },
  map: { flex: 1 },

  heatDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.brand },

  fab: {
    position: 'absolute', right: 18, bottom: 260,
    width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.brand,
    alignItems: 'center', justifyContent: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3,
  },

  panel: {
    height: 200,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  tabRow: { flexDirection: 'row', padding: 10, gap: 8 },
  tabBtn: {
    flex: 1, paddingVertical: 10, backgroundColor: '#F3F4F6',
    borderRadius: 999, alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: COLORS.brand + '22', borderWidth: 1, borderColor: COLORS.brand },
  tabText: { color: COLORS.dim, fontWeight: '600' },
  tabTextActive: { color: COLORS.brand },

  heatLegend: { paddingHorizontal: 14, paddingVertical: 8, gap: 6, flex: 1 },
  legendTitle: { color: COLORS.text, fontWeight: '700' },
  legendEmpty: { color: COLORS.dim, marginTop: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.brand },

  runCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  runRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  runTitle: { fontWeight: '700', color: COLORS.text },
  runMeta: { color: COLORS.dim, fontWeight: '600' },
  runLoc: { marginTop: 6, color: COLORS.text },

  modalWrapper: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 24 },
  handleBar: { alignSelf: 'center', width: 48, height: 5, borderRadius: 999, backgroundColor: '#E5E7EB', marginBottom: 12 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },

  formRow: { marginTop: 12 },
  label: { fontSize: 13, color: COLORS.dim, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: COLORS.text, backgroundColor: '#FFFFFF',
  },

  sheetActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 18 },
  secondaryBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  secondaryBtnText: { color: COLORS.text, fontWeight: '600' },
  primaryBtn: { flex: 1, backgroundColor: COLORS.brand, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },

  error: { color: '#DC2626', marginTop: 8 },

  suggestionsBox: {
    position: 'absolute',
    top: 48, left: 0, right: 0,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, maxHeight: 180,
    zIndex: 20, elevation: 6, overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border,
  },
  suggestionText: { color: COLORS.text, flexShrink: 1 },
});