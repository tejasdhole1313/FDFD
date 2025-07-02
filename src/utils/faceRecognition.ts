// Enhanced face recognition utility with realistic database matching
// This implementation simulates production-level face recognition with proper verification

export interface FaceMatch {
    confidence: number;
    employeeId: string;
    employeeName: string;
    matchStatus: 'verified' | 'unverified' | 'rejected';
  }
  
  export interface FaceFeatures {
    landmarks: number[];
    descriptors: number[];
    boundingBox: { x: number; y: number; width: number; height: number };
    quality: number;
    timestamp: string;
  }
  
  export interface MatchResult {
    attendanceType: string;
    isMatch: boolean;
    confidence: number;
    employee?: {
      id: string;
      name: string;
      department: string;
    };
    matchStatus: 'verified' | 'unverified' | 'rejected' | 'no_match';
    reason?: string;
  }
  
  export const FaceRecognitionUtils = {
    // Enhanced face capture with quality assessment
    captureFaceData: async (imageUri: string): Promise<string | null> => {
      try {
        // Simulate realistic face detection processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate face detection success/failure based on image quality
        const detectionSuccess = Math.random() > 0.1; // 90% success rate
        
        if (!detectionSuccess) {
          return null; // Face not detected
        }
        
        // Generate realistic face features with quality assessment
        const quality = 0.6 + Math.random() * 0.4; // Quality score 60-100%
        
        const faceFeatures: FaceFeatures = {
          landmarks: Array.from({ length: 68 }, () => Math.random() * 100),
          descriptors: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
          boundingBox: {
            x: 50 + Math.random() * 20,
            y: 60 + Math.random() * 20,
            width: 120 + Math.random() * 40,
            height: 150 + Math.random() * 40
          },
          quality,
          timestamp: new Date().toISOString()
        };
        
        return btoa(JSON.stringify(faceFeatures));
      } catch (error) {
        console.error('Error capturing face data:', error);
        return null;
      }
    },
  
    // Enhanced database matching with verification logic
    matchFaceAgainstDatabase: async (capturedFaceData: string, storedEmployees: any[]): Promise<MatchResult> => {
      try {
        if (!capturedFaceData || storedEmployees.length === 0) {
          return {
            isMatch: false,
            confidence: 0,
            matchStatus: 'no_match',
            reason: 'No employees in database'
          };
        }
  
        // Decode captured face features
        const capturedFeatures: FaceFeatures = JSON.parse(atob(capturedFaceData));
        
        // Check face quality first
        if (capturedFeatures.quality < 0.5) {
          return {
            isMatch: false,
            confidence: 0,
            matchStatus: 'rejected',
            reason: 'Poor image quality - please try again with better lighting'
          };
        }
  
        let bestMatch: {
          employee: any;
          confidence: number;
          similarity: number;
        } | null = null;
  
        // Compare against all employees in database
        for (const employee of storedEmployees) {
          if (!employee.faceData) continue;
  
          try {
            const storedFeatures: FaceFeatures = JSON.parse(atob(employee.faceData));
            
            // Calculate multiple similarity metrics
            const descriptorSimilarity = FaceRecognitionUtils.calculateCosineSimilarity(
              capturedFeatures.descriptors,
              storedFeatures.descriptors
            );
            
            const landmarkSimilarity = FaceRecognitionUtils.calculateLandmarkSimilarity(
              capturedFeatures.landmarks,
              storedFeatures.landmarks
            );
            
            // Combined similarity score
            const overallSimilarity = (descriptorSimilarity * 0.7) + (landmarkSimilarity * 0.3);
            
            // Apply quality factor
            const qualityFactor = Math.min(capturedFeatures.quality, storedFeatures.quality || 1);
            const adjustedConfidence = overallSimilarity * qualityFactor;
  
            if (!bestMatch || adjustedConfidence > bestMatch.confidence) {
              bestMatch = {
                employee,
                confidence: adjustedConfidence,
                similarity: overallSimilarity
              };
            }
          } catch (error) {
            console.error('Error processing stored face data for employee:', employee.name);
          }
        }
  
        // Determine match status based on confidence thresholds
        if (!bestMatch) {
          return {
            isMatch: false,
            confidence: 0,
            matchStatus: 'no_match',
            reason: 'No face data found in database'
          };
        }
  
        const { employee, confidence, similarity } = bestMatch;
  
        // Production-level confidence thresholds
        if (confidence >= 0.85) {
          return {
            isMatch: true,
            confidence: Math.round(confidence * 100) / 100,
            employee: {
              id: employee.id,
              name: employee.name,
              department: employee.department
            },
            matchStatus: 'verified'
          };
        } else if (confidence >= 0.70) {
          return {
            isMatch: true,
            confidence: Math.round(confidence * 100) / 100,
            employee: {
              id: employee.id,
              name: employee.name,
              department: employee.department
            },
            matchStatus: 'unverified',
            reason: 'Medium confidence - manual verification recommended'
          };
        } else if (confidence >= 0.50) {
          return {
            isMatch: false,
            confidence: Math.round(confidence * 100) / 100,
            matchStatus: 'rejected',
            reason: `Low confidence match with ${employee.name} (${Math.round(confidence * 100)}%)`
          };
        } else {
          return {
            isMatch: false,
            confidence: Math.round(confidence * 100) / 100,
            matchStatus: 'no_match',
            reason: 'No matching face found in database'
          };
        }
  
      } catch (error) {
        console.error('Error matching face against database:', error);
        return {
          isMatch: false,
          confidence: 0,
          matchStatus: 'rejected',
          reason: 'Error processing face data'
        };
      }
    },
  
    // Legacy method for backward compatibility
    matchFace: async (capturedFaceData: string, storedEmployees: any[]): Promise<FaceMatch | null> => {
      const result = await FaceRecognitionUtils.matchFaceAgainstDatabase(capturedFaceData, storedEmployees);
      
      if (result.isMatch && result.employee) {
        return {
          confidence: result.confidence,
          employeeId: result.employee.id,
          employeeName: result.employee.name,
          matchStatus: result.matchStatus as 'verified' | 'unverified' | 'rejected'
        };
      }
      
      return null;
    },
  
    // Calculate cosine similarity between descriptor vectors
    calculateCosineSimilarity: (descriptors1: number[], descriptors2: number[]): number => {
      if (descriptors1.length !== descriptors2.length) {
        return 0;
      }
  
      let dotProduct = 0;
      let norm1 = 0;
      let norm2 = 0;
  
      for (let i = 0; i < descriptors1.length; i++) {
        dotProduct += descriptors1[i] * descriptors2[i];
        norm1 += descriptors1[i] * descriptors1[i];
        norm2 += descriptors2[i] * descriptors2[i];
      }
  
      const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
      if (magnitude === 0) return 0;
  
      const cosineSimilarity = dotProduct / magnitude;
      return (cosineSimilarity + 1) / 2; // Normalize to 0-1 range
    },
  
    // Calculate landmark similarity
    calculateLandmarkSimilarity: (landmarks1: number[], landmarks2: number[]): number => {
      if (landmarks1.length !== landmarks2.length) {
        return 0;
      }
  
      let totalDistance = 0;
      for (let i = 0; i < landmarks1.length; i++) {
        totalDistance += Math.abs(landmarks1[i] - landmarks2[i]);
      }
  
      const avgDistance = totalDistance / landmarks1.length;
      const maxDistance = 100; // Normalize based on expected max distance
      
      return Math.max(0, 1 - (avgDistance / maxDistance));
    },
  
    // Validate face data quality
    validateFaceData: (faceData: string): boolean => {
      try {
        if (!faceData) return false;
        
        const features: FaceFeatures = JSON.parse(atob(faceData));
        
        return (
          features.landmarks && features.landmarks.length === 68 &&
          features.descriptors && features.descriptors.length === 128 &&
          features.boundingBox &&
          features.boundingBox.width > 50 &&
          features.boundingBox.height > 50 &&
          features.quality > 0.3
        );
      } catch (error) {
        return false;
      }
    },
  
    // Get confidence level description
    getConfidenceLevel: (confidence: number): string => {
      if (confidence >= 0.95) return 'Excellent';
      if (confidence >= 0.85) return 'Very High';
      if (confidence >= 0.75) return 'High';
      if (confidence >= 0.65) return 'Good';
      if (confidence >= 0.55) return 'Fair';
      return 'Low';
    },
  
    // Get match status description
    getMatchStatusDescription: (status: string): string => {
      switch (status) {
        case 'verified': return 'Verified Match';
        case 'unverified': return 'Unverified Match';
        case 'rejected': return 'Match Rejected';
        case 'no_match': return 'No Match Found';
        default: return 'Unknown Status';
      }
    },
  
    // Get confidence color for UI
    getConfidenceColor: (confidence: number): string => {
      if (confidence >= 0.85) return '#16A34A'; // Green
      if (confidence >= 0.75) return '#65A30D'; // Light green
      if (confidence >= 0.65) return '#EAB308'; // Yellow
      if (confidence >= 0.55) return '#F59E0B'; // Orange
      return '#DC2626'; // Red
    },
  
    // Get status color for UI
    getStatusColor: (status: string): string => {
      switch (status) {
        case 'verified': return '#16A34A';
        case 'unverified': return '#EAB308';
        case 'rejected': return '#DC2626';
        case 'no_match': return '#6B7280';
        default: return '#6B7280';
      }
    },
  
    // Simulate face quality assessment
    assessFaceQuality: (imageUri: string): Promise<{
      quality: 'excellent' | 'good' | 'fair' | 'poor';
      issues: string[];
      score: number;
    }> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const score = 0.6 + Math.random() * 0.4;
          const issues: string[] = [];
          
          if (score < 0.7) issues.push('Low lighting detected');
          if (score < 0.8) issues.push('Face angle not optimal');
          if (Math.random() < 0.3) issues.push('Motion blur detected');
          if (Math.random() < 0.2) issues.push('Face partially obscured');
          
          let quality: 'excellent' | 'good' | 'fair' | 'poor';
          if (score >= 0.9) quality = 'excellent';
          else if (score >= 0.8) quality = 'good';
          else if (score >= 0.7) quality = 'fair';
          else quality = 'poor';
  
          resolve({ quality, issues, score });
        }, 1200);
      });
    },
  
    // Simulate live face detection for demo
    simulateLiveFaceDetection: async (employeeId: string): Promise<MatchResult> => {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulate different scenarios based on employee ID
      const scenarios = [
        { probability: 0.7, result: 'verified' },
        { probability: 0.15, result: 'unverified' },
        { probability: 0.1, result: 'rejected' },
        { probability: 0.05, result: 'no_match' }
      ];
      
      const random = Math.random();
      let cumulative = 0;
      
      for (const scenario of scenarios) {
        cumulative += scenario.probability;
        if (random <= cumulative) {
          const confidence = scenario.result === 'verified' ? 0.88 + Math.random() * 0.1 :
                            scenario.result === 'unverified' ? 0.70 + Math.random() * 0.15 :
                            scenario.result === 'rejected' ? 0.50 + Math.random() * 0.20 :
                            0.20 + Math.random() * 0.30;
          
          return {
            isMatch: scenario.result === 'verified' || scenario.result === 'unverified',
            confidence: Math.round(confidence * 100) / 100,
            matchStatus: scenario.result as any,
            reason: scenario.result === 'rejected' ? 'Low confidence match' :
                    scenario.result === 'no_match' ? 'No matching face found' : undefined
          };
        }
      }
      
      // Fallback
      return {
        isMatch: true,
        confidence: 0.92,
        matchStatus: 'verified'
      };
    }
  };