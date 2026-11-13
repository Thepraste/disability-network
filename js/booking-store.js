// Shared, account-scoped booking state used by the homepage, calendar, schedule and class details.
export const currentBookingUser = () => {
  try { return JSON.parse(localStorage.getItem('dn-current-user') || 'null'); } catch { return null; }
};
export const bookingStorageKey = () => {
  const user = currentBookingUser();
  return user?.email ? `dn-bookings:${user.email.toLowerCase()}` : null;
};
export const getBookings = () => {
  const key = bookingStorageKey();
  if (!key) return [];
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; }
};
export const isClassBooked = (id, date) => getBookings().some(item => item.id === id && (!date || item.date === date));
export const saveClassBooking = item => {
  const key = bookingStorageKey();
  if (!key) return false;
  const entries = getBookings();
  if (!entries.some(entry => entry.id === item.id && entry.date === item.date)) {
    entries.push({ id: item.id, date: item.date, bookedAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent('dn:bookings-updated'));
  }
  return true;
};
export const cancelClassBooking = (id, date) => {
  const key = bookingStorageKey();
  if (!key) return false;
  const before = getBookings();
  const after = before.filter(item => !(item.id === id && (!date || item.date === date)));
  localStorage.setItem(key, JSON.stringify(after));
  if (after.length !== before.length) window.dispatchEvent(new CustomEvent('dn:bookings-updated'));
  return true;
};
