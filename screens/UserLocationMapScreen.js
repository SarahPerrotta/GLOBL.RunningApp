import React from 'react';
import { View, Image, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Main component for user location map screen
export default function UserLocationMap({ navigation }) {
  return (
    <SafeAreaView style={styles.container}> 

     <View style={styles.header}>
    {/* Red background logo behind content */}
     <Image
     source={require('../assets/BackgroundLogo.png')}
     style={styles.fadedLogo}
     resizeMode="contain"
    />

     {/* Navigation back button (top-left corner) */}
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
     <Icon name="arrow-back" size={35} color="white" />
    </TouchableOpacity>

      {/* Header content in the center: text + white container */}
      <View style={styles.headerContent}>
     <Text style={styles.headerText}>Let's check out your favourite hotspots!</Text>
        
    <View style={styles.locationBox}>
      <Icon name="location-pin" size={32} color="#DE1E26" />
      <Text style={styles.locationText}>Glasgow</Text>
    </View>
  </View>
</View>

      {/* Map view */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 55.8642,
            longitude: -4.2518,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
        {/*Marker to indicate users location*/}
          <Marker
            coordinate={{ latitude: 55.8642, longitude: -4.2518 }}
            title="You are here"
          />
        </MapView>
        
        {/* Incognito icon overlay */}
         <TouchableOpacity style={styles.incognitoIcon}>
         <Icon name="visibility-off" size={28} color="black" />
         </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Icon name="person-outline" size={24} color="gray" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('CurrentLocation')}>
          <Icon name="location-pin" size={24} color="red" />
          <Text style={styles.navTextActive}>Current location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Main')}>
          <Icon name="public" size={24} color="gray" />
          <Text style={styles.navText}>Global Heat Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Leaderboard')}>
          <Icon name="emoji-events" size={24} color="gray" />
          <Text style={styles.navText}>Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Navigation')}>
          <Icon name="menu" size={24} color="gray" />
          <Text style={styles.navText}>Navigation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

//style sheet for layout and design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  //red header section
  header: {
    backgroundColor: '#DE1E26',
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    height: 250, 
    justifyContent: 'center',
  },
 // Container for everything centered in the header
  headerContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
 // Main header text
  headerText: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '400',
    color: 'white',
    marginBottom: 20,
  },
  fadedLogo: {
    position: 'absolute',
    width: '100%',
    height: 400, //  increase to make logo bigger
    zIndex: 0,  //logo is behind white container, not visible
  },
  // Back arrow icon in top-left corner
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    zIndex: 2,
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
   // White rounded container with icon and Glasgow text
  locationBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 60,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  // Glasgow text inside white box
  locationText: {
    fontSize: 40,
    fontWeight: '400',
    marginLeft: 10,
    color: 'black',
  },  
  // Map container with rounded corners and margin (google maps)
  mapContainer: { 
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
    // wrapper used to layer elements over the map
  mapWrapper: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  // Positioning for the incognito icon overlay
  incognitoIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 2,
  },  
 // Fullscreen map
  map: {
    flex: 1,
  },
  // Bottom navigation bar with icons
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 2,
    borderTopColor: '#DE1E26',
    paddingVertical: 12,
    backgroundColor: 'white',
  },
   // Style for each tab item
  navItem: {
    alignItems: 'center',
  },
  //font design for navigation tabs
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: 'gray',
  },
  //font for currentpage tab
  navTextActive: {
    fontSize: 12,
    marginTop: 4,
    color: 'red',
    fontWeight: 'bold',
  },
});
