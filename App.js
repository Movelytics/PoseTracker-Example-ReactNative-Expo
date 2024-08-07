import { StyleSheet, Text, View } from 'react-native';
import {useState} from "react";
import WebView from "react-native-webview";

// Our API request your token provided on our dashboard on posetracker.com (It's free <3)
const API_KEY =  "REPLACE_THIS_GO_TO_app.posetracker.com"
const POSETRACKER_API = "https://app.posetracker.com/pose_tracker/tracking"

export default function App() {
  const [poseTrackerInfos, setCurrentPoseTrackerInfos] = useState()
  const [repsCounter, setRepsCounter] = useState(0)

  // Our API request the width and height wanted for display the webcam inside the webview
  const width = 350
  const height = 350

  // Our API request the exercise you want to track and count
  const exercise = "squat"

  // Our API request the difficulty of the exercise (by default it's set to normal)
  const difficulty = "easy"

  // You can request API to display user skeleton or not (by default it's set to true)
  const skeleton = true

  const posetracker_url = `${POSETRACKER_API}?token=${API_KEY}&exercise=${exercise}&difficulty=${difficulty}&width=${width}&height=${height}`

  // We need a bridge to transit data between the ReactNative app and our WebView
  // The WebView will use this function define here to send info that we will use later
  const jsBridge = `
  (function() {
    window.webViewCallback = function(info) {
      window.ReactNativeWebView.postMessage(JSON.stringify(info));
    }
  })();
`

  const handleCounter = (count) => {
    setRepsCounter(count)
  }

  const handleInfos = (infos) => {
    setCurrentPoseTrackerInfos(infos)
  }

  //This is the function pass to the WebView to listen info from the WebView
  const webViewCallback = (info) => {
    switch (info.type) {
      case 'counter':
        return handleCounter(info.current_count)
      default:
        return handleInfos(info)
    }
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1}}>
        <WebView
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        style={{
          width: width,
          height: height,
          zIndex: 1
        }}
        source={{ uri: posetracker_url }}
        originWhitelist={['*']}
        injectedJavaScript={jsBridge}
        onMessage={(event) => {
          const info = JSON.parse(event.nativeEvent.data)
          webViewCallback(info)
        }}
      />
      </View>
      <View style={{ flex: 1}}>
        <Text>Status : {!poseTrackerInfos ? "loading AI..." : "AI Running"}</Text>
        <Text>Info type : {!poseTrackerInfos ? "loading AI..." : poseTrackerInfos.type}</Text>
        { poseTrackerInfos?.ready === false ? (<>
          <Text>Placement ready: false</Text>
          <Text>Placement info : Move { poseTrackerInfos?.postureDirection } </Text>
        </>) : (
          <>
            <Text>Placement ready: true</Text>
            <Text>Placement info : You can start doing squats 🏋️</Text>
          </>
        )}
        { repsCounter > 0 && (
          <Text>Counter: {repsCounter}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 60,
  },
});
