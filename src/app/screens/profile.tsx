import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Database, Trash2, Shield, Info, Users, Clock, RefreshCw } from 'lucide-react-native';
import { StorageUtils } from '../../utils/storage';
import { Employee, AttendanceRecord } from '../../types/attendance';

export default function ProfileScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const employeeList = StorageUtils.getEmployees();
    const records = StorageUtils.getAttendanceRecords();
    setEmployees(employeeList);
    setAttendanceRecords(records);
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all employees and attendance records. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: () => {
            const cleared = StorageUtils.clearAllData();
            if (cleared) {
              Alert.alert('Success', 'All data has been cleared successfully');
              loadData();
            } else {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleResetDemoData = () => {
    Alert.alert(
      'Reset Demo Data',
      'This will restore the original demo employees and sample attendance records. Any custom data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Demo Data',
          style: 'default',
          onPress: () => {
            const reset = StorageUtils.resetDemoData();
            if (reset) {
              Alert.alert('Success', 'Demo data has been reset successfully');
              loadData();
            } else {
              Alert.alert('Error', 'Failed to reset demo data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getSystemStats = () => {
    const totalRecords = attendanceRecords.length;
    const totalEmployees = employees.length;
    
    // Calculate storage usage (rough estimate)
    const employeesSize = JSON.stringify(employees).length;
    const recordsSize = JSON.stringify(attendanceRecords).length;
    const totalSize = employeesSize + recordsSize;
    const sizeInKB = Math.round(totalSize / 1024 * 100) / 100;

    // Get date range
    const dates = attendanceRecords.map(r => new Date(r.timestamp));
    const oldestRecord = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const newestRecord = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

    return {
      totalRecords,
      totalEmployees,
      storageSize: sizeInKB,
      oldestRecord,
      newestRecord,
    };
  };

  const stats = getSystemStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>System Profile</Text>
            <Text style={styles.subtitle}>Settings and system information</Text>
          </View>
          <View style={styles.profileIcon}>
            <User size={24} color="#2563EB" strokeWidth={2} />
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Users size={24} color="#2563EB" strokeWidth={2} />
              <Text style={styles.statNumber}>{stats.totalEmployees}</Text>
              <Text style={styles.statLabel}>Registered Employees</Text>
            </View>
            
            <View style={styles.statCard}>
              <Clock size={24} color="#16A34A" strokeWidth={2} />
              <Text style={styles.statNumber}>{stats.totalRecords}</Text>
              <Text style={styles.statLabel}>Attendance Records</Text>
            </View>
            
            <View style={styles.statCard}>
              <Database size={24} color="#EA580C" strokeWidth={2} />
              <Text style={styles.statNumber}>{stats.storageSize}</Text>
              <Text style={styles.statLabel}>KB Used</Text>
            </View>
          </View>

          {stats.oldestRecord && (
            <View style={styles.dateRange}>
              <Text style={styles.dateRangeLabel}>Data Range</Text>
              <Text style={styles.dateRangeText}>
                {stats.oldestRecord.toLocaleDateString()} - {stats.newestRecord?.toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>System Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Shield size={20} color="#6B7280" strokeWidth={2} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Data Storage</Text>
                <Text style={styles.infoDescription}>
                  All data is stored locally on your device using MMKV for fast and secure access. 
                  No data is sent to external servers.
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Info size={20} color="#6B7280" strokeWidth={2} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Face Recognition</Text>
                <Text style={styles.infoDescription}>
                  Face data is processed locally for privacy and security. The system uses 
                  computer vision algorithms to match faces for attendance tracking.
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Database size={20} color="#6B7280" strokeWidth={2} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Demo Data</Text>
                <Text style={styles.infoDescription}>
                  The app includes sample employees and attendance records for demonstration. 
                  Use demo mode to test face recognition functionality.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <View style={styles.actionCard}>
            <TouchableOpacity style={styles.actionButton}>
              <Settings size={20} color="#2563EB" strokeWidth={2} />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>System Settings</Text>
                <Text style={styles.actionDescription}>Configure app preferences and defaults</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Database size={20} color="#16A34A" strokeWidth={2} />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Export Data</Text>
                <Text style={styles.actionDescription}>Export attendance data to CSV format</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleResetDemoData}
            >
              <RefreshCw size={20} color="#EA580C" strokeWidth={2} />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Reset Demo Data</Text>
                <Text style={styles.actionDescription}>
                  Restore original demo employees and sample records
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerAction]}
              onPress={handleClearAllData}
            >
              <Trash2 size={20} color="#DC2626" strokeWidth={2} />
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, styles.dangerActionTitle]}>Clear All Data</Text>
                <Text style={[styles.actionDescription, styles.dangerActionDescription]}>
                  Permanently delete all employees and records
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Face Recognition Attendance v1.0.0</Text>
          <Text style={styles.versionSubtext}>Built with Expo & React Native</Text>
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
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  dateRange: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateRangeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  dateRangeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  dangerAction: {
    backgroundColor: '#FEF2F2',
  },
  dangerActionTitle: {
    color: '#DC2626',
  },
  dangerActionDescription: {
    color: '#B91C1C',
  },
  versionSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  versionSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 4,
  },
});