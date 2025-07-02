import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { Check, X, RotateCcw } from 'lucide-react-native';

export default function CameraCaptureScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const device = useCameraDevice(facing);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.getCameraPermissionStatus();
      if (cameraPermission !== 'granted') {
        const granted = await requestAndroidCameraPermission();
        if (granted) await Camera.requestCameraPermission();
        setHasPermission(granted);
      } else {
        setHasPermission(true);
      }
    })();
  }, []);

  const requestAndroidCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app requires camera access to capture your face.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        qualityPrioritization: 'quality',
      });
      Alert.alert('Captured', `Saved to: file://${photo.path}`);
      // You can pass `file://${photo.path}` to backend or storage logic
    } catch (error) {
      console.error(error);
      Alert.alert('Capture Error', 'Unable to take photo.');
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleCamera = () => {
    setFacing((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Camera permission not granted.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('Cancelled')}>
          <X size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.captureButton}
          disabled={isCapturing}
          onPress={handleCapture}
        >
          <Check size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={toggleCamera}>
          <RotateCcw size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.instruction}>Align your face and tap capture</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 16 },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconButton: {
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
  },
  captureButton: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 50,
  },
  instruction: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
