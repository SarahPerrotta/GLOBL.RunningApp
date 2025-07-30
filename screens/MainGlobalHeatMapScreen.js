import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset'

export default function GlobalHeatMapScreen() {
  const [htmlUri, setHtmlUri] = useState(null);

  useEffect(() => {
    const loadHtml = async () => {
      const asset = Asset.fromModule(require('../assets/index.html')); //links back to assets folder 
      await asset.downloadAsync(); // Ensure it's cached
      
      const fileContents = await FileSystem.readAsStringAsync(asset.localUri);
      const localFileUri = FileSystem.documentDirectory + 'index.html';

      await FileSystem.writeAsStringAsync(localFileUri, fileContents, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      setHtmlUri(localFileUri);
    };

    loadHtml();
  }, []);

  if (!htmlUri) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>
          Loading Globe...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ uri: htmlUri }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
