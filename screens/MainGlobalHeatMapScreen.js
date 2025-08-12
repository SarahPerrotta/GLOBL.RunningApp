import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview'; //For embedding custom HTML
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function GlobalHeatMapScreen({ navigation }) { 
//main screen componenet
const [html, setHtml] = useState('<div>Loading assets...</div>');

  // Load image asset and build globe HTML on component mount
  useEffect(() => {
    async function loadAssets() {
      try {
        const globeAsset = Asset.fromModule(require('../assets/land_ocean_ice_2048.jpg'));
        await globeAsset.downloadAsync();
        
        // convert the image to base64 to embed directly into the HTML
        const base64 = await FileSystem.readAsStringAsync(globeAsset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const globeDataUri = `data:image/jpg;base64,${base64}`;

        // define the full HTML page that will be rendered inside the WebView
        const dynamicHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Globe</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: white;
      }
      canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
      #loading {
        position: absolute;
        color: black;
        width: 100%;
        text-align: center;
        font-family: 'Poppins', sans-serif;
        top: 40%;
        font-size: 55px;
        font-weight: 100;
        z-index: 9999;
      }
    </style>
     <!-- Load necessary Three.js libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three-globe@2.25.2/dist/three-globe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/controls/OrbitControls.js"></script>
  </head>
  <body>
    <div id="loading">Loading GLOBL. Heatmap...</div>
    <script>
      try {
       // Forward console logs back to React Native for debugging
        const originalLog = console.log;
        console.log = (...args) => {
          originalLog(...args);
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'log', data: args}));
        };
        // set up Three.js scene and camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 180; //  moved closer for larger globe

        // Create the renderer and attach it to the DOM
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0xffffff, 1);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Set up orbit controls (drag to spin, zoom disabled
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false; //  disable zoom
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        scene.add(new THREE.AmbientLight(0xffffff, 1));

        const loader = new THREE.TextureLoader();
        loader.load('${globeDataUri}',
          (texture) => {
            const globe = new ThreeGlobe({ waitForGlobeReady: true })
              .globeImageUrl('${globeDataUri}')
              .onGlobeReady(() => {
                document.getElementById('loading').style.display = 'none';
              });

            scene.add(globe);

            function animate() {
              requestAnimationFrame(animate);
              controls.update();
              globe.rotation.y += 0.0005;
              renderer.render(scene, camera);
            }

            animate();
          },
          undefined,
          (error) => console.log('Error loading base64 texture', error)
        );

        // Fallback in case globe loading hangs
        setTimeout(() => {
          document.getElementById('loading').style.display = 'none';
        }, 10000);
      } catch (error) {
        console.error('Error initializing globe:', error);
      }
    </script>
  </body>
</html>`;
        //HTML content in state for rendering
        setHtml(dynamicHtml);
      } catch (error) {
        console.error('Asset load error:', error);
        setHtml('<div>Error loading assets</div>');
      }
    }

    loadAssets();
  }, []);

  // Main screen layout
  return (
    <SafeAreaView style={styles.container}>
      {/* Header section with greeting and user stats */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.greeting}>Hello Sarah</Text>
          <Text style={styles.waving}>👋</Text>
        </View>
        <Text style={styles.subGreeting}>Your GLOBL. stats are here!</Text>

        {/* Stat pill boxes */}
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statText}>22/195{'\n'}Countries</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statText}>62 Cities{'\n'}Explored</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statText}>11% of the{'\n'}world conquered</Text>
          </View>
        </View>
      </View>

      {/* Globe visualisation section */}
      <View style={styles.globeContainer}>
        <WebView
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          style={styles.webview}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'log') console.log('WebView log:', ...data.data);
            } catch (e) {
              console.log('WebView message:', event.nativeEvent.data);
            }
          }}
          source={{ html }}
        />
      </View>
      
     {/* Bottom navigation bar*/}
      <View style={styles.bottomNav}> 
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Icon name="person-outline" size={24} color="gray" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('CurrentLocation')}>
          <Icon name="location-pin" size={24} color="gray" />
          <Text style={styles.navText}>Current location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Global Heatmap')}>
          <Icon name="public" size={24} color="red" />
          <Text style={styles.navTextActive}>Global Heat Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('LeaderBoard', { initialTab: 'leaders' })}>
          <Icon name="emoji-events" size={24} color="gray" />
          <Text style={styles.navText}>Leaderboard</Text>
          </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('NavigationHub')}>
          <Icon name="menu" size={24} color="gray" />
          <Text style={styles.navText}>Navigation</Text>
        </TouchableOpacity>
      </View>
   </SafeAreaView>
  );
}

// Styles for the entire screen
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  // header layout and alignment
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  waving: {
    fontSize: 24,
    marginLeft: 6,
  },
  subGreeting: {
    fontSize: 16,
    color: 'gray',
    marginTop: 4,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  // statistics pill container
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingHorizontal: 10,
    width: '100%',
  },
  statPill: {
    borderWidth: 2,
    borderColor: 'red',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    minWidth: 100,
    marginHorizontal: 5,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: 'black',
  },
  // Globe container and WebView
  globeContainer: {
    flex: 1,
    marginVertical: 10,
    borderRadius: 300,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'white',
  },
   // bottom navigation bar
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 2,
    borderTopColor: 'red',
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: 'gray',
  },
  navTextActive: {
    fontSize: 12,
    marginTop: 4,
    color: 'red',
    fontWeight: 'bold',
  },
});

