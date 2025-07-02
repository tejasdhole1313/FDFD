import { Employee } from '../../types/attendance';

// Mock database - in production, you would use a real database
let employees: Employee[] = [];

export async function GET(request: Request) {
  try {
    return Response.json({ 
      success: true, 
      data: employees 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch employees' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const employee: Employee = await request.json();
    
    // Validate required fields
    if (!employee.name || !employee.email || !employee.department) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Check for duplicate email
    const existingEmployee = employees.find(e => e.email === employee.email);
    if (existingEmployee) {
      return Response.json({ 
        success: false, 
        error: 'Employee with this email already exists' 
      }, { status: 409 });
    }

    // Add employee
    employees.push({
      ...employee,
      id: employee.id || `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: employee.createdAt || new Date().toISOString(),
    });

    return Response.json({ 
      success: true, 
      data: employee,
      message: 'Employee created successfully' 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Failed to create employee' 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return Response.json({ 
        success: false, 
        error: 'Employee ID is required' 
      }, { status: 400 });
    }

    const updatedEmployee: Partial<Employee> = await request.json();
    const index = employees.findIndex(e => e.id === id);
    
    if (index === -1) {
      return Response.json({ 
        success: false, 
        error: 'Employee not found' 
      }, { status: 404 });
    }

    employees[index] = { ...employees[index], ...updatedEmployee };
    
    return Response.json({ 
      success: true, 
      data: employees[index],
      message: 'Employee updated successfully' 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Failed to update employee' 
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
        error: 'Employee ID is required' 
      }, { status: 400 });
    }

    const index = employees.findIndex(e => e.id === id);
    
    if (index === -1) {
      return Response.json({ 
        success: false, 
        error: 'Employee not found' 
      }, { status: 404 });
    }

    const deletedEmployee = employees.splice(index, 1)[0];
    
    return Response.json({ 
      success: true, 
      data: deletedEmployee,
      message: 'Employee deleted successfully' 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Failed to delete employee' 
    }, { status: 500 });
  }
}