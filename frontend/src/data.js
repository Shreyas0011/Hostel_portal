// src/data.js

import { 
  initDB, 
  saveDB, 
  getDateString, 
  formatDisplayDate, 
  isStudentOnLeave, 
  isMealBooked,
  getMealAcceptanceType,
  getWardenDashboardStats,
  getAnalyticsForDate,
  hasMealBookingDeadlinePassed,
  hasMealBeenRejected,
  formatMealBookingDeadline,
  logEntryExit,
  getBedAssignments,
  updateBehaviourLog,
  REAL_STUDENTS,
  DB_VERSION,
  generateRandomStudent
} from './utils/db.js';

export { 
  initDB, 
  saveDB, 
  getDateString, 
  formatDisplayDate, 
  isStudentOnLeave, 
  isMealBooked,
  getMealAcceptanceType,
  getWardenDashboardStats,
  getAnalyticsForDate,
  hasMealBookingDeadlinePassed,
  hasMealBeenRejected,
  formatMealBookingDeadline,
  logEntryExit,
  getBedAssignments,
  updateBehaviourLog,
  REAL_STUDENTS,
  DB_VERSION,
  generateRandomStudent
};

// Apply leave for a student
export function applyLeave(studentId, startDate, endDate, reason, type = 'leave', submittedBy = 'student', startTime = '', endTime = '', isOvernight = false) {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  const leaveId = `LV-${Date.now()}`;
  const newLeave = {
    id: leaveId,
    startDate,
    endDate,
    reason,
    type, // 'leave' or 'outing'
    submittedBy, // 'student' or 'parent'
    status: submittedBy === 'parent' ? 'approved' : 'pending',
    startTime,
    endTime,
    isOvernight: !!isOvernight
  };

  student.leaves.push(newLeave);

  let foodWasteCount = 0;
  if (newLeave.status === 'approved') {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    student.mealBookings = student.mealBookings.filter(booking => {
      const bookingTime = new Date(booking.date).getTime();
      const isWithinLeave = bookingTime >= start && bookingTime <= end;
      if (isWithinLeave) {
        if (booking.breakfast) foodWasteCount++;
        if (booking.lunch) foodWasteCount++;
        if (booking.snacks) foodWasteCount++;
        if (booking.dinner) foodWasteCount++;
      }
      return !isWithinLeave;
    });

    // Track meal cancellations in statistics
    let avoidedMeals = parseInt(localStorage.getItem('hostel_avoided_meals') || '0', 10);
    avoidedMeals += foodWasteCount;
    localStorage.setItem('hostel_avoided_meals', avoidedMeals.toString());
  }

  saveDB(students);
  return { students, leave: newLeave, avoidedCount: foodWasteCount };
}

// Cancel a leave request
export function cancelLeave(studentId, leaveId) {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  student.leaves = student.leaves.filter(l => l.id !== leaveId);
  saveDB(students);
  return students;
}

// Approve a leave
export function approveLeave(studentId, leaveId) {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  const leave = student.leaves.find(l => l.id === leaveId);
  if (leave) {
    leave.status = 'approved';
    
    // Make sure all meals on these dates are cleared
    const start = new Date(leave.startDate).getTime();
    const end = new Date(leave.endDate).getTime();
    
    let cancelledCount = 0;
    student.mealBookings = student.mealBookings.filter(booking => {
      const bookingTime = new Date(booking.date).getTime();
      const isWithinLeave = bookingTime >= start && bookingTime <= end;
      if (isWithinLeave) {
        if (booking.breakfast) cancelledCount++;
        if (booking.lunch) cancelledCount++;
        if (booking.snacks) cancelledCount++;
        if (booking.dinner) cancelledCount++;
      }
      return !isWithinLeave;
    });

    let avoidedMeals = parseInt(localStorage.getItem('hostel_avoided_meals') || '0', 10);
    avoidedMeals += cancelledCount;
    localStorage.setItem('hostel_avoided_meals', avoidedMeals.toString());
  }

  saveDB(students);
  return students;
}

// Reject a leave
export function rejectLeave(studentId, leaveId) {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  const leave = student.leaves.find(l => l.id === leaveId);
  if (leave) {
    leave.status = 'rejected';
  }

  saveDB(students);
  return students;
}

// Update meals for a student
export function updateMealBookings(studentId, dateStr, meals, cancellationDetails = null) {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  // Verify they are not on leave
  if (isStudentOnLeave(student, dateStr)) {
    return { success: false, error: "Cannot book meals while on leave!" };
  }

  const crossed = hasMealBookingDeadlinePassed(dateStr);

  if (crossed) {
    const existingBooking = student.mealBookings.find(b => b.date === dateStr) || {
      breakfast: false,
      lunch: false,
      snacks: false,
      dinner: false
    };

    if (cancellationDetails) {
      return { success: false, error: "Cannot reject meal: the 8:00 AM deadline has passed." };
    }
    for (const key of ['breakfast', 'lunch', 'snacks', 'dinner']) {
      if (existingBooking[key] && !meals[key]) {
        return { success: false, error: `Cannot reject ${key}: the 8:00 AM deadline has passed.` };
      }
    }

    for (const key of ['breakfast', 'lunch', 'snacks', 'dinner']) {
      if (!existingBooking[key] && meals[key]) {
        if (hasMealBeenRejected(student, dateStr, key)) {
          return { success: false, error: `Cannot accept ${key}: meal was already rejected and deadline has passed.` };
        }
      }
    }
  }

  const existingBookingIndex = student.mealBookings.findIndex(b => b.date === dateStr);
  
  if (existingBookingIndex >= 0) {
    student.mealBookings[existingBookingIndex] = {
      date: dateStr,
      ...meals
    };
  } else {
    student.mealBookings.push({
      date: dateStr,
      ...meals
    });
  }

  if (cancellationDetails) {
    if (!student.mealCancellations) {
      student.mealCancellations = [];
    }
    student.mealCancellations.push({
      id: `CAN-${Date.now()}`,
      date: dateStr,
      meal: cancellationDetails.meal,
      reason: cancellationDetails.reason,
      timestamp: new Date().toISOString()
    });

    // Increment avoided meals stats
    let avoidedMeals = parseInt(localStorage.getItem('hostel_avoided_meals') || '0', 10);
    avoidedMeals += 1;
    localStorage.setItem('hostel_avoided_meals', avoidedMeals.toString());
  }

  saveDB(students);
  return { success: true, students };
}

// Report a student complaint
export function reportComplaint(studentId, category, subject, details) {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  if (!student.complaints) student.complaints = [];

  const newComplaint = {
    id: `CMP-${studentId}-${Date.now().toString().slice(-4)}`,
    category,
    subject,
    details,
    status: 'Pending',
    dateReported: getDateString(0)
  };

  student.complaints.push(newComplaint);
  saveDB(students);
  return { students, complaint: newComplaint };
}
