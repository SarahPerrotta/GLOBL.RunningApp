import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function ProfileScreen({ navigation }) {
  // Incognito toggle (icon + label swap) -- Link this incognito status to other pages.
  const [isIncognito, setIsIncognito] = useState(false);
  const toggleIncognito = () => setIsIncognito(v => !v);

  // weekly stats (static for MVP)
  const stats = [
    'You attended 1 ParkRun.',
    '3 GLOBL. Runners befriended.',
    'Two cities conquered',
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER: back, title, edit */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <MaterialIcon name="chevron-left" size={20} color="#DE1E26" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      {/* Come back to this -- create edit page */}
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.iconCircle}> 
          <MaterialIcon name="edit" size={18} color="#DE1E26" />
        </TouchableOpacity>
      </View>

      {/* BODY (non‑scroll): avatar, name/email, stats card, menu buttons */}
      <View style={styles.body}>

        {/* Avatar + name + email */}
        <View style={styles.centerBlock}>
          <Image source={require('../assets/ProfileW1.png')} style={styles.avatar} />
          <Text style={styles.name}>Sarah</Text>
          <Text style={styles.email}>TrailBlazer1@gmail.com</Text>
        </View>

        {/* Weekly stats card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your GLOBL. Weekly Stats</Text>
          <View style={styles.bullets}>
            {stats.map((s, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* menu buttons */}
        <View style={styles.menuStack}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Friends')}>
            <Text style={styles.menuText}>Friend Suggestions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={toggleIncognito}>
            <View style={styles.menuRow}>
              <MaterialIcon
                name={isIncognito ? 'visibility' : 'visibility-off'}
                size={20}
                color={isIncognito ? '#DE1E26' : '#0E2B32'}
              />
              <Text style={[styles.menuText, styles.menuTextInline]}>
                {isIncognito ? 'Incognito Mode On' : 'Incognito Mode Off'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
            <View style={styles.menuRow}>
              <MaterialIcon name="settings" size={20} color="#0E2B32" />
              <Text style={[styles.menuText, styles.menuTextInline]}>Settings</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* bottom navigation tabs */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcon name="person-outline" size={22} color="red" />
          <Text style={styles.navTextActive}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('CurrentLocation')}>
          <MaterialIcon name="location-pin" size={22} color="gray" />
          <Text style={styles.navText}>Pinned Sites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Global Heatmap')}>
          <MaterialIcon name="public" size={22} color="gray" />
          <Text style={styles.navText}>Global Heat Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LeaderBoard', { initialTab: 'leaders' })}>
          <MaterialIcon name="emoji-events" size={22} color="gray" />
          <Text style={styles.navText}>Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('NavigationHub')}>
          <MaterialIcon name="menu" size={22} color="gray" />
          <Text style={styles.navText}>Navigation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* main colorscheme */
const COLORS = {
  brand: '#DE1E26', // main red brand colour
  text: '#0E2B32', // text colour
  dim: '#666', // muted grey for secondary text
  bg: '#FFFFFF', // background white
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  iconCircle: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 2, borderColor: COLORS.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '700', color: '#000',
  },

  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12, // keeps distance from bottom nav
    justifyContent: 'flex-start',
  },

  /* Profile header block */
  centerBlock: { alignItems: 'center', marginTop: 6, marginBottom: 8 },
  avatar: { width: 140, height: 140, borderRadius: 70, marginBottom: 8 },
  name: { fontSize: 28, fontWeight: '800', color: '#000', lineHeight: 30 },
  email: { fontSize: 13, color: COLORS.dim, marginTop: 2 },

  /* weekly stats card */
  card: {
    marginTop: 12,
    borderWidth: 3,
    borderColor: COLORS.brand,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  bullets: { marginTop: 6 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 },
  bulletDot: { fontSize: 18, lineHeight: 22, color: '#000', marginRight: 8 },
  bulletText: { flex: 1, fontSize: 15, color: '#000' },

  /* Menu buttons */
  menuStack: { marginTop: 12, gap: 18 },
  menuItem: {
    minHeight: 82,
    borderWidth: 3,
    borderColor: COLORS.brand,
    borderRadius: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRow: { flexDirection: 'row', alignItems: 'center' },
  menuText: { fontSize: 20, fontWeight: '500', color: COLORS.text },
  menuTextInline: { marginLeft: 10 },

  /* Bottom nav */
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 2,
    borderTopColor: COLORS.brand,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 11, marginTop: 3, color: 'gray' },
  navTextActive: { fontSize: 11, marginTop: 3, color: COLORS.brand, fontWeight: 'bold' },
});
