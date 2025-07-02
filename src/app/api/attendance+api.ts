import { AttendanceRecord } from '../../types/attendance';

// Mock database - in production, you would use a real database
let attendanceRecords: AttendanceRecord[] = [];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    const date = url.searchParams.get('date');
    const limit = url.searchParams.get('limit');

    let filteredRecords = [...attendanceRecords];

    // Filter by employee ID
    if (employeeId) {
      filteredRecords = filteredRecords.filter(r => r.employeeId === employeeId);
    }

    // Filter by date
    if (date) {
      filteredRecords = filteredRecords.filter(r => r.timestamp.startsWith(date));
    }

    // Sort by timestamp (newest first)
    filteredRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit results
    if (limit) {
      filteredRecords = filteredRecords.slice(0, parseInt(limit));
    }

    return Response.json({ 
      success: true, 
      data: filteredRecords,
      total: attendanceRecords.length 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch attendance records' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const record: AttendanceRecord = await request.json();
    
    // Validate required fields
    if (!record.employeeId || !record.employeeName || !record.type) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate attendance type
    if (!['check-in', 'check-out'].includes(record.type)) {
      return Response.json({ 
        success: false, 
        error: 'Invalid attendance type' 
      }, { status: 400 });
    }

    // Add attendance record
    const attendanceRecord: AttendanceRecord = {
      ...record,
      id: record.id || `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: record.timestamp || new Date().toISOString(),
    };

    attendanceRecords.unshift(attendanceRecord); // Add to beginning for newest first

    return Response.json({ 
      success: true, 
      data: attendanceRecord,
      message: 'Attendance recorded successfully' 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Failed to record attendance' 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return Response.json({ 
        success: false, 
        error: 'Record ID is required' 
      }, { status: 400 });
    }

    const index = attendanceRecords.findIndex(r => r.id === id);
    
    if (index === -1) {
      return Response.json({ 
        success: false, 
        error: 'Attendance record not found' 
      }, { status: 404 });
    }

    const deletedRecord = attendanceRecords.splice(index, 1)[0];
    
    return Response.json({ 
      success: true, 
      data: deletedRecord,
      message: 'Attendance record deleted successfully' 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Failed to delete attendance record' 
    }, { status: 500 });
  }
}