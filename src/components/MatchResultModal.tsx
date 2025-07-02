import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, Camera, X } from 'lucide-react-native';
import { MatchResult } from '../utils/faceRecognition';
import { FaceRecognitionUtils } from '../utils/faceRecognition';

interface MatchResultModalProps {
  result: MatchResult;
  onClose: () => void;
  onRetry: () => void;
}

export default function MatchResultModal({ result, onClose, onRetry }: MatchResultModalProps) {
  const getStatusIcon = () => {
    switch (result.matchStatus) {
      case 'verified':
        return <CheckCircle size={64} color="#16A34A" strokeWidth={2} />;
      case 'unverified':
        return <AlertCircle size={64} color="#EAB308" strokeWidth={2} />;
      case 'rejected':
      case 'no_match':
        return <XCircle size={64} color="#DC2626" strokeWidth={2} />;
      default:
        return <XCircle size={64} color="#6B7280" strokeWidth={2} />;
    }
  };

  const getStatusColor = () => {
    return FaceRecognitionUtils.getStatusColor(result.matchStatus);
  };

  const getStatusTitle = () => {
    switch (result.matchStatus) {
      case 'verified':
        return 'Face Verified Successfully!';
      case 'unverified':
        return 'Face Match Found';
      case 'rejected':
        return 'Face Match Rejected';
      case 'no_match':
        return 'No Face Match Found';
      default:
        return 'Recognition Result';
    }
  };

  const getStatusMessage = () => {
    if (result.reason) {
      return result.reason;
    }

    switch (result.matchStatus) {
      case 'verified':
        return `${result.employee?.name} has been successfully verified with ${Math.round(result.confidence * 100)}% confidence.`;
      case 'unverified':
        return `Possible match with ${result.employee?.name} (${Math.round(result.confidence * 100)}% confidence). Manual verification recommended.`;
      case 'rejected':
        return 'The captured face does not meet the minimum confidence threshold for attendance.';
      case 'no_match':
        return 'No matching face found in the employee database. Please register first or try again.';
      default:
        return 'Unable to process face recognition.';
    }
  };

  const showRetryButton = result.matchStatus === 'rejected' || result.matchStatus === 'no_match';
  const showEmployeeInfo = result.employee && (result.matchStatus === 'verified' || result.matchStatus === 'unverified');

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              {getStatusIcon()}
            </View>

            <Text style={styles.title}>{getStatusTitle()}</Text>
            
            <Text style={styles.message}>{getStatusMessage()}</Text>

            {showEmployeeInfo && (
              <View style={styles.employeeInfo}>
                <View style={styles.employeeCard}>
                  <Text style={styles.employeeName}>{result.employee?.name}</Text>
                  <Text style={styles.employeeDepartment}>{result.employee?.department}</Text>
                  <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceLabel}>Confidence:</Text>
                    <Text style={[styles.confidenceValue, { color: getStatusColor() }]}>
                      {Math.round(result.confidence * 100)}%
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {result.confidence > 0 && !showEmployeeInfo && (
              <View style={styles.confidenceInfo}>
                <Text style={styles.confidenceText}>
                  Match Confidence: {Math.round(result.confidence * 100)}%
                </Text>
              </View>
            )}

            <View style={styles.actions}>
              {showRetryButton && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                  <Camera size={20} color="#2563EB" strokeWidth={2} />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.closeActionButton, !showRetryButton && styles.closeActionButtonFull]} 
                onPress={onClose}
              >
                <Text style={styles.closeActionButtonText}>
                  {result.matchStatus === 'verified' ? 'Continue' : 'Close'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  employeeInfo: {
    width: '100%',
    marginBottom: 20,
  },
  employeeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  employeeName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  employeeDepartment: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
    marginBottom: 12,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginRight: 8,
  },
  confidenceValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  confidenceInfo: {
    marginBottom: 20,
  },
  confidenceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginLeft: 8,
  },
  closeActionButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeActionButtonFull: {
    flex: 1,
  },
  closeActionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});