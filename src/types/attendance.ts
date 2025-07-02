export interface Employee {
    id: string;
    name: string;
    email: string;
    department: string;
    faceData?: string; // Base64 encoded face data
    createdAt: string;
  }
  
  export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    type: 'check-in' | 'check-out';
    timestamp: string;
    location?: string;
    confidence?: number;
  }
  
  export interface DailyAttendance {
    employeeId: string;
    employeeName: string;
    checkIn?: string;
    checkOut?: string;
    totalHours?: number;
    date: string;
  }
  
  export interface MatchResult {
    isMatch: boolean;
    confidence: number;
    employee?: {
      id: string;
      name: string;
      department: string;
    };
    matchStatus: 'verified' | 'unverified' | 'rejected' | 'no_match';
    reason?: string;
    attendanceType?: 'check-in' | 'check-out';
  }