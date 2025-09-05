import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Image, Pressable } from 'react-native';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

// sub-tab screens
import LeaderScreen from './LeaderTabs/LeaderScreen';
import EarnedBadgesScreen from './LeaderTabs/EarnedBadgesScreen';
import AvailableBadgesScreen from './LeaderTabs/AvailableBadgesScreen';

export default function BadgesScreen({ navigation, route }) {
  // set default tab based on route params
  const initialTabFromParams = route.params?.initialTab || 'leaders';   
  const [activeTab, setActiveTab] = useState(initialTabFromParams);

  // Profile state
  const [firstName, setFirstName] = useState(null);
  const [emailLocal, setEmailLocal] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  //later development this data can be in firestore too
  const level = 5;
  const progress = 0.7;
  const avatar = require('../assets/ProfileW1.png');

  // sync route param to tab (if pushed with a different initialTab)
  useEffect(() => {
    if (route?.params?.initialTab && route.params.initialTab !== activeTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  // Load profile display name of user
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setFirstName(null);
        setEmailLocal(null);
        setLoadingProfile(false);
        return;
      }

      // fallback: email local part
      const local = (user.email || '').split('@')[0];
      const prettyLocal = local ? local.charAt(0).toUpperCase() + local.slice(1) : '';
      setEmailLocal(prettyLocal);

      // listen to Firestore profile
      const ref = doc(db, 'users', user.uid);
      const unsubProfile = onSnapshot(ref, async (snap) => {
        const data = snap.data() || {};
        const fn = data.firstName || '';
        setFirstName(fn || null);
        if (fn) {
          try { await AsyncStorage.setItem('@globl_firstName', fn); } catch {}
        }
        setLoadingProfile(false);
      });

      return () => unsubProfile();
    });

    return () => unsubAuth();
  }, []);

  const displayName = loadingProfile ? 'Loading…' : (firstName ?? emailLocal ?? 'Athlete');

  // Renders content based on the selected tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'leaders':
        return <LeaderScreen />;
      case 'badges':
        return <EarnedBadgesScreen />;
      case 'available':
        return <AvailableBadgesScreen />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        {/* Back button */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={'#DE1E26'} />
        </Pressable>

        {/* Title */}
        <Text style={styles.title}>Badges</Text>

        {/* Menu button */}
        <Pressable
          onPress={() => navigation.navigate('NavigationHub')}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open navigation hub"
        >
          <Ionicons name="menu" size={22} color={'#DE1E26'} />
        </Pressable>
      </View>
        
      {/* user profile section */}
      <View style={styles.headerContainer}>
        <Image source={avatar} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{String(displayName)}</Text>
            <Text style={styles.userLevel}>Lvl. {String(level)}</Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(progress * 100, 100)}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* tab selector (Leaders, Badges, Available) */}
      <View style={styles.tabSelector}>
        <Pressable onPress={() => setActiveTab('leaders')}>
          <Text style={[styles.tabText, activeTab === 'leaders' && styles.activeTab]}>Leaders</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('badges')}>
          <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTab]}>Badges</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('available')}>
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTab]}>Available</Text>
        </Pressable>
      </View>

      {/* main tab body */}
      <View style={styles.tabBody}>{renderTabContent()}</View>
    </SafeAreaView>
  );
}

//styles
const styles = StyleSheet.create({
  //main container
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backButton: { fontSize: 24 },
  title: { fontSize: 20, fontWeight: '600' },
  menu: { fontSize: 24 },
  iconBtn: { padding: 8, borderRadius: 20 },
  pressed: { opacity: 0.5 },

  //user profile section
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  profileInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: 'bold' },

  // level progerssion
  nameRow: { flexDirection: 'row', alignItems: 'baseline', columnGap: 8 },
  userLevel: { fontSize: 14, color: '#555' },

  progressBarBackground: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginTop: 6,
    width: '90%',
  },
  progressBarFill: { height: 8, backgroundColor: '#8BC34A', borderRadius: 4 },

  star: { fontSize: 26, marginLeft: 8 },

  tabSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 2,
    borderColor: '#000',
    marginBottom: 10,
  },
  tabText: { fontSize: 16, paddingVertical: 6, color: 'gray' },
  activeTab: { color: '#DE1E26', borderBottomColor: '#DE1E26', borderBottomWidth: 2 },

  // renders tab
  tabBody: { flex: 1 },
  
});

