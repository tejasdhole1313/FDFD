import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, MapPin, TrendingUp, Shield } from 'lucide-react-native';
import { AttendanceRecord } from '../types/attendance';
import { FaceRecognitionUtils } from '../utils/faceRecognition';

interface AttendanceCardProps {
  record: AttendanceRecord;
}

export default function AttendanceCard({ record }: AttendanceCardProps) {
  const isCheckIn = record.type === 'check-in';
  const time = new Date(record.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const date = new Date(record.timestamp).toLocaleDateString();

  const getConfidenceColor = (confidence: number) => {
    return FaceRecognitionUtils.getConfidenceColor(confidence);
  };

  const getConfidenceLevel = (confidence: number) => {
    return FaceRecognitionUtils.getConfidenceLevel(confidence);
  };

  return (
    <View style={[styles.container, isCheckIn ? styles.checkInBorder : styles.checkOutBorder]}>
      <View style={styles.header}>
        <View style={[styles.statusIndicator, isCheckIn ? styles.checkInIndicator : styles.checkOutIndicator]} />
        <Text style={styles.type}>
          {isCheckIn ? 'Check In' : 'Check Out'}
        </Text>
        {record.confidence && (
          <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(record.confidence) + '20' }]}>
            <Shield size={12} color={getConfidenceColor(record.confidence)} strokeWidth={2} />
            <Text style={[styles.confidenceText, { color: getConfidenceColor(record.confidence) }]}>
              {Math.round(record.confidence * 100)}%
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.employeeName}>{record.employeeName}</Text>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Clock size={16} color="#6B7280" strokeWidth={2} />
          <Text style={styles.detailText}>{time} • {date}</Text>
        </View>
        
        {record.location && (
          <View style={styles.detailRow}>
            <MapPin size={16} color="#6B7280" strokeWidth={2} />
            <Text style={styles.detailText}>{record.location}</Text>
          </View>
        )}

        {record.confidence && (
          <View style={styles.detailRow}>
            <TrendingUp size={16} color={getConfidenceColor(record.confidence)} strokeWidth={2} />
            <Text style={[styles.detailText, { color: getConfidenceColor(record.confidence) }]}>
              {getConfidenceLevel(record.confidence)} Match
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  checkInBorder: {
    borderLeftColor: '#16A34A',
  },
  checkOutBorder: {
    borderLeftColor: '#EA580C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  checkInIndicator: {
    backgroundColor: '#16A34A',
  },
  checkOutIndicator: {
    backgroundColor: '#EA580C',
  },
  type: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    flex: 1,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  employeeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  details: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 8,
  },
});