import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, Camera, Save, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import CameraCapture from '../../components/CameraCapture';
import { StorageUtils } from '../../utils/storage';
import { FaceRecognitionUtils } from '../../utils/faceRecognition';
import { Employee } from '../../types/attendance';

export default function SignupScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    faceData: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'form' | 'capture' | 'processing' | 'complete'>('form');

  const handleFaceCapture = async (imageUri: string) => {
    setShowCamera(false);
    setRegistrationStep('processing');
    setIsProcessing(true);

    try {
      // Capture and process face data
      const faceData = await FaceRecognitionUtils.captureFaceData(imageUri);
      
      if (!faceData) {
        Alert.alert('Error', 'Unable to detect face in the image. Please try again with better lighting and positioning.');
        setRegistrationStep('capture');
        return;
      }

      // Validate face data quality
      const isValid = FaceRecognitionUtils.validateFaceData(faceData);
      if (!isValid) {
        Alert.alert('Error', 'Face data quality is too low. Please try again.');
        setRegistrationStep('capture');
        return;
      }

      setFormData(prev => ({ ...prev, faceData }));
      
      // Auto-save employee after successful face capture
      await saveEmployee(faceData);
      
    } catch (error) {
      console.error('Error capturing face data:', error);
      Alert.alert('Error', 'Failed to capture face data. Please try again.');
      setRegistrationStep('capture');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveEmployee = async (faceData: string) => {
    try {
      const employee: Employee = {
        id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department.trim(),
        faceData: faceData,
        createdAt: new Date().toISOString(),
      };

      const saved = StorageUtils.saveEmployee(employee);
      
      if (saved) {
        setRegistrationStep('complete');
        setTimeout(() => {
          Alert.alert(
            'Registration Complete!', 
            `${employee.name} has been successfully registered. You can now use face recognition for attendance.`,
            [
              {
                text: 'Continue',
                onPress: () => {
                  setFormData({ name: '', email: '', department: '', faceData: '' });
                  setRegistrationStep('form');
                }
              }
            ]
          );
        }, 2000);
      } else {
        Alert.alert('Error', 'Failed to save employee. Please try again.');
        setRegistrationStep('capture');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      Alert.alert('Error', 'Failed to register employee. Please try again.');
      setRegistrationStep('capture');
    }
  };

  const handleStartRegistration = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!formData.department.trim()) {
      Alert.alert('Error', 'Please enter your department');
      return;
    }

    // Check if email already exists
    const employees = StorageUtils.getEmployees();
    const existingEmployee = employees.find(emp => emp.email.toLowerCase() === formData.email.trim().toLowerCase());
    
    if (existingEmployee) {
      Alert.alert('Error', 'An employee with this email already exists');
      return;
    }

    setRegistrationStep('capture');
    setShowCamera(true);
  };

  if (showCamera) {
    return (
      <CameraCapture
        title="Capture Your Face"
        onCapture={handleFaceCapture}
        onCancel={() => {
          setShowCamera(false);
          setRegistrationStep('form');
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <UserPlus size={48} color="#2563EB" strokeWidth={2} />
          <Text style={styles.title}>Employee Registration</Text>
          <Text style={styles.subtitle}>Join the face recognition attendance system</Text>
        </View>

        {registrationStep === 'form' && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department *</Text>
              <TextInput
                style={styles.input}
                value={formData.department}
                onChangeText={(text) => setFormData(prev => ({ ...prev, department: text }))}
                placeholder="Enter your department"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.infoBox}>
              <AlertCircle size={20} color="#2563EB" strokeWidth={2} />
              <Text style={styles.infoText}>
                After entering your details, you'll be asked to capture your face for the attendance system.
              </Text>
            </View>

            <TouchableOpacity style={styles.continueButton} onPress={handleStartRegistration}>
              <Camera size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.continueButtonText}>Continue to Face Capture</Text>
            </TouchableOpacity>
          </View>
        )}

        {registrationStep === 'processing' && (
          <View style={styles.processingContainer}>
            <View style={styles.processingIcon}>
              <View style={styles.spinner} />
            </View>
            <Text style={styles.processingTitle}>Processing Face Data</Text>
            <Text style={styles.processingText}>
              Analyzing facial features and creating your unique biometric profile...
            </Text>
            <View style={styles.processingSteps}>
              <View style={styles.stepItem}>
                <CheckCircle size={16} color="#16A34A" strokeWidth={2} />
                <Text style={styles.stepText}>Face detected</Text>
              </View>
              <View style={styles.stepItem}>
                <CheckCircle size={16} color="#16A34A" strokeWidth={2} />
                <Text style={styles.stepText}>Quality assessment passed</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepSpinner} />
                <Text style={styles.stepText}>Creating biometric profile...</Text>
              </View>
            </View>
          </View>
        )}

        {registrationStep === 'complete' && (
          <View style={styles.successContainer}>
            <CheckCircle size={80} color="#16A34A" strokeWidth={2} />
            <Text style={styles.successTitle}>Registration Complete!</Text>
            <Text style={styles.successText}>
              Your face has been successfully registered. You can now use the attendance system.
            </Text>
            <View style={styles.successDetails}>
              <Text style={styles.successDetailText}>Name: {formData.name}</Text>
              <Text style={styles.successDetailText}>Email: {formData.email}</Text>
              <Text style={styles.successDetailText}>Department: {formData.department}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  processingContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  processingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  spinner: {
    width: 40,
    height: 40,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    borderTopColor: '#2563EB',
    borderRadius: 20,
  },
  processingTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  processingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  processingSteps: {
    alignSelf: 'stretch',
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 12,
  },
  stepSpinner: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderTopColor: '#2563EB',
    borderRadius: 8,
  },
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  successTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successDetails: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  successDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#16A34A',
    marginBottom: 4,
  },
});