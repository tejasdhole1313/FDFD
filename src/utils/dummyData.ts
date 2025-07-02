import { Employee, AttendanceRecord } from '../types/attendance';

// Generate realistic dummy employees with face data
export const generateDummyEmployees = (): Employee[] => {
  const employees: Employee[] = [
    {
      id: 'emp_001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      department: 'Engineering',
      faceData: generateFaceData('sarah'),
      createdAt: '2024-01-15T08:00:00.000Z',
    },
    {
      id: 'emp_002',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      department: 'Design',
      faceData: generateFaceData('michael'),
      createdAt: '2024-01-16T09:30:00.000Z',
    },
    {
      id: 'emp_003',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      department: 'Marketing',
      faceData: generateFaceData('emily'),
      createdAt: '2024-01-17T10:15:00.000Z',
    },
    {
      id: 'emp_004',
      name: 'David Kim',
      email: 'david.kim@company.com',
      department: 'Engineering',
      faceData: generateFaceData('david'),
      createdAt: '2024-01-18T11:00:00.000Z',
    },
    {
      id: 'emp_005',
      name: 'Lisa Thompson',
      email: 'lisa.thompson@company.com',
      department: 'HR',
      faceData: generateFaceData('lisa'),
      createdAt: '2024-01-19T14:20:00.000Z',
    },
    {
      id: 'emp_006',
      name: 'James Wilson',
      email: 'james.wilson@company.com',
      department: 'Sales',
      faceData: generateFaceData('james'),
      createdAt: '2024-01-20T16:45:00.000Z',
    },
  ];

  return employees;
};

// Generate realistic face data for each employee
function generateFaceData(personId: string): string {
  // Create unique but consistent face features for each person
  const seed = hashString(personId);
  const random = seededRandom(seed);
  
  const faceFeatures = {
    landmarks: Array.from({ length: 68 }, (_, i) => {
      // Generate consistent landmarks based on person ID and landmark index
      return Math.sin(seed + i * 0.1) * 50 + 50 + random() * 20;
    }),
    descriptors: Array.from({ length: 128 }, (_, i) => {
      // Generate consistent descriptors for this person
      return Math.cos(seed + i * 0.05) * 0.8 + random() * 0.4 - 0.2;
    }),
    boundingBox: {
      x: 45 + random() * 10,
      y: 55 + random() * 10,
      width: 130 + random() * 20,
      height: 160 + random() * 20
    }
  };
  
  return btoa(JSON.stringify(faceFeatures));
}

// Simple hash function for consistent seeding
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Seeded random number generator for consistent results
function seededRandom(seed: number) {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % Math.pow(2, 32);
    return state / Math.pow(2, 32);
  };
}

// Generate sample attendance records
export const generateSampleAttendance = (employees: Employee[]): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  // Generate records for the last 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    
    // Random subset of employees for each day
    const dailyEmployees = employees.filter(() => Math.random() > 0.3);
    
    dailyEmployees.forEach((employee, index) => {
      // Check-in record
      const checkInTime = new Date(date);
      checkInTime.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
      
      const checkInRecord: AttendanceRecord = {
        id: `att_${checkInTime.getTime()}_${employee.id}_in`,
        employeeId: employee.id,
        employeeName: employee.name,
        type: 'check-in',
        timestamp: checkInTime.toISOString(),
        location: 'Main Office',
        confidence: 0.85 + Math.random() * 0.12,
      };
      
      records.push(checkInRecord);
      
      // Check-out record (80% chance)
      if (Math.random() > 0.2) {
        const checkOutTime = new Date(checkInTime);
        checkOutTime.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        
        const checkOutRecord: AttendanceRecord = {
          id: `att_${checkOutTime.getTime()}_${employee.id}_out`,
          employeeId: employee.id,
          employeeName: employee.name,
          type: 'check-out',
          timestamp: checkOutTime.toISOString(),
          location: 'Main Office',
          confidence: 0.82 + Math.random() * 0.15,
        };
        
        records.push(checkOutRecord);
      }
    });
  }
  
  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Demo face data that will match with existing employees
export const getDemoFaceData = (employeeId: string): string => {
  const employee = generateDummyEmployees().find(emp => emp.id === employeeId);
  if (!employee) return '';

  // Return slightly modified version of the employee's face data to simulate real capture
  const originalFeatures = JSON.parse(atob(employee.faceData ?? ''));

  // Add small variations to simulate real-world capture differences
  const modifiedFeatures = {
    ...originalFeatures,
    descriptors: originalFeatures.descriptors.map((desc: number) => 
      desc + (Math.random() - 0.5) * 0.1 // Small random variation
    ),
    landmarks: originalFeatures.landmarks.map((landmark: number) => 
      landmark + (Math.random() - 0.5) * 5 // Small position variation
    )
  };
  
  return btoa(JSON.stringify(modifiedFeatures));
};