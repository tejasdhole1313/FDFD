import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Users, Clock, TrendingUp, TestTube, Database, Scan } from 'lucide-react-native';
import CameraCapture from '../../components/CameraCapture';
import DemoFaceSelector from '../../components/DemoFaceSelector';
import AutoFaceRecognition from '../../components/AutoFaceRecognition';
import AttendanceCard from '../../components/AttendanceCard';
import MatchResultModal from '../../components/MatchResultModal';
import { StorageUtils } from '../../utils/storage';
import { FaceRecognitionUtils, MatchResult } from '../../utils/faceRecognition';
import { Employee, AttendanceRecord } from '../../types/attendance';

export default function HomeScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [showDemoSelector, setShowDemoSelector] = useState(false);
  const [showAutoRecognition, setShowAutoRecognition] = useState(false);
  const [showMatchResult, setShowMatchResult] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const employeeList = StorageUtils.getEmployees();
    const attendance = StorageUtils.getTodayAttendance();
    setEmployees(employeeList);
    setTodayAttendance(attendance);
  };

  const handleAutoRecognitionResult = (result: MatchResult) => {
    setShowAutoRecognition(false);
    setMatchResult(result);
    setShowMatchResult(true);
    loadData(); // Refresh data after recognition
  };

  const handleFaceCapture = async (imageUri: string) => {
    setShowCamera(false);
    setIsProcessing(true);

    try {
      // Capture face data from image
      const faceData = await FaceRecognitionUtils.captureFaceData(imageUri);
      
      if (!faceData) {
        const result: MatchResult = {
          isMatch: false,
          confidence: 0,
          matchStatus: 'rejected',
          reason: 'Unable to detect face in the image. Please try again with better lighting and positioning.'
        };
        setMatchResult(result);
        setShowMatchResult(true);
        return;
      }

      // Match face against database
      const result = await FaceRecognitionUtils.matchFaceAgainstDatabase(faceData, employees);
      setMatchResult(result);
      setShowMatchResult(true);

      // Process attendance if verified match
      if (result.isMatch && result.matchStatus === 'verified' && result.employee) {
        await processAttendance({
          confidence: result.confidence,
          employeeId: result.employee.id,
          employeeName: result.employee.name
        });
      }

    } catch (error) {
      console.error('Error processing attendance:', error);
      const result: MatchResult = {
        isMatch: false,
        confidence: 0,
        matchStatus: 'rejected',
        reason: 'An error occurred while processing face data. Please try again.'
      };
      setMatchResult(result);
      setShowMatchResult(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDemoFaceCapture = async (employeeId: string, faceData: string) => {
    setShowDemoSelector(false);
    setIsProcessing(true);

    try {
      // Find the selected employee
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) {
        const result: MatchResult = {
          isMatch: false,
          confidence: 0,
          matchStatus: 'no_match',
          reason: 'Employee not found in database.'
        };
        setMatchResult(result);
        setShowMatchResult(true);
        return;
      }

      // Simulate realistic face matching
      const result = await FaceRecognitionUtils.simulateLiveFaceDetection(employeeId);
      
      // Add employee info if match found
      if (result.isMatch) {
        result.employee = {
          id: employee.id,
          name: employee.name,
          department: employee.department
        };
      }
      
      setMatchResult(result);
      setShowMatchResult(true);

      // Process attendance if verified match
      if (result.isMatch && result.matchStatus === 'verified') {
        await processAttendance({
          confidence: result.confidence,
          employeeId: employee.id,
          employeeName: employee.name
        });
      }

    } catch (error) {
      console.error('Error processing demo attendance:', error);
      const result: MatchResult = {
        isMatch: false,
        confidence: 0,
        matchStatus: 'rejected',
        reason: 'An error occurred while processing demo attendance.'
      };
      setMatchResult(result);
      setShowMatchResult(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const processAttendance = async (match: { confidence: number; employeeId: string; employeeName: string }) => {
    // Determine check-in or check-out
    const employeeToday = todayAttendance.filter(r => r.employeeId === match.employeeId);
    const lastRecord = employeeToday[0]; // Most recent record
    const isCheckingIn = !lastRecord || lastRecord.type === 'check-out';
    
    // Create attendance record
    const attendanceRecord: AttendanceRecord = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employeeId: match.employeeId,
      employeeName: match.employeeName,
      type: isCheckingIn ? 'check-in' : 'check-out',
      timestamp: new Date().toISOString(),
      location: 'Main Office',
      confidence: match.confidence,
    };

    // Save attendance record
    const saved = StorageUtils.saveAttendanceRecord(attendanceRecord);
    
    if (saved) {
      loadData(); // Refresh data
    }
  };

  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const checkedInToday = new Set();
    const checkedOutToday = new Set();
    
    todayAttendance.forEach(record => {
      if (record.type === 'check-in') {
        checkedInToday.add(record.employeeId);
      } else {
        checkedOutToday.add(record.employeeId);
      }
    });

    return {
      totalEmployees: employees.length,
      checkedIn: checkedInToday.size,
      checkedOut: checkedOutToday.size,
      present: checkedInToday.size - checkedOutToday.size,
    };
  };

  const stats = getStats();

  if (showAutoRecognition) {
    return (
      <AutoFaceRecognition
        title="Automated Face Recognition"
        onMatch={handleAutoRecognitionResult}
        onCancel={() => setShowAutoRecognition(false)}
      />
    );
  }

  if (showCamera) {
    return (
      <CameraCapture
        title="Face Recognition Attendance"
        onCapture={handleFaceCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  if (showDemoSelector) {
    return (
      <DemoFaceSelector
        employees={employees}
        onSelectEmployee={handleDemoFaceCapture}
        onCancel={() => setShowDemoSelector(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Face Recognition</Text>
            <Text style={styles.subtitle}>Automated Attendance System</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.databaseIndicator}>
              <Database size={16} color="#16A34A" strokeWidth={2} />
              <Text style={styles.databaseText}>{employees.length} Registered</Text>
            </View>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.autoScanButton, isProcessing && styles.autoScanButtonDisabled]}
            onPress={() => setShowAutoRecognition(true)}
            disabled={isProcessing}
          >
            <Scan size={28} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.autoScanButtonText}>
              {isProcessing ? 'Processing...' : 'Auto Face Recognition'}
            </Text>
            <Text style={styles.autoScanSubtext}>
              Automatic detection and verification
            </Text>
          </TouchableOpacity>

          <View style={styles.manualOptions}>
            <TouchableOpacity 
              style={[styles.manualButton, isProcessing && styles.manualButtonDisabled]}
              onPress={() => setShowCamera(true)}
              disabled={isProcessing}
            >
              <Camera size={20} color="#2563EB" strokeWidth={2} />
              <Text style={styles.manualButtonText}>Manual Capture</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.manualButton, isProcessing && styles.manualButtonDisabled]}
              onPress={() => setShowDemoSelector(true)}
              disabled={isProcessing}
            >
              <TestTube size={20} color="#2563EB" strokeWidth={2} />
              <Text style={styles.manualButtonText}>Demo Mode</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color="#2563EB" strokeWidth={2} />
            <Text style={styles.statNumber}>{stats.totalEmployees}</Text>
            <Text style={styles.statLabel}>Total Employees</Text>
          </View>
          
          <View style={styles.statCard}>
            <Clock size={24} color="#16A34A" strokeWidth={2} />
            <Text style={styles.statNumber}>{stats.present}</Text>
            <Text style={styles.statLabel}>Currently Present</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#EA580C" strokeWidth={2} />
            <Text style={styles.statNumber}>{stats.checkedIn}</Text>
            <Text style={styles.statLabel}>Checked In Today</Text>
          </View>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          
          {todayAttendance.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={48} color="#D1D5DB" strokeWidth={2} />
              <Text style={styles.emptyStateText}>No attendance records today</Text>
              <Text style={styles.emptyStateSubtext}>
                Use automated face recognition to record attendance
              </Text>
            </View>
          ) : (
            <View style={styles.attendanceList}>
              {todayAttendance.slice(0, 5).map((record) => (
                <AttendanceCard key={record.id} record={record} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {showMatchResult && matchResult && (
        <MatchResultModal
          result={matchResult}
          onClose={() => setShowMatchResult(false)}
          onRetry={() => {
            setShowMatchResult(false);
            setShowAutoRecognition(true);
          }}
        />
      )}
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
  headerRight: {
    alignItems: 'flex-end',
  },
  databaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  databaseText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#16A34A',
    marginLeft: 4,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  autoScanButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 24,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  autoScanButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
  },
  autoScanButtonText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  autoScanSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    marginTop: 4,
  },
  manualOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  manualButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
  },
  manualButtonDisabled: {
    borderColor: '#9CA3AF',
  },
  manualButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
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
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  attendanceList: {
    gap: 8,
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