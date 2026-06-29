// src/components/MealsPlanner.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateMealBookingsThunk } from '../redux/meal/mealSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';
import { 
  getDateString, 
  formatDisplayDate, 
  formatMealBookingDeadline, 
  hasMealBookingDeadlinePassed, 
  hasMealBeenRejected, 
  isStudentOnLeave, 
  getMealAcceptanceType, 
  getMenuForDate,
  isMealBooked
} from '../utils/dateUtils';

const MealsPlanner = ({ student, isReadOnly }) => {
  const dispatch = useDispatch();
  const db = useSelector((state) => state.student.directory);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelData, setCancelData] = useState({ date: '', meal: '', mealName: '', reason: '' });

  if (!student) return <div>No student selected.</div>;

  // Refresh student data from redux db to ensure freshness
  const freshStudent = db.find(s => s.id === student.id) || student;

  const handleAcceptMeal = (date, meal, mealName) => {
    const deadlinePassed = hasMealBookingDeadlinePassed(date);
    const wasRejected = hasMealBeenRejected(freshStudent, date, meal);

    if (deadlinePassed && wasRejected) {
      dispatch(addToast({
        message: `Cannot accept ${mealName}: meal was already rejected and deadline has passed.`,
        type: 'error'
      }));
      return;
    }

    const currentBooking = freshStudent.mealBookings?.find(b => b.date === date) || {
      date,
      breakfast: false,
      lunch: false,
      snacks: false,
      dinner: false
    };

    const newBooking = {
      ...currentBooking,
      [meal]: true
    };

    dispatch(updateMealBookingsThunk({
      studentId: freshStudent.id,
      date,
      bookings: {
        breakfast: newBooking.breakfast,
        lunch: newBooking.lunch,
        snacks: newBooking.snacks,
        dinner: newBooking.dinner
      }
    })).then((res) => {
      if (res.payload?.success) {
        dispatch(addToast({ message: `${mealName} meal accepted!`, type: 'success' }));
      }
    });
  };

  const handleOpenCancelModal = (date, meal, mealName) => {
    if (hasMealBookingDeadlinePassed(date)) {
      dispatch(addToast({
        message: `Cannot reject ${mealName}: the 8:00 AM deadline has passed.`,
        type: 'error'
      }));
      return;
    }

    setCancelData({
      date,
      meal,
      mealName,
      reason: ''
    });
    setModalOpen(true);
  };

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    const { date, meal, reason } = cancelData;

    if (hasMealBookingDeadlinePassed(date)) {
      dispatch(addToast({ message: 'Cannot reject meal: the 8:00 AM deadline has passed.', type: 'error' }));
      setModalOpen(false);
      return;
    }

    const currentBooking = freshStudent.mealBookings?.find(b => b.date === date) || {
      date,
      breakfast: false,
      lunch: false,
      snacks: false,
      dinner: false
    };

    const newBooking = {
      ...currentBooking,
      [meal]: false
    };

    dispatch(updateMealBookingsThunk({
      studentId: freshStudent.id,
      date,
      bookings: {
        breakfast: newBooking.breakfast,
        lunch: newBooking.lunch,
        snacks: newBooking.snacks,
        dinner: newBooking.dinner
      },
      rejection: {
        meal,
        reason
      }
    })).then((res) => {
      if (res.payload?.success) {
        dispatch(addToast({ message: `${meal.charAt(0).toUpperCase() + meal.slice(1)} meal rejected successfully!`, type: 'success' }));
        setModalOpen(false);
      }
    });
  };

  const renderMealActionButtons = (dateStr, mealKey, mealName, isBooked) => {
    if (isReadOnly) {
      const type = getMealAcceptanceType(freshStudent, dateStr, mealKey);
      if (type === 'manual') {
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', color: '#15803d', backgroundColor: '#dcfce7', padding: '5px 10px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>✔ Accepted <span style={{ fontSize: '9px', backgroundColor: '#16a34a', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>MANUAL</span></span>;
      }
      if (type === 'auto') {
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '5px 10px', borderRadius: '20px', border: '1px solid #bfdbfe' }}>✔ Accepted <span style={{ fontSize: '9px', backgroundColor: '#2563eb', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>AUTO</span></span>;
      }
      if (type === 'rejected') {
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '5px 10px', borderRadius: '20px', border: '1px solid #fca5a5' }}>✖ Rejected</span>;
      }
      return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#64748b', backgroundColor: '#f1f5f9', padding: '5px 10px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>– Not Opted In</span>;
    }

    const deadlinePassed = hasMealBookingDeadlinePassed(dateStr);
    const wasRejected = hasMealBeenRejected(freshStudent, dateStr, mealKey);

    if (deadlinePassed) {
      if (isBooked) {
        return <span className="meal-status-label accepted">Accepted</span>;
      }
      if (wasRejected) {
        return <span className="meal-status-label rejected">Rejected</span>;
      }
      return (
        <button 
          className="meal-action-btn accept-btn"
          onClick={() => handleAcceptMeal(dateStr, mealKey, mealName)}
        >
          Accept
        </button>
      );
    }

    if (isBooked) {
      return (
        <>
          <span className="meal-status-label accepted">Accepted</span>
          <button 
            className="meal-action-btn reject-btn"
            onClick={() => handleOpenCancelModal(dateStr, mealKey, mealName)}
          >
            Reject
          </button>
        </>
      );
    }

    if (wasRejected) {
      return (
        <>
          <button 
            className="meal-action-btn accept-btn"
            onClick={() => handleAcceptMeal(dateStr, mealKey, mealName)}
          >
            Accept
          </button>
          <span className="meal-status-label rejected">Rejected</span>
        </>
      );
    }

    return (
      <>
        <button 
          className="meal-action-btn accept-btn"
          onClick={() => handleAcceptMeal(dateStr, mealKey, mealName)}
        >
          Accept
        </button>
        <button 
          className="meal-action-btn reject-btn"
          onClick={() => handleOpenCancelModal(dateStr, mealKey, mealName)}
        >
          Reject
        </button>
      </>
    );
  };

  const days = [];
  for (let offset = 0; offset < 7; offset++) {
    const dateStr = getDateString(offset);
    const displayDate = formatDisplayDate(dateStr);
    const onLeave = isStudentOnLeave(freshStudent, dateStr);
    
    let leaveStatusText = '';
    let isPending = false;
    
    const matchingLeave = freshStudent.leaves?.find(leave => {
      if (leave.status === 'rejected') return false;
      const start = new Date(leave.startDate).getTime();
      const end = new Date(leave.endDate).getTime();
      const target = new Date(dateStr).getTime();
      return target >= start && target <= end;
    });

    if (matchingLeave) {
      isPending = matchingLeave.status === 'pending';
      const label = matchingLeave.type === 'outing' ? 'Going Out' : 'On Leave';
      leaveStatusText = isPending ? `${label} Pending` : label;
    }

    const booking = freshStudent.mealBookings?.find(b => b.date === dateStr) || {
      breakfast: false,
      lunch: false,
      snacks: false,
      dinner: false
    };
    const deadlinePassed = hasMealBookingDeadlinePassed(dateStr);
    const dayMenu = getMenuForDate(dateStr);

    days.push(
      <div key={dateStr} className={`meal-day-card ${onLeave ? 'on-leave' : ''}`}>
        <div className="meal-day-header">
          <div>
            <div className="meal-day-title">
              {offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : displayDate.split(',')[0]}
            </div>
            <div className="meal-day-date">{displayDate.split(',')[1]}</div>
            {!onLeave && !isReadOnly && (
              <div className={`meal-deadline-note ${deadlinePassed ? 'passed' : ''}`}>
                {deadlinePassed
                  ? 'Deadline passed (8:00 AM) — accept only'
                  : `Book or reject by ${formatMealBookingDeadline(dateStr)}`}
              </div>
            )}
          </div>
          {onLeave && (
            isPending 
              ? <span className="meal-pending-badge">{leaveStatusText}</span> 
              : <span className="meal-leave-badge">{leaveStatusText}</span>
          )}
        </div>

        {onLeave ? (
          <div className="meal-locked-msg">
            {ICONS.lock}
            <h4>Meal Booking Locked</h4>
            <span>Meals are disabled because student has active/pending {matchingLeave && matchingLeave.type === 'outing' ? 'outing' : 'leave'} on this date.</span>
          </div>
        ) : (
          <div className="meal-options-list">
            {[
              { label: 'Breakfast', key: 'breakfast', menu: dayMenu.breakfast, time: '07:30 AM - 09:00 AM' },
              { label: 'Lunch', key: 'lunch', menu: dayMenu.lunch, time: '12:30 PM - 02:00 PM' },
              { label: 'Snacks', key: 'snacks', menu: dayMenu.snacks, time: '04:30 PM - 05:30 PM' },
              { label: 'Dinner', key: 'dinner', menu: dayMenu.dinner, time: '07:30 PM - 09:00 PM' }
            ].map(row => {
              const isBooked = isMealBooked(freshStudent, dateStr, row.key);
              return (
                <div key={row.key} className="meal-option-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="meal-label-info">
                    <span className="meal-name" style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'block', fontSize: '14px' }}>{row.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: '500', margin: '2px 0', maxWidth: '180px' }}>{row.menu}</span>
                    <span className="meal-time" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{row.time}</span>
                  </div>
                  <div className="meal-action-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {renderMealActionButtons(dateStr, row.key, row.label, isBooked)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-panel">
        <div className="panel-header">
          <h2 className="panel-title">{ICONS.coffee} 7-Day Dining Schedule</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {isReadOnly ? "View Only Mode (Parents cannot toggle child's meals)" : 'Accept or reject meals until 8:00 AM the day before'}
          </span>
        </div>

        {isReadOnly ? (
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            {ICONS.shield}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1d4ed8', marginBottom: '4px' }}>Read-Only View — Meal Status</h4>
              <p style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>This shows your ward's meal acceptance status for the next 7 days. &nbsp;
                <span style={{ fontWeight: '700', color: '#15803d' }}>✔ MANUAL</span> = your ward accepted it themselves &nbsp;·&nbsp;
                <span style={{ fontWeight: '700', color: '#1d4ed8' }}>✔ AUTO</span> = auto-accepted after 8 AM deadline &nbsp;·&nbsp;
                <span style={{ fontWeight: '700', color: '#b91c1c' }}>✖ Rejected</span> = opted out &nbsp;·&nbsp;
                <span style={{ fontWeight: '700', color: '#64748b' }}>– Not Opted In</span> = not yet decided.
              </p>
            </div>
          </div>
        ) : (
          <div className="leave-alert-banner" style={{ marginBottom: '20px' }}>
            {ICONS.alert}
            <div>
              <h4>8:00 AM Meal Booking Policy</h4>
              <p>Until <strong>8:00 AM on the day before</strong>, you can <strong>Accept</strong> or <strong>Reject</strong> each meal. After 8:00 AM, only <strong>Accept</strong> remains available — reject is no longer allowed.</p>
            </div>
          </div>
        )}
        
        <div className="meal-planner-grid">
          {days}
        </div>
      </div>

      {/* Custom Modal for Meal Cancellation Reason */}
      {modalOpen && (
        <div id="meal-cancel-modal" className="modal-overlay active">
          <div className="modal-container" style={{ maxWidth: '400px', padding: '25px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Reject Meal</h3>
              <button 
                type="button" 
                className="modal-close"
                onClick={() => setModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleConfirmCancel} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '0 0 10px 0' }}>
                  Please state the reason for rejecting <strong>{cancelData.mealName}</strong> on <strong>{formatDisplayDate(cancelData.date)}</strong>:
                </p>
                <textarea 
                  className="form-textarea" 
                  required 
                  placeholder="e.g. Dining outside / unwell / parent visiting..." 
                  style={{ width: '100%', height: '90px', resize: 'none', marginTop: '5px', boxSizing: 'border-box' }}
                  value={cancelData.reason}
                  onChange={(e) => setCancelData({ ...cancelData, reason: e.target.value })}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn-reject" 
                  style={{ padding: '8px 16px', margin: 0, cursor: 'pointer' }}
                  onClick={() => setModalOpen(false)}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn-approve" 
                  style={{ backgroundColor: 'var(--danger)', padding: '8px 16px', margin: 0, color: 'white', cursor: 'pointer' }}
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MealsPlanner;
