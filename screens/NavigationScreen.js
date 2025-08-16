import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Navigation menu items and their target routes - pages to be added 
const MENU = [
  { label: 'Pinned Trails', route: 'PinnedTrails' },
  { label: 'Run Club', route: 'RunClub' },
  { label: 'Parkrun Event', route: 'ParkRun' },
  { label: 'Articles', route: 'Articles' },
  //{ label: 'Friend Suggestions', route: 'Friends' }, 
  { label: 'Settings', route: 'Settings' },
];

export default function NavigationScreen({ navigation }) {
  return (
    <View style={styles.container}>
      
      {/* Header section */}
      <View style={styles.header}>
        {/* Back button */}
        <Pressable
          onPress={() => navigation.navigate('Main')}  // routes back to Global Heat Map
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color="#DE1E26" />
        </Pressable>

        {/* Screen title */}
        <Text style={styles.title}>Navigation</Text>

        {/* spacer to balance header layout */}
        <View style={styles.headerSpacer} />
      </View>

      {/* main menu list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {MENU.map(({ label, route }) => (
          <Pressable
            key={label}
            onPress={() => navigation.navigate(route)} 
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <Text style={styles.menuText}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>

    </View>
  );
}

// Colour palette for easy changes in one place
const COLORS = {
  bg: '#FFFFFF',     // page background
  border: '#DE1E26', // red outline colour
  text: '#0E2B32',   // main text colour
};

const styles = StyleSheet.create({
  // Main container for the screen
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingTop: 80, // pushes content down from top
  },

  // Header layout
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  // Back button style
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Placeholder element to balance the header
  headerSpacer: { width: 40, height: 40 },

  // Page title text style
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Container for the list of menu buttons
  listContent: {
    paddingVertical: 24, //space separates buttoms from the title header
    gap: 22,            // spacing between buttons
    paddingBottom: 24,
  },

  // Individual menu button style
  menuItem: {
    borderWidth: 3,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2, // shadow for Android
  },

  // Text inside each menu button
  menuText: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.25,
  },

  // Style applied when a button is pressed
  pressed: {
    opacity: 0.9, //slightly transparent when clicked
    transform: [{ scale: 0.995 }], // slightly shrinks button when clicked
  },
});
