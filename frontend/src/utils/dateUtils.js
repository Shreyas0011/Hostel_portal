// src/utils/dateUtils.js

const DEFAULT_MENU = {
  breakfast: 'Masala Dosa, Chutney, Sambhar & Coffee',
  lunch:     'Jeera Rice, Dal Fry, Roti, Aloo Gobi & Buttermilk',
  snacks:    'Veg Samosa, Green Chutney & Tea',
  dinner:    'Veg Biryani, Raita, Paneer Butter Masala & Gulab Jamun'
};

export function getDateString(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const MEAL_BOOKING_CUTOFF_HOUR = 8;

export function getMealBookingDeadline(dateStr) {
  const targetDayCutoff = new Date(`${dateStr}T${String(MEAL_BOOKING_CUTOFF_HOUR).padStart(2, '0')}:00:00`);
  return targetDayCutoff.getTime() - (24 * 60 * 60 * 1000);
}

export function hasMealBookingDeadlinePassed(dateStr) {
  return Date.now() > getMealBookingDeadline(dateStr);
}

export function hasMealBeenRejected(student, dateStr, mealKey) {
  return !!(student.mealCancellations && student.mealCancellations.some(
    c => c.date === dateStr && c.meal === mealKey
  ));
}

export function formatMealBookingDeadline(dateStr) {
  const deadline = new Date(getMealBookingDeadline(dateStr));
  return deadline.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function isStudentOnLeave(student, dateStr) {
  return false;
}

export function isMealBooked(student, dateStr, mealKey) {
  if (hasMealBeenRejected(student, dateStr, mealKey)) {
    return false;
  }
  return true;
}

export function getMealAcceptanceType(student, dateStr, mealKey) {
  if (hasMealBeenRejected(student, dateStr, mealKey)) return 'rejected';
  const booking = student.mealBookings?.find(b => b.date === dateStr);
  const explicitlyBooked = booking && !!booking[mealKey];
  if (explicitlyBooked) return 'manual';
  return 'auto';
}

export function getMenuForDate(dateStr) {
  const raw = localStorage.getItem('hostel_mess_menu');
  if (!raw) return DEFAULT_MENU;
  const store = JSON.parse(raw);
  if (store.breakfast) return store;
  return store[dateStr] || store['default'] || DEFAULT_MENU;
}

export function getMenuStore() {
  const raw = localStorage.getItem('hostel_mess_menu');
  if (!raw) return { default: { ...DEFAULT_MENU } };
  const store = JSON.parse(raw);
  if (store.breakfast) return { default: store };
  if (!store.default) store.default = { ...DEFAULT_MENU };
  return store;
}

export function saveMenuStore(store) {
  localStorage.setItem('hostel_mess_menu', JSON.stringify(store));
}
