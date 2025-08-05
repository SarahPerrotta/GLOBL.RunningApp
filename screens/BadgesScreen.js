import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// import sub-tab screens
import LeaderScreen from './LeaderTabs/LeaderScreen';
import EarnedBadgesScreen from './LeaderTabs/EarnedBadgesScreen';
import AvailableBadgesScreen from './LeaderTabs/AvailableBadgesScreen';

export default function BadgesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // set default tab based on route params
  const initialTabFromParams = route.params?.initialTab || 'leaders';
  const [activeTab, setActiveTab] = useState(initialTabFromParams);
  // Update tab when route param changes
  useEffect(() => {
    if (route.params?.initialTab && route.params.initialTab !== activeTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  // user data
  const currentUser = {
    name: 'Sarah',
    level: 5,
    progress: 0.7,
    avatar: require('../assets/ProfileW1.png'),
    starColor: '#4CAF50',
  };

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
    <View style={styles.container}>

      {/* top navigation bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Badges</Text>
        <TouchableOpacity>
          <Text style={styles.menu}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* user profile section */}
      <View style={styles.headerContainer}>
        <Image source={currentUser.avatar} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{currentUser.name} Lvl. {currentUser.level}</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${currentUser.progress * 100}%` }]} />
          </View>
        </View>
      </View>

      {/* tab selector (Leaders, Badges, Available) */}
      <View style={styles.tabSelector}>
        <TouchableOpacity onPress={() => setActiveTab('leaders')}>
          <Text style={[styles.tabText, activeTab === 'leaders' && styles.activeTab]}>Leaders</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('badges')}>
          <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTab]}>Badges</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('available')}>
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTab]}>Available</Text>
        </TouchableOpacity>
      </View>

      {/* main tab content */}
      <ScrollView style={styles.tabContent}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

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
  backButton: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  menu: {
    fontSize: 24,
  },
  //user profile section
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginTop: 6,
    width: '90%',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#8BC34A',
    borderRadius: 4,
  },
  star: {
    fontSize: 26,
    marginLeft: 8,
  },
  tabSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 2,
    borderColor: '#000',
    marginBottom: 10,
  },
  tabText: {
    fontSize: 16,
    paddingVertical: 6,
    color: 'gray',
  },
  activeTab: {
    color: '#DE1E26',
    borderBottomColor: '#DE1E26',
    borderBottomWidth: 2,
  },
  // content container for tab screens
  tabContent: {
    flex: 1,
  },
});
