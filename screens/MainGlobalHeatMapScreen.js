import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview'; //For embedding custom HTML
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, onSnapshot } from 'firebase/firestore';

export default function GlobalHeatMapScreen({ navigation }) { 
// initial minimal HTML while assets load
  const [html, setHtml] = useState(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          html, body { margin:0; padding:0; background:#fff; overflow:hidden; }
          #loading {
            position:absolute; top:40%; width:100%; text-align:center; z-index:9999;
            font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            font-size:28px; font-weight:500; color:#000;
          }
        </style>
      </head>
      <body>
        <div id="loading">Loading GLOBL. Heatmap…</div>
      </body>
    </html>
  `);

  // Load image asset and build globe HTML on component mount
  useEffect(() => {
    async function loadAssets() {
      try {
        //ensuring the texture is available locally
        const globeAsset = Asset.fromModule(require('../assets/land_ocean_ice_2048.jpg'));
        await globeAsset.downloadAsync();
        // if present use localURI, otherwise just fall back to uri
        const assetUri = globeAsset.localUri ?? globeAsset.uri;
        if (!assetUri) throw new Error('Globe texture URI not available');
        //Read the image as base64
        const base64 = await FileSystem.readAsStringAsync(assetUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // NOTE: writing globeDataUri into window.GLOBL_GLOBE before ThreeGlobe uses it
        const globeDataUri = `data:image/jpg;base64,${base64}`;

        // define the full HTML page that will be rendered inside the WebView
        const dynamicHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Globe</title>
    <style>
    /* remove default browser padding/margins, keep canvas full screen */
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: white;
      }
      /* canvas needs to always stretch full width/height */
      canvas {
        width: 100%;
        height: 100%;
        display: block;
        touch-action: none; /* prevent touch scroll interfering */
      }
      /* centre “Loading” overlay until globe is ready */
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
   <!-- inject the globe texture (set in RN/JS before render) -->
    <script>window.GLOBL_GLOBE = "${globeDataUri}";</script>
  
   <!-- Load necessary Three.js libraries and helpers -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three-globe@2.25.2/dist/three-globe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/controls/OrbitControls.js"></script>
  </head>
  <body>
    
    <!-- overlay until globe initialises -->
    <div id="loading">Loading GLOBL. Heatmap...</div>

    <script>
      try {
       // Forward console logs back to React Native for debugging
        const originalLog = console.log;
        console.log = (...args) => {
          originalLog(...args);
          try
          { window.ReactNativeWebView?.postMessage(JSON.stringify({type: 'log', data: args})); } catch(e){}
        };

        //user's MOCK DATA - global points - reflects stats '22/195 countries', '62 cities' and '11% of the world conquered'
        // each point: { lat, lng, weight, name }
        const UK_POINTS = [
          {lat:51.5074,lng:-0.1278,weight:6,name:"London"},
          {lat:51.52,lng:-0.10,weight:5,name:"London (North)"},
          {lat:51.49,lng:-0.20,weight:5,name:"West London"},
          {lat:53.4808,lng:-2.2426,weight:5,name:"Manchester"},
          {lat:53.4084,lng:-2.9916,weight:4,name:"Liverpool"},
          {lat:53.8008,lng:-1.5491,weight:4,name:"Leeds"},
          {lat:52.4862,lng:-1.8904,weight:4,name:"Birmingham"},
          {lat:51.4545,lng:-2.5879,weight:4,name:"Bristol"},
          {lat:55.9533,lng:-3.1883,weight:4,name:"Edinburgh"},
          {lat:55.8642,lng:-4.2518,weight:5,name:"Glasgow"},
          {lat:51.4816,lng:-3.1791,weight:3,name:"Cardiff"},
          {lat:54.5970,lng:-5.9300,weight:3,name:"Belfast"},
          {lat:52.2053,lng:0.1218,weight:3,name:"Cambridge"},
          {lat:50.8225,lng:-0.1372,weight:3,name:"Brighton"},
          {lat:54.9783,lng:-1.6178,weight:3,name:"Newcastle"},
          {lat:52.9548,lng:-1.1581,weight:3,name:"Nottingham"},
          {lat:53.3811,lng:-1.4701,weight:3,name:"Sheffield"},
          {lat:52.6369,lng:-1.1398,weight:3,name:"Leicester"},
          {lat:51.7520,lng:-1.2577,weight:3,name:"Oxford"},
          {lat:51.3811,lng:-2.3590,weight:3,name:"Bath"},
          {lat:53.9590,lng:-1.0815,weight:3,name:"York"},
          {lat:57.1497,lng:-2.0943,weight:2,name:"Aberdeen"},
          {lat:56.4620,lng:-2.9707,weight:2,name:"Dundee"},
          {lat:57.4778,lng:-4.2247,weight:2,name:"Inverness"},
          {lat:50.8198,lng:-1.0880,weight:2,name:"Portsmouth"},
          {lat:50.9097,lng:-1.4044,weight:2,name:"Southampton"},
          {lat:51.4543,lng:-0.9781,weight:2,name:"Reading"},
          {lat:52.0417,lng:-0.7558,weight:2,name:"Milton Keynes"},
          {lat:52.6309,lng:1.2974,weight:2,name:"Norwich"},
          {lat:50.3755,lng:-4.1427,weight:2,name:"Plymouth"}
        ];
        const WORLD_POINTS = [
          {lat:48.8566,lng:2.3522,weight:2,name:"Paris"},
          {lat:45.7640,lng:4.8357,weight:1,name:"Lyon"},
          {lat:52.5200,lng:13.4050,weight:1,name:"Berlin"},
          {lat:48.1351,lng:11.5820,weight:1,name:"Munich"},
          {lat:40.4168,lng:-3.7038,weight:1,name:"Madrid"},
          {lat:41.3851,lng:2.1734,weight:1,name:"Barcelona"},
          {lat:41.9028,lng:12.4964,weight:2,name:"Rome"},
          {lat:45.4642,lng:9.1900,weight:1,name:"Milan"},
          {lat:52.3676,lng:4.9041,weight:1,name:"Amsterdam"},
          {lat:50.8503,lng:4.3517,weight:1,name:"Brussels"},
          {lat:53.3498,lng:-6.2603,weight:1,name:"Dublin"},
          {lat:38.7223,lng:-9.1393,weight:1,name:"Lisbon"},
          {lat:59.9139,lng:10.7522,weight:1,name:"Oslo"},
          {lat:59.3293,lng:18.0686,weight:1,name:"Stockholm"},
          {lat:55.6761,lng:12.5683,weight:1,name:"Copenhagen"},
          {lat:47.3769,lng:8.5417,weight:1,name:"Zurich"},
          {lat:48.2082,lng:16.3738,weight:1,name:"Vienna"},
          {lat:37.9838,lng:23.7275,weight:1,name:"Athens"},
          {lat:41.0082,lng:28.9784,weight:1,name:"Istanbul"},
          {lat:50.0755,lng:14.4378,weight:1,name:"Prague"},
          {lat:52.2297,lng:21.0122,weight:1,name:"Warsaw"},
          {lat:40.7128,lng:-74.0060,weight:2,name:"New York"},
          {lat:34.0522,lng:-118.2437,weight:1,name:"Los Angeles"},
          {lat:41.8781,lng:-87.6298,weight:1,name:"Chicago"},
          {lat:37.7749,lng:-122.4194,weight:1,name:"San Francisco"},
          {lat:43.6532,lng:-79.3832,weight:1,name:"Toronto"},
          {lat:49.2827,lng:-123.1207,weight:1,name:"Vancouver"},
          {lat:19.4326,lng:-99.1332,weight:1,name:"Mexico City"},
          {lat:-22.9068,lng:-43.1729,weight:1,name:"Rio de Janeiro"},
          {lat:-34.6037,lng:-58.3816,weight:1,name:"Buenos Aires"},
          {lat:-33.9249,lng:18.4241,weight:1,name:"Cape Town"},
          {lat:25.2048,lng:55.2708,weight:1,name:"Dubai"},
          {lat:19.0760,lng:72.8777,weight:1,name:"Mumbai"},
          {lat:28.6139,lng:77.2090,weight:1,name:"Delhi"},
          {lat:1.3521,lng:103.8198,weight:1,name:"Singapore"},
          {lat:35.6762,lng:139.6503,weight:1,name:"Tokyo"},
          {lat:-33.8688,lng:151.2093,weight:1,name:"Sydney"},
          {lat:-37.8136,lng:144.9631,weight:1,name:"Melbourne"},
          {lat:-36.8485,lng:174.7633,weight:1,name:"Auckland"}
        ];
        const POINTS = [...UK_POINTS, ...WORLD_POINTS];

        // set up Three.js --SCENE--
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 180; //  moved closer for larger globe

        // Create the renderer and attach it to the DOM
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0xffffff, 1); // white background
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Set up orbit controls (drag to spin, zoom disabled)
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false; //  disable zoom
        controls.enablePan = true; 
        controls.enableDamping = true; //smoother spin
        controls.dampingFactor = 0.05;

        //ambient lighting so the globe does not appear flat
        scene.add(new THREE.AmbientLight(0xffffff, 1));

        // create globe with atmosphere glow
        const globe = new ThreeGlobe({ waitForGlobeReady: true })
          .globeImageUrl(window.GLOBL_GLOBE)   
          .atmosphereColor('#7aa7ff')
          .atmosphereAltitude(0.15)
          .onGlobeReady(() => {
            // hide “loading” overlay once textures are ready
            const l = document.getElementById('loading');
            if (l) l.style.display = 'none';
          });

       // --- Heatmap + points ---
       // clamp to 0–1 (safety for weights)
        const clamp01 = (x) => Math.max(0, Math.min(1, x));
       // colour ramp (orange → red) for heatspots
        const heatColor = (t) => {
          if (t < 0.35) return 'rgba(255,165,0,0.55)';
          if (t < 0.7) return 'rgba(255,99,71,0.70)';
          return 'rgba(222,30,38,0.95)';
        };
        // putting values into hexagons bins for density
        globe
          .hexBinPointsData(POINTS)
          .hexBinPointLat('lat')
          .hexBinPointLng('lng')
          .hexBinPointWeight('weight')
          .hexBinResolution(2) //lower = chunkier
          .hexMargin(0.05)
          .hexAltitude(() => 0.08)
          .hexTopColor(bin => {
            const w = (bin.sumWeight != null ? bin.sumWeight : (bin.points ? bin.points.length : 1));
            return heatColor(clamp01(w / 10));
          })
          .hexSideColor(bin => {
            const w = (bin.sumWeight != null ? bin.sumWeight : (bin.points ? bin.points.length : 1));
            const t = clamp01(w / 10);
            return t < 0.5 ? 'rgba(255,140,0,0.35)' : 'rgba(255,69,0,0.4)';
          });

         // overlay light point dots so exact cities are visible
          const maxWeight = Math.max(...POINTS.map(p => p.weight || 1), 1);
          globe
          .pointsData(POINTS)
          .pointLat('lat')
          .pointLng('lng')
          .pointColor(p => {
            const t = clamp01((p.weight||1)/maxWeight);
            return t < 0.5 ? 'rgba(255,165,0,0.22)' : 'rgba(255,99,71,0.28)';
          })
          .pointAltitude(0.02)
          .pointRadius(p => {
            const t = clamp01((p.weight||1)/maxWeight);
            return 0.6 + t * 1.1; // bigger if weight is higher
          });

        // Add globe & animate
        scene.add(globe);
        function animate() {
          requestAnimationFrame(animate);
          controls.update();
          globe.rotation.y += 0.0005; //gentle spin
          renderer.render(scene, camera);
        }
        animate();

        // adapt camera/renderer if window is resized
        window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // fallback: if loading overlay is not been hidden within 15s, hide it anyway
        setTimeout(() => { 
          const l = document.getElementById('loading'); 
          if (l) l.style.display = 'none'; 
          }, 15000);

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

 // Add state for the greeting
const [firstName, setFirstName] = useState(null);
const [emailLocal, setEmailLocal] = useState(null);
const [loadingProfile, setLoadingProfile] = useState(true);

// Load user profile (realtime)
useEffect(() => {
  const unsubAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      setFirstName(null);
      setEmailLocal(null);
      setLoadingProfile(false);
      return;
    }

    // fallback from email local-part
    const local = (user.email || '').split('@')[0];
    const prettyLocal = local ? local.charAt(0).toUpperCase() + local.slice(1) : '';
    setEmailLocal(prettyLocal);

    // Realtime profile listener
    const ref = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(
      ref,
      async (snap) => {
        const data = snap.data() || {};
        const fn = data.firstName || '';
        setFirstName(fn || null);
        if (fn) {
          try { await AsyncStorage.setItem('@globl_firstName', fn); } catch {}
        }
        setLoadingProfile(false);
      },
      (err) => {
        console.log('Profile listener error:', err);
        setLoadingProfile(false);
      }
    );
    // cleanup when user changes/unmounts
    return () => unsubProfile();
  });

  return () => unsubAuth();
}, []);

// Build greeting safely ( to avoid rendering .trim function = error)
const greeting = loadingProfile
  ? 'Hello…'
  : ['Hello', firstName || emailLocal].filter(Boolean).join(' ');
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header section with greeting and user stats */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.greeting}>
        {loadingProfile ? 'Hello…' : `Hello ${firstName ?? emailLocal ?? ''}`.trim} 
        </Text>
        <Text style={styles.greeting}>{greeting}</Text> 
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
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('GlobalHeatmap')}>
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

