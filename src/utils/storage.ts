import { MMKV } from 'react-native-mmkv';
import { Employee, AttendanceRecord } from '../types/attendance';
import { generateDummyEmployees, generateSampleAttendance } from './dummyData';

export const storage = new MMKV();

const EMPLOYEES_KEY = 'employees';
const ATTENDANCE_KEY = 'attendance';
const DEMO_DATA_INITIALIZED_KEY = 'demo_data_initialized';

export const StorageUtils = {
  // Initialize demo data if not already done
  initializeDemoData: (): boolean => {
    try {
      const isInitialized = storage.getBoolean(DEMO_DATA_INITIALIZED_KEY);
      
      if (!isInitialized) {
        const dummyEmployees = generateDummyEmployees();
        const sampleAttendance = generateSampleAttendance(dummyEmployees);
        
        storage.set(EMPLOYEES_KEY, JSON.stringify(dummyEmployees));
        storage.set(ATTENDANCE_KEY, JSON.stringify(sampleAttendance));
        storage.set(DEMO_DATA_INITIALIZED_KEY, true);
        
        console.log('Demo data initialized with', dummyEmployees.length, 'employees and', sampleAttendance.length, 'attendance records');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error initializing demo data:', error);
      return false;
    }
  },

  // Employee operations
  saveEmployee: (employee: Employee): boolean => {
    try {
      const employees = StorageUtils.getEmployees();
      const updatedEmployees = [...employees.filter(e => e.id !== employee.id), employee];
      storage.set(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
      return true;
    } catch (error) {
      console.error('Error saving employee:', error);
      return false;
    }
  },

  getEmployees: (): Employee[] => {
    try {
      // Initialize demo data if needed
      StorageUtils.initializeDemoData();
      
      const data = storage.getString(EMPLOYEES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting employees:', error);
      return [];
    }
  },

  getEmployeeById: (id: string): Employee | null => {
    const employees = StorageUtils.getEmployees();
    return employees.find(e => e.id === id) || null;
  },

  deleteEmployee: (id: string): boolean => {
    try {
      const employees = StorageUtils.getEmployees();
      const updatedEmployees = employees.filter(e => e.id !== id);
      storage.set(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
  },

  // Attendance operations
  saveAttendanceRecord: (record: AttendanceRecord): boolean => {
    try {
      const records = StorageUtils.getAttendanceRecords();
      const updatedRecords = [record, ...records];
      storage.set(ATTENDANCE_KEY, JSON.stringify(updatedRecords));
      return true;
    } catch (error) {
      console.error('Error saving attendance record:', error);
      return false;
    }
  },

  getAttendanceRecords: (): AttendanceRecord[] => {
    try {
      // Initialize demo data if needed
      StorageUtils.initializeDemoData();
      
      const data = storage.getString(ATTENDANCE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting attendance records:', error);
      return [];
    }
  },

  getEmployeeAttendance: (employeeId: string, date?: string): AttendanceRecord[] => {
    const records = StorageUtils.getAttendanceRecords();
    let filtered = records.filter(r => r.employeeId === employeeId);
    
    if (date) {
      filtered = filtered.filter(r => r.timestamp.startsWith(date));
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getTodayAttendance: (): AttendanceRecord[] => {
    const today = new Date().toISOString().split('T')[0];
    const records = StorageUtils.getAttendanceRecords();
    return records.filter(r => r.timestamp.startsWith(today));
  },

  clearAllData: (): boolean => {
    try {
      storage.delete(EMPLOYEES_KEY);
      storage.delete(ATTENDANCE_KEY);
      storage.delete(DEMO_DATA_INITIALIZED_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },

  // Reset demo data
  resetDemoData: (): boolean => {
    try {
      storage.delete(DEMO_DATA_INITIALIZED_KEY);
      return StorageUtils.initializeDemoData();
    } catch (error) {
      console.error('Error resetting demo data:', error);
      return false;
    }
  }
};