import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Filter, Download, Clock, Users } from 'lucide-react-native';
import AttendanceCard from '../../components/AttendanceCard';
import { StorageUtils } from '../../utils/storage';
import { AttendanceRecord, DailyAttendance } from '../../types/attendance';

export default function HistoryScreen() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadAttendanceData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [attendanceRecords, selectedFilter]);

  const loadAttendanceData = () => {
    const records = StorageUtils.getAttendanceRecords();
    setAttendanceRecords(records);
  };

  const applyFilter = () => {
    const now = new Date();
    let filtered = [...attendanceRecords];

    switch (selectedFilter) {
      case 'today':
        const today = now.toISOString().split('T')[0];
        filtered = filtered.filter(record => record.timestamp.startsWith(today));
        break;
      
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(record => new Date(record.timestamp) >= weekAgo);
        break;
      
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(record => new Date(record.timestamp) >= monthAgo);
        break;
      
      default:
        // 'all' - no filtering needed
        break;
    }

    setFilteredRecords(filtered);
  };

  const getDailyAttendanceSummary = (): DailyAttendance[] => {
    const summary: { [key: string]: DailyAttendance } = {};
    
    filteredRecords.forEach(record => {
      const date = record.timestamp.split('T')[0];
      const key = `${record.employeeId}_${date}`;
      
      if (!summary[key]) {
        summary[key] = {
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          date,
          checkIn: undefined,
          checkOut: undefined,
          totalHours: undefined,
        };
      }
      
      if (record.type === 'check-in') {
        if (!summary[key].checkIn || record.timestamp > summary[key].checkIn!) {
          summary[key].checkIn = record.timestamp;
        }
      } else {
        if (!summary[key].checkOut || record.timestamp > summary[key].checkOut!) {
          summary[key].checkOut = record.timestamp;
        }
      }
    });

    // Calculate total hours
    Object.values(summary).forEach(day => {
      if (day.checkIn && day.checkOut) {
        const checkInTime = new Date(day.checkIn).getTime();
        const checkOutTime = new Date(day.checkOut).getTime();
        const diffInHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        day.totalHours = Math.round(diffInHours * 100) / 100;
      }
    });

    return Object.values(summary).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getFilterStats = () => {
    const uniqueEmployees = new Set(filteredRecords.map(r => r.employeeId));
    const uniqueDates = new Set(filteredRecords.map(r => r.timestamp.split('T')[0]));
    
    return {
      totalRecords: filteredRecords.length,
      uniqueEmployees: uniqueEmployees.size,
      uniqueDates: uniqueDates.size,
    };
  };

  const filters = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ] as const;

  const stats = getFilterStats();
  const dailySummary = getDailyAttendanceSummary();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Attendance History</Text>
            <Text style={styles.subtitle}>View and analyze attendance records</Text>
          </View>
          <TouchableOpacity style={styles.exportButton}>
            <Download size={20} color="#2563EB" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <Filter size={20} color="#6B7280" strokeWidth={2} />
            <Text style={styles.filterTitle}>Filter by period</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter.key && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Clock size={20} color="#2563EB" strokeWidth={2} />
            <Text style={styles.statNumber}>{stats.totalRecords}</Text>
            <Text style={styles.statLabel}>Total Records</Text>
          </View>
          
          <View style={styles.statCard}>
            <Users size={20} color="#16A34A" strokeWidth={2} />
            <Text style={styles.statNumber}>{stats.uniqueEmployees}</Text>
            <Text style={styles.statLabel}>Employees</Text>
          </View>
          
          <View style={styles.statCard}>
            <Calendar size={20} color="#EA580C" strokeWidth={2} />
            <Text style={styles.statNumber}>{stats.uniqueDates}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
        </View>

        {dailySummary.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Daily Summary</Text>
            
            <View style={styles.summaryCards}>
              {dailySummary.slice(0, 5).map((day, index) => (
                <View key={`${day.employeeId}_${day.date}`} style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <Text style={styles.summaryEmployeeName}>{day.employeeName}</Text>
                    <Text style={styles.summaryDate}>
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryTimes}>
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeLabel}>Check In</Text>
                      <Text style={styles.timeValue}>
                        {day.checkIn 
                          ? new Date(day.checkIn).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          : '--:--'
                        }
                      </Text>
                    </View>
                    
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeLabel}>Check Out</Text>
                      <Text style={styles.timeValue}>
                        {day.checkOut 
                          ? new Date(day.checkOut).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          : '--:--'
                        }
                      </Text>
                    </View>
                    
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeLabel}>Hours</Text>
                      <Text style={[styles.timeValue, styles.hoursValue]}>
                        {day.totalHours ? `${day.totalHours}h` : '--'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>
            Detailed Records ({filteredRecords.length})
          </Text>
          
          {filteredRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={48} color="#D1D5DB" strokeWidth={2} />
              <Text style={styles.emptyStateText}>No records found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your filter or check back later
              </Text>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {filteredRecords.map((record) => (
                <AttendanceCard key={record.id} record={record} />
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
  exportButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginLeft: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
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
    fontSize: 20,
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
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  summaryCards: {
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryEmployeeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  summaryDate: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  summaryTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  hoursValue: {
    color: '#2563EB',
  },
  recordsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  recordsList: {
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