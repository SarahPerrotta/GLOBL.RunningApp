import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  brand: '#DE1E26',
  text: '#0E2B32',
  dim: 'gray',
  bg: '#fff',
};

export default function BottomNav({ navigation, active }) {
  const Item = ({ label, icon, route, params }) => {
    const isActive = active === route;
    return (
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate(route, params)}
        activeOpacity={0.7}
      >
        <MaterialIcon
          name={icon}
          size={22}
          color={isActive ? COLORS.brand : COLORS.dim}
        />
        <Text style={isActive ? styles.navTextActive : styles.navText}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bottomNav}>
      <Item label="Profile"        icon="person-outline" route="Profile" />
      <Item label="Location"        icon="location-pin"   route="CurrentLocation" />
      <Item label="Global Heat Map" icon="public"       route="GlobalHeatMap" />
      <Item label="Leaderboard"    icon="emoji-events"  route="LeaderBoard" params={{ initialTab: 'leaders' }} />
      <Item label="Navigation Hub"     icon="menu"          route="NavigationHub" />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 2,
    borderTopColor: COLORS.brand,
    paddingVertical: 10,
    backgroundColor: COLORS.bg,
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 11, marginTop: 3, color: COLORS.dim },
  navTextActive: { fontSize: 11, marginTop: 3, color: COLORS.brand, fontWeight: 'bold' },
});
