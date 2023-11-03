import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Camera, CameraPermissionStatus, useCameraDevice, useCameraFormat, useCameraPermission } from 'react-native-vision-camera';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

const App = () => {
  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice('back')

  React.useEffect(() => {
    requestPermission();
  }, []);
  
  const format = useCameraFormat(device, [
    { fps: 60 },
    { videoResolution: { width: 3048, height: 2160 } }
  ])

  const camera = useRef<Camera>(null)

  const [recording, setRecording] = useState(false);
  const [videoPath, setVideoPath] = useState('');


  if (device == null) return <View><Text>null</Text></View>

  async function startRecording() {
    if (camera.current) {
      try {
        camera.current.startRecording({
          onRecordingError: (error) => console.error(error),
          videoBitRate: 'high',
          onRecordingFinished: async (video) => {
            const path = video.path;
            setVideoPath(video.path);
            try {
              // Save the recorded video to the camera roll
              await CameraRoll.save(`file://${path}`, {
                type: 'video',
              })
              console.log('Video saved to camera roll');
            } catch (error) {
              console.error('Error saving video to camera roll:', error);
            }
          },
        });
      } catch (error) {
        console.error("Error recording video", error);
      }
    }
  }

  function stopRecording() {
    try {
      setRecording(false);
      if (camera.current) {
        camera.current.stopRecording();
      }
    } catch (error) {
      console.error("Error stopping video", error);
    }
  }

  async function takePhoto() {
    if (camera.current) {
      try {
        const file = await camera.current.takePhoto();
        const result = await fetch(`file://${file.path}`)
        const data = await result.blob();
        console.log("photo", file);
        await CameraRoll.save(`file://${file.path}`, {
          type: 'photo',
        })
      } catch (error) {
        console.error("Error recording video", error);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        format={format}
        isActive={true}
        video={true}
        photo={true}
      />
      <View style={styles.buttonContainer}>
        {/* <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.text}>Photo</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.button} onPress={startRecording}>
          <Text style={styles.text}>Start Record</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={stopRecording}>
          <Text style={styles.text}>Stop Record</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    marginVertical: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  fullScreenContainer: {
    flex: 1,
    marginVertical: 50,
  },
  exitButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: "transparent",
    padding: 16,
  },
  exitText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});