import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, Camera, Save, Users, Trash2 } from 'lucide-react-native';
import CameraCapture from '../../components/CameraCapture';
import { StorageUtils } from '../../utils/storage';
import { FaceRecognitionUtils } from '../../utils/faceRecognition';
import { Employee } from '../../types/attendance';

export default function RegisterScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    faceData: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    const employeeList = StorageUtils.getEmployees();
    setEmployees(employeeList);
  };

  const handleFaceCapture = async (imageUri: string) => {
    setShowCamera(false);
    setIsProcessing(true);

    try {
      const faceData = await FaceRecognitionUtils.captureFaceData(imageUri);
      
      if (!faceData) {
        Alert.alert('Error', 'Unable to detect face in the image. Please try again.');
        return;
      }

      setFormData(prev => ({ ...prev, faceData }));
      Alert.alert('Success', 'Face data captured successfully!');
    } catch (error) {
      console.error('Error capturing face data:', error);
      Alert.alert('Error', 'Failed to capture face data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter employee name');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter employee email');
      return;
    }

    if (!formData.department.trim()) {
      Alert.alert('Error', 'Please enter department');
      return;
    }

    if (!formData.faceData) {
      Alert.alert('Error', 'Please capture face data first');
      return;
    }

    const employee: Employee = {
      id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      department: formData.department.trim(),
      faceData: formData.faceData,
      createdAt: new Date().toISOString(),
    };

    const saved = StorageUtils.saveEmployee(employee);
    
    if (saved) {
      Alert.alert('Success', 'Employee registered successfully!');
      setFormData({ name: '', email: '', department: '', faceData: '' });
      loadEmployees();
    } else {
      Alert.alert('Error', 'Failed to save employee. Please try again.');
    }
  };

  const handleDeleteEmployee = (employee: Employee) => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${employee.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const deleted = StorageUtils.deleteEmployee(employee.id);
            if (deleted) {
              Alert.alert('Success', 'Employee deleted successfully');
              loadEmployees();
            } else {
              Alert.alert('Error', 'Failed to delete employee');
            }
          },
        },
      ]
    );
  };

  if (showCamera) {
    return (
      <CameraCapture
        title="Capture Employee Face"
        onCapture={handleFaceCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Employee Registration</Text>
            <Text style={styles.subtitle}>Add new employees to the system</Text>
          </View>
          <View style={styles.employeeCount}>
            <Users size={20} color="#2563EB" strokeWidth={2} />
            <Text style={styles.employeeCountText}>{employees.length}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>New Employee</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter employee name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="Enter email address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Department</Text>
            <TextInput
              style={styles.input}
              value={formData.department}
              onChangeText={(text) => setFormData(prev => ({ ...prev, department: text }))}
              placeholder="Enter department"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.faceSection}>
            <Text style={styles.label}>Face Data</Text>
            <TouchableOpacity 
              style={[styles.faceButton, formData.faceData && styles.faceButtonSuccess]}
              onPress={() => setShowCamera(true)}
              disabled={isProcessing}
            >
              <Camera size={24} color={formData.faceData ? "#16A34A" : "#6B7280"} strokeWidth={2} />
              <Text style={[styles.faceButtonText, formData.faceData && styles.faceButtonTextSuccess]}>
                {isProcessing 
                  ? 'Processing...' 
                  : formData.faceData 
                    ? 'Face Captured ✓' 
                    : 'Capture Face Data'
                }
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.saveButtonText}>Register Employee</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.employeeList}>
          <Text style={styles.listTitle}>Registered Employees</Text>
          
          {employees.length === 0 ? (
            <View style={styles.emptyState}>
              <UserPlus size={48} color="#D1D5DB" strokeWidth={2} />
              <Text style={styles.emptyStateText}>No employees registered</Text>
              <Text style={styles.emptyStateSubtext}>
                Register your first employee using the form above
              </Text>
            </View>
          ) : (
            <View style={styles.employeeCards}>
              {employees.map((employee) => (
                <View key={employee.id} style={styles.employeeCard}>
                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName}>{employee.name}</Text>
                    <Text style={styles.employeeEmail}>{employee.email}</Text>
                    <Text style={styles.employeeDepartment}>{employee.department}</Text>
                    <Text style={styles.employeeDate}>
                      Registered: {new Date(employee.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEmployee(employee)}
                  >
                    <Trash2 size={20} color="#DC2626" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  employeeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  employeeCountText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginLeft: 6,
  },
  form: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
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
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  faceSection: {
    marginBottom: 24,
  },
  faceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  faceButtonSuccess: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  faceButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  faceButtonTextSuccess: {
    color: '#16A34A',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  employeeList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  listTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  employeeCards: {
    gap: 12,
  },
  employeeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  employeeEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  employeeDepartment: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
    marginTop: 4,
  },
  employeeDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});