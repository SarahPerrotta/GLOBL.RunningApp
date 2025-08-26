import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, SafeAreaView, Dimensions, ActivityIndicator} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';

const RED = '#DE1E26';
const BASE = 'https://globl-runningapp.onrender.com';
const { height: SCREEN_HEIGHT } = Dimensions.get ('window');
const MAP_HEIGHT = Math.min(520, Math.max(360, SCREEN_HEIGHT * 0.55));

// Runclub pin colours
const COLOR_OTHER = '#0ea5a8';   // teal = not saved
const COLOR_SAVED = '#7c3aed';   // purple = saved
const COLOR_SELECTED = '#ef4444';// red = selected highlight

// Glasgow as users set location, anchor for distance filtering
const GLASGOW = { lat: 55.8642, lng: -4.2518 };

// generated Glasgow clubs mock data with unique ids for fallback use
const FALLBACK_CLUBS = [
  { id: 'westend__55.879900_-4.300900', name: 'West End Road Runners', desc: 'Meets Tuesday & Thursday', lat: 55.8799, lng: -4.3009 },
  { id: 'bellahouston__55.838600_-4.312800', name: 'Bellahouston Road Runners', desc: 'Tue/Thu 18:30 · Bellahouston', lat: 55.8386, lng: -4.3128 },
  { id: 'giffnock__55.803600_-4.297400', name: 'Giffnock North AC', desc: 'Track + road · Wed 19:00', lat: 55.8036, lng: -4.2974 },
];

// Simple key helper; key6 creates a unique, repeatable ID for each run club, combining its name and precise location.
const key6 = (name, lat, lng) =>
  `${(name || 'Run Club').trim()}__${Number(lat).toFixed(6)}_${Number(lng).toFixed(6)}`;

// Haversine (formula) distance in km so I can filter by radius from Glasgow 
// distKm(a, b) takes two GPS coordinates and returns the shortest distance between them on Earth’s curved surface, in kilometres.
const distKm = (a, b) => {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
};

export default function RunClubScreen({ navigation }) {
    // pinned card + selected marker on a glasgow 'fallback' club 
    const [pinned, setPinned] = useState(FALLBACK_CLUBS[0]);
    const [selected, setSelected] = useState({ ...FALLBACK_CLUBS[0] });
  
    // run clubs from backend, loading spinner, and error message
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadErr, setLoadErr] = useState('');
  
    // saved state (MVP in-memory)
    const [saved, setSaved] = useState({}); // id boolean
  
    // filter UI state
    const [filterOpen, setFilterOpen] = useState(false);
    const [radiusKm, setRadiusKm] = useState(null); // null = All UK
    const [autoFitUK, setAutoFitUK] = useState(true);
  
    const mapRef = useRef(null);
  
    // fetch clubs from server
    useEffect(() => { // useEffect hook, marks loading apps
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          setLoadErr('');
          const res = await fetch(`${BASE}/api/runclubs`); //asks server for /api/runclubs
          if (!res.ok) throw new Error(`HTTP ${res.status}`); // if 'ok', it reads JSON into memory otherwise error
          const data = await res.json();

          // normalise the raw JSON data that comes back from server ('cleans it')
          const norm = (Array.isArray(data) ? data : []) // ensures data is an array
            .map(e => { //loops through every item in the array (each e is a potential run club entry).
              const name = (e.name || e.title || 'Run Club').toString().trim(); 
              const lat = Number(e.lat); // force the lat and lng into numbers 
              const lng = Number(e.lng);
              const desc = (e.notes || '').toString(); // if notes exist, use it. otherwise default to an empty string
              const id = (e.slug || e.id || key6(name, lat, lng)).toString(); // use identifier for the record, always a string so identifier doesn't break
              return { id, name, desc, lat, lng }; // new clean object suited for mobile app
            })
            .filter(e => Number.isFinite(e.lat) && Number.isFinite(e.lng) && e.name.length > 0); //filtering invalid entries
  
          // de-duplication of runclubs by name and coordinates
          const uniqMap = new Map(); // creating a Map, better for lookups
          for (const r of norm) { //loop
            const k = key6(r.name, r.lat, r.lng); //calls key6 and creats a string
            if (!uniqMap.has(k)) uniqMap.set(k, { ...r, id: r.id || k }); // double checks if on the map
          }
          const unique = Array.from(uniqMap.values());
  
          if (!mounted) return; //update react state with clean and unique list of clubs
          setClubs(unique);

          // align pinned/selected if server contains it
        const pinKey = key6(pinned.name, pinned.lat, pinned.lng); //build stable key for currently pinned club from coordinates
        const match = unique.find(c => key6(c.name, c.lat, c.lng) === pinKey) || //try find same club inside fresh server list
                      unique.find(c => c.name === pinned.name);                  //if matching by coordinates fails match by name (MVP)
        if (match) { //if match is found replace my locally pinned/selected club with the authoritative server record (keeps ids/notes/coords in sync)
          setPinned(match); 
          setSelected(match);
        }
      } catch (err) { //if anything threw above, stash reable error so ui can show it
        if (mounted) setLoadErr(String(err?.message || err));
      } finally { //wheather success or failure, mark loading as finished
        if (mounted) setLoading(false);
      }
    })(); //end the sync that did the fetching/ normalising

    return () => { mounted = false; }; //ensure that the 'mounted' flag wont set on an unmounted component
  }, []); //run once onmount

  // Clubs: prefer server if available, fallback otherwise
  const clubsSource = useMemo(() => (clubs.length ? clubs : FALLBACK_CLUBS), [clubs])

   // Apply Glasgow radius filter to the merged list
  const pins = useMemo(() => {
    if (!radiusKm) return clubsSource;
    return clubsSource.filter(e => distKm(GLASGOW, { lat: e.lat, lng: e.lng }) <= radiusKm);
  }, [clubsSource, radiusKm]);
   
   /*this hook ensures that if user taps 'All UK view', the map automatically zooms out to show all pins. 
   otherwise show the full of the uk if no pins are within a certain radius */
  useEffect(() => {
    if (!mapRef.current || !autoFitUK) return; //dependency of the pins 
    if (pins.length > 0) { 
      mapRef.current.fitToCoordinates( //makes all coordinates visible 
        pins.map(e => ({ latitude: e.lat, longitude: e.lng })),
        { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true } //these margins prevent markers at edge of screen
     );
   } else {
   // UK fallback region view by default if no pins 
    mapRef.current.animateToRegion(
      { latitude: 54.5, longitude: -2.5, latitudeDelta: 7.0, longitudeDelta: 7.0 },
      500
    );
  }
}, [pins, autoFitUK]);
  
  // local zoom helper
 const zoomTo = (lat, lng) => {
      if (!mapRef.current) return;
      mapRef.current.animateToRegion( //moves the camera to focus on the given lat/lng.
        { latitude: lat, longitude: lng, latitudeDelta: 0.08, longitudeDelta: 0.08 }, //control zoom level (smaller = more zoomed in).
        350 //animation duration in milliseconds.
      );
    };
      //saved helpers
     const idOf = e => e.id || key6(e.name, e.lat, e.lng); //idOf - ensures every club has a unique identifier, If e.id exists, use that. Otherwise fall back to key6()
     const isSaved = e => !!saved[idOf(e)]; //checks if club's ID exists in saved state, !! converts into boolean, true if saved/false not saved.
     const toggleSaved = e => { // user can use toggle feature to save/unsave Runclub
       const id = idOf(e);
       setSaved(prev => ({ ...prev, [id]: !prev[id] }));
    };

  return (
    <SafeAreaView style={styles.container}>
      {/* background logo */}
      <Image
        source={require('../assets/TransparentGloblLogo.png')}
        style={styles.bgLogo}
        resizeMode="contain"
      />

      {/* Header with back button and title*/}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={RED} />
        </Pressable>
        <Text style={styles.headerTitle}>Run Clubs</Text>
        <View style={{ width: 40 }} />
      </View>

      
      {/* Pinned club card  */}
     <View style={styles.pinnedPill}>
       <Ionicons name="location" size={18} color={RED} style={{ marginRight: 10 }} />
       <View style={{ flex: 1 }}>
         <Text style={styles.pinnedText}>{pinned?.name || 'Pinned Run Club'}</Text>
         <Text style={styles.pinnedSub}>{pinned?.desc || 'Tap a pin to set this'}</Text>
       </View>
     </View>


      {/* Two-column stats*/}
      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{'Attended 4\nRun Clubs\nworldwide'}</Text>
        </View>
        <View style={styles.vDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statText}>{'3 friends\nadded via\nRunClubs'}</Text>
        </View>
      </View>

      {/* Map card Glasgow,Scotland - fits to screen*/}
      <View style={[styles.mapWrap, {height: MAP_HEIGHT}]}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          // UK‑wide default; auto‑fit will adjust once data is in
          initialRegion={{  latitude: 54.5, longitude: -2.5, latitudeDelta: 7.0, longitudeDelta: 7.0 }}
            >
              {/* Visible clubs (server or fallback). Saved = purple; others = teal */}
              {pins.map((ev, idx) => {
                const k = `${idOf(ev)}::${idx}`; // robust unique key
                return (
                  <Marker
                    key={k}
                    coordinate={{ latitude: ev.lat, longitude: ev.lng }}
                    title={ev.name}
                    description={ev.desc || 'Club sessions . see details'}
                    pinColor={isSaved(ev) ? COLOR_SAVED : COLOR_OTHER}
                    onPress={() => {
                      const s = { id: idOf(ev), name: ev.name, desc: ev.desc, lat: ev.lat, lng: ev.lng };
                      setSelected(s);
                      setPinned(s);          // keep card in sync
                      setAutoFitUK(false);   // stop autofit when focusing locally
                      zoomTo(ev.lat, ev.lng);
                    }}
                  />
                );
              })}
          {/* selected pin is red, for clarity */}
          {selected?.lat && selected?.lng && (
            <Marker
              coordinate={{ latitude: selected.lat, longitude: selected.lng }}
              title={selected.name}
              description={selected.desc}
              pinColor={COLOR_SELECTED}
            />
          )}
        </MapView>
               {/* UK reset button (restores all uk view and re-enables autofit) */}
               <View style={styles.ukResetWrap}>
               <Pressable
                 onPress={() => { setAutoFitUK(true); setRadiusKm(null); }}
                 style={styles.ukResetBtn}
               >
                 <Text style={styles.ukResetTxt}>All UK view</Text>
               </Pressable>
             </View>
     
             {/* FAB teal runner icon - toggles users filter/legend/save pop-up */}
             <Pressable style={styles.fab} onPress={() => setFilterOpen(v => !v)}>
               <Ionicons name="walk-outline" size={22} color="#fff" />
             </Pressable>
     
             {/* Filter / Legend / Save pop-up */}
             {filterOpen && (
               <View style={styles.filterBox}>
                 <Text style={styles.filterTitle}>Run Club visibility</Text>

            {/* legend so users understand purple vs teal */}
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLOR_OTHER }]} />
              <Text style={styles.legendTxt}>Other Clubs</Text>
              <View style={[styles.legendDot, { backgroundColor: COLOR_SAVED, marginLeft: 14 }]} />
              <Text style={styles.legendTxt}>Saved Clubs</Text>
            </View>

            {/* distance filtering UI */}
            <Text style={styles.subHeading}>Show clubs within…</Text>
            <View style={styles.filterRow}>
              {/* First button = "All UK" (ignores radius) */}
              <Pressable
                onPress={() => { 
                  setRadiusKm(null);       // null = no filter, show all clubs
                  setAutoFitUK(true);      // re-enable auto-fit so map zooms to whole of UK
                  setFilterOpen(false); }} // close the filter popup after closing
                style={[
                  styles.filterBtn, 
                  radiusKm === null && styles.filterBtnActive]} // highlight if active
              >
                 {/* Label for this button, styled differently if it’s active */}
                <Text style={[
                  styles.filterTxt, 
                  radiusKm === null && styles.filterTxtActive
                  ]}>
                    All UK
                  </Text>
              </Pressable>

              {/* Generate a button for each numeric radius (50, 100, 200, 400 km) */}
              {[50, 100, 200, 400].map(km => (
                <Pressable
                  key={km}
                  onPress={() => { 
                    setRadiusKm(km);        // update radius to the chosen km
                    setAutoFitUK(true);     // re-fit map to filtered clubs
                    setFilterOpen(false);   // close popup after selection
                  }} 
                  style={[
                    styles.filterBtn, 
                    radiusKm === km && styles.filterBtnActive //highlight if active
                  ]}
                >
                  {/* Button label shows distance, styled differently if active */}
                  <Text style={[
                    styles.filterTxt, 
                    radiusKm === km && styles.filterTxtActive
                    ]}>
                      {km} km
                      </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.filterHint}>
              <Ionicons name="navigate-outline" size={14} color="#0E2B32" />
              <Text style={styles.hintTxt}>from Glasgow city centre</Text>
            </View>
             {/* Save/Unsave currently selected club */}
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
              
             {/* status pill (inside the popup) */}
             <View style={styles.statusBadgeInner}>
               {loading ? (
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.statusTxt}>Loading…</Text>
                </View>
              ) : loadErr ? (
                <Text style={styles.statusTxtErr}>Offline · {pins.length} clubs</Text>
              ) : (
                <Text style={styles.statusTxt}>
                  Showing {pins.length} / {(clubsSource?.length || 0)} · Saved {Object.values(saved).filter(Boolean).length}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* tiny status pill (top-right of map) */}
        <View style={styles.statusBadge}>
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ActivityIndicator size="small" />
              <Text style={styles.statusTxt}>Loading clubs…</Text>
            </View>
          ) : loadErr ? (
            <Text style={styles.statusTxtErr}>Offline · {pins.length} clubs</Text>
          ) : (
            <Text style={styles.statusTxt}>Showing {pins.length} clubs</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RED, paddingBottom: 0 },
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
 //pinned club pill 
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

  // UK reset
  ukResetWrap: { position: 'absolute', top: 10, left: 10 },
  ukResetBtn: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  ukResetTxt: { fontWeight: '700', color: '#0E2B32', fontSize: 12 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 12, right: 12,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLOR_OTHER,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },

  // Filter popup
  filterBox: {
    position: 'absolute',
    bottom: 70, right: 12, left: 12,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 14, padding: 12, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  filterTitle: { color: '#0E2B32', fontSize: 14, fontWeight: '800' },

  // Legend + distance controls
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendTxt: { color: '#0E2B32', fontSize: 12, fontWeight: '700' },

  subHeading: { color: '#0E2B32', fontSize: 12, fontWeight: '800', marginTop: 2 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#eef2f7' },
  filterBtnActive: { backgroundColor: COLOR_OTHER },
  filterTxt: { fontSize: 12, fontWeight: '800', color: '#0E2B32' },
  filterTxtActive: { color: '#fff' },
  filterHint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hintTxt: { color: '#0E2B32', fontSize: 12, fontWeight: '700' },

  // Save row
  saveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'nowrap' },
  selName: { flex: 1, color: '#0E2B32', fontSize: 12, fontWeight: '700' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#eef2f7' },
  unsaveBtn: { backgroundColor: COLOR_SAVED },
  saveTxt: { fontSize: 12, fontWeight: '800', color: '#0E2B32' },
  unsaveTxt: { color: '#fff' },

  // Status badges
  statusBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  statusBadgeInner: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2f7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusTxt: { color: '#0E2B32', fontWeight: '700', fontSize: 12 },
  statusTxtErr: { color: '#b91c1c', fontWeight: '800', fontSize: 12 },
});