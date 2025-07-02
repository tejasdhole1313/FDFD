import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Circle as XCircle, Camera } from 'lucide-react-native';

interface FaceQualityIndicatorProps {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
  issues: string[];
}

export default function FaceQualityIndicator({ quality, score, issues }: FaceQualityIndicatorProps) {
  const getQualityIcon = () => {
    switch (quality) {
      case 'excellent':
        return <CheckCircle size={20} color="#16A34A" strokeWidth={2} />;
      case 'good':
        return <CheckCircle size={20} color="#65A30D" strokeWidth={2} />;
      case 'fair':
        return <AlertCircle size={20} color="#EAB308" strokeWidth={2} />;
      case 'poor':
        return <XCircle size={20} color="#DC2626" strokeWidth={2} />;
    }
  };

  const getQualityColor = () => {
    switch (quality) {
      case 'excellent': return '#16A34A';
      case 'good': return '#65A30D';
      case 'fair': return '#EAB308';
      case 'poor': return '#DC2626';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {getQualityIcon()}
        <Text style={[styles.qualityText, { color: getQualityColor() }]}>
          {quality.charAt(0).toUpperCase() + quality.slice(1)} Quality
        </Text>
        <Text style={styles.scoreText}>
          {Math.round(score * 100)}%
        </Text>
      </View>
      
      {issues.length > 0 && (
        <View style={styles.issuesContainer}>
          <Text style={styles.issuesTitle}>Suggestions:</Text>
          {issues.map((issue, index) => (
            <Text key={index} style={styles.issueText}>
              • {issue}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qualityText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    flex: 1,
  },
  scoreText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#6B7280',
  },
  issuesContainer: {
    marginTop: 4,
  },
  issuesTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  issueText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 8,
  },
});