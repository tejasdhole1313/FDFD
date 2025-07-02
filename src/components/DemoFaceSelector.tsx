import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { User, Camera, X, Database, Shield } from 'lucide-react-native';
import { Employee } from '../types/attendance';
import { getDemoFaceData } from '../utils/dummyData';

interface DemoFaceSelectorProps {
  employees: Employee[];
  onSelectEmployee: (employeeId: string, faceData: string) => void;
  onCancel: () => void;
}

export default function DemoFaceSelector({ employees, onSelectEmployee, onCancel }: DemoFaceSelectorProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee.id);
    
    // Simulate face capture and processing delay
    setTimeout(() => {
      const demoFaceData = getDemoFaceData(employee.id);
      onSelectEmployee(employee.id, demoFaceData);
    }, 2000);
  };

  // Demo profile images from Pexels
  const getProfileImage = (index: number) => {
    const images = [
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    ];
    return images[index % images.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <X size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demo Face Recognition</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.instructionContainer}>
          <View style={styles.iconRow}>
            <Database size={32} color="#2563EB" strokeWidth={2} />
            <Shield size={32} color="#16A34A" strokeWidth={2} />
            <Camera size={32} color="#EA580C" strokeWidth={2} />
          </View>
          <Text style={styles.instructionTitle}>Test Face Recognition System</Text>
          <Text style={styles.instructionText}>
            Select any employee below to simulate their face being captured and matched against the database. 
            The system will demonstrate realistic verification scenarios including successful matches, 
            low confidence rejections, and no-match cases.
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Real-time face detection simulation</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Confidence scoring and verification</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Database matching with multiple scenarios</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.employeeList} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Registered Employees ({employees.length})</Text>
          
          {employees.map((employee, index) => (
            <TouchableOpacity
              key={employee.id}
              style={[
                styles.employeeCard,
                selectedEmployee === employee.id && styles.employeeCardSelected
              ]}
              onPress={() => handleEmployeeSelect(employee)}
              disabled={selectedEmployee !== null}
            >
              <Image
                source={{ uri: getProfileImage(index) }}
                style={styles.profileImage}
              />
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{employee.name}</Text>
                <Text style={styles.employeeDepartment}>{employee.department}</Text>
                <Text style={styles.employeeEmail}>{employee.email}</Text>
                <View style={styles.employeeMetadata}>
                  <Text style={styles.employeeId}>ID: {employee.id}</Text>
                  <View style={styles.faceDataIndicator}>
                    <Shield size={12} color="#16A34A" strokeWidth={2} />
                    <Text style={styles.faceDataText}>Face Data Registered</Text>
                  </View>
                </View>
              </View>
              {selectedEmployee === employee.id && (
                <View style={styles.processingIndicator}>
                  <View style={styles.processingDot} />
                  <Text style={styles.processingText}>Processing...</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This demo simulates production-level face recognition with realistic confidence scoring, 
            database matching, and various verification scenarios you would encounter in a real deployment.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  instructionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  featureList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  employeeList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  employeeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  employeeCardSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  employeeDepartment: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
    marginBottom: 2,
  },
  employeeEmail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 6,
  },
  employeeMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  employeeId: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  faceDataIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faceDataText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#16A34A',
    marginLeft: 4,
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2563EB',
    borderRadius: 16,
  },
  processingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  processingText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});