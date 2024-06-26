import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Alert } from 'react-native';
import WebView from 'react-native-webview';
import {Camera, useCameraPermissions} from 'expo-camera';

// Our API request your token provided on our dashboard on posetracker.com (It's free <3)
const API_KEY = "TO_REPLACE_FIND_IT_ON_www.posetracker.com";
const POSETRACKER_API = "https://posetracker.com/pose_tracker/tracking";

// Get the dimensions of the screen
const { width, height } = Dimensions.get('window');

export default function App() {
  const [poseTrackerInfos, setCurrentPoseTrackerInfos] = useState();
  const [repsCounter, setRepsCounter] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();


  useEffect(() => {
    if (!permission?.granted) {
      requestPermission().then(e => {
      })
    }
  }, []);

  // Our API request the exercise you want to track and count
  const exercise = "squat";

  // Our API request the difficulty of the exercise (by default it's set to normal)
  const difficulty = "easy";

  // You can request API to display user skeleton or not (by default it's set to true)
  const skeleton = true;

  const posetracker_url = `${POSETRACKER_API}?token=${API_KEY}&exercise=${exercise}&difficulty=${difficulty}&width=${width}&height=${height}&isMobile=${true}`;

  // We need a bridge to transit data between the ReactNative app and our WebView
  // The WebView will use this function defined here to send info that we will use later
  const jsBridge = `
  (function() {
    document.addEventListener('DOMContentLoaded', function() {
      window.webViewCallback = function(info) {
        window.ReactNativeWebView.postMessage(JSON.stringify(info));
      }
    });
  })();
  `;

  const handleCounter = (count) => {
    setRepsCounter(count);
  };

  const handleInfos = (infos) => {
    setCurrentPoseTrackerInfos(infos);
    console.log(infos);
  };

  // This is the function passed to the WebView to listen for info from the WebView
  const webViewCallback = (info) => {
    switch (info.type) {
      case 'counter':
        return handleCounter(info.current_count);
      default:
        return handleInfos(info);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        style={styles.webView}
        source={{ uri: posetracker_url }}
        originWhitelist={['*']}
        injectedJavaScript={jsBridge}
        onMessage={(event) => {
          try {
            const info = JSON.parse(event.nativeEvent.data);
            webViewCallback(info);
          } catch (error) {
            console.error('Error parsing message from WebView', error);
          }
        }}
      />
      <View style={styles.infoContainer}>
        <Text>Status : {!poseTrackerInfos ? "loading AI..." : "AI Running"}</Text>
        <Text>Info type : {!poseTrackerInfos ? "loading AI..." : poseTrackerInfos.type}</Text>
        <Text>Infos : {poseTrackerInfos}</Text>
        {poseTrackerInfos?.ready === false ? (
          <>
            <Text>Placement ready: false</Text>
            <Text>Placement info : Move {poseTrackerInfos?.postureDirection}</Text>
          </>
        ) : (
          <>
            <Text>Placement ready: true</Text>
            <Text>Placement info : You can start doing squats 🏋️</Text>
          </>
        )}
        {repsCounter > 0 && <Text>Counter: {repsCounter}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  webView: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  infoContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
  },
});
