import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* apps core colors */
const COLORS = {
  brand: '#DE1E26',
  text: '#0E2B32',
  white: '#FFFFFF',
  gray: '#6B7280',
  border: '#D1D5DB',
  dark: '#1F2937',
};

/* square checkboxes */
function SquareCheckbox({ checked, onToggle, size = 28 }) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: '#222',
          backgroundColor: checked ? COLORS.brand : COLORS.white,
          alignItems: 'center',
          justifyContent: 'center',
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      {checked ? <Ionicons name="checkmark" size={18} color={COLORS.white} /> : null}
    </Pressable>
  );
}

/* keys to make sure users choices are remembered locally */
const KEYS = {
  agreeFindable: 'settings_agree_findable',
  incognito: 'settings_incognito',
  gps: 'settings_gps',
  notifications: 'settings_notifications',
  savedAt: 'settings_saved_at',
};

export default function SettingsScreen({ navigation }) {
  const [agreeFindable, setAgreeFindable] = useState(false);
  const [incognito, setIncognito] = useState(false);
  const [gps, setGps] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  /* load saved values once */
  useEffect(() => {
    (async () => {
      try {
        const [a, i, g, n, t] = await Promise.all([
          AsyncStorage.getItem(KEYS.agreeFindable),
          AsyncStorage.getItem(KEYS.incognito),
          AsyncStorage.getItem(KEYS.gps),
          AsyncStorage.getItem(KEYS.notifications),
          AsyncStorage.getItem(KEYS.savedAt),
        ]);
        if (a !== null) setAgreeFindable(a === 'true');
        if (i !== null) setIncognito(i === 'true');
        if (g !== null) setGps(g === 'true');
        if (n !== null) setNotifications(n === 'true');
        if (t) setSavedAt(t);
      } catch (e) {
        console.warn('Load settings failed', e);
      }
    })();
  }, []);

  /* Save everything and record a timestamp */
  const saveAll = async () => {
    try {
      const timestamp = new Date().toISOString();
      await Promise.all([
        AsyncStorage.setItem(KEYS.agreeFindable, String(agreeFindable)),
        AsyncStorage.setItem(KEYS.incognito, String(incognito)),
        AsyncStorage.setItem(KEYS.gps, String(gps)),
        AsyncStorage.setItem(KEYS.notifications, String(notifications)),
        AsyncStorage.setItem(KEYS.savedAt, timestamp),
      ]);
      setSavedAt(timestamp);
    } catch (e) {
      console.warn('Save settings failed', e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.brand }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.navigate('NavigationHub')}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Back to Navigation"
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.brand} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permission card design */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>GLOBL. Permission form</Text>

          <View style={styles.row}>
            <SquareCheckbox checked={agreeFindable} onToggle={() => setAgreeFindable(v => !v)} />
            <Text style={styles.rowText}>
              By ticking this you agree that GLOBL. users can find you via the email you signed up with.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <SquareCheckbox checked={incognito} onToggle={() => setIncognito(v => !v)} />
            <Text style={styles.rowText}>
              Selecting incognito mode hides your profile from other GLOBL. users worldwide. You will not appear in friend suggestions.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <SquareCheckbox checked={gps} onToggle={() => setGps(v => !v)} />
            <Text style={styles.rowText}>
              Tick this box if you accept GLOBL. using your device GPS to retrieve map data.
            </Text>
          </View>
        </View>

        {/* Notifications pill row */}
        <View style={styles.pill}>
          <Text style={[styles.pillText, { flex: 1 }]}>Notifications switched on</Text>
          <SquareCheckbox checked={notifications} onToggle={() => setNotifications(v => !v)} size={26} />
        </View>

        {/* Save + Sign out actions */}
        <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]} onPress={saveAll}>
          <Text style={styles.primaryText}>Save Settings</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.9 }]} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        {/* Save confirmation */}
        {savedAt ? (
          <Text style={styles.savedNote}>
            Settings saved {new Date(savedAt).toLocaleString()}
          </Text>
        ) : null}

        <View style={{ height: 12 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* SettingsScreen style */
const styles = StyleSheet.create({
  /* header */
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white,
  },
  headerTitle: { flex: 1, textAlign: 'center', color: COLORS.white, fontSize: 30, fontWeight: '500' },
  headerSpacer: { width: 36, height: 36 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },

  content: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 30, gap: 14 },

  /* white permission card */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    color: COLORS.text,
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rowText: { flex: 1, fontSize: 14, color: '#111827', lineHeight: 20 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },

  /* notifications pill */
  pill: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: { fontSize: 15, color: '#111827', fontWeight: '600' },

  /* actions */
  primaryBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  signOut: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: { fontSize: 18, fontWeight: '700', color: COLORS.brand },
});
