// FaceVerificationScreen.tsx

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
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { CheckCircle, X } from 'lucide-react-native';

export default function FaceVerificationScreen() {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'detecting' | 'processing'>('idle');
  const [detectedFace, setDetectedFace] = useState(false);
  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getPermissions = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Camera permission is required');
        }
      } else {
        if (!hasPermission) await requestPermission();
      }
    };
    getPermissions();
  }, []);

  useEffect(() => {
    if (isScanning) {
      setScanStatus('detecting');
      scanTimerRef.current = setInterval(() => handleScan(), 2000);
    } else {
      clearInterval(scanTimerRef.current!);
    }
    return () => clearInterval(scanTimerRef.current!);
  }, [isScanning]);

  const handleScan = async () => {
    if (!cameraRef.current || scanStatus === 'processing') return;

    setScanStatus('processing');
    try {
      const photo = await cameraRef.current.takePhoto({ flash: 'off' });
      const imagePath = `file://${photo.path}`;

      // Simulate detection logic
      const isMatch = Math.random() > 0.4;
      const confidence = (Math.random() * 0.3 + 0.7).toFixed(2); // 70–100%

      setDetectedFace(true);
      setScanStatus('detecting');

      if (isMatch) {
        Alert.alert('Face Verified', `Match found!\nConfidence: ${confidence}`);
        setIsScanning(false);
      } else {
        Alert.alert('No Match', 'Face not recognized. Try again.');
      }
    } catch (err) {
      console.error('Capture Error', err);
      setScanStatus('detecting');
    }
  };

  if (!device) return <Text style={styles.text}>Loading camera...</Text>;
  if (!hasPermission) return <Text style={styles.text}>Camera permission required...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Auto Face Verification</Text>
        <TouchableOpacity onPress={() => setIsScanning(false)}>
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      <View style={styles.overlay}>
        <View style={styles.scanBox}>
          {detectedFace && <CheckCircle size={32} color="green" />}
        </View>
        <Text style={styles.statusText}>
          {scanStatus === 'processing'
            ? 'Processing...'
            : scanStatus === 'detecting'
            ? 'Looking for face...'
            : 'Idle'}
        </Text>

        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.stopButton]}
          onPress={() => setIsScanning((prev) => !prev)}
        >
          <Text style={styles.scanButtonText}>{isScanning ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  overlay: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  scanBox: {
    width: 240,
    height: 280,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: { color: '#fff', fontSize: 16, marginBottom: 10 },
  scanButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  stopButton: { backgroundColor: '#EF4444' },
  scanButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  text: {
    flex: 1,
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
  },
});
