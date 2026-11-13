import { cancelClassBooking, getBookings } from "./booking-store.js";
import { getManagedClasses } from "./class-store.js";
const classes = getManagedClasses();
const $ = selector => document.querySelector(selector);
const getUser = () => { try { return JSON.parse(localStorage.getItem("dn-current-user") || "null"); } catch { return null; } };
const getDetroitToday = () => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Detroit", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = type => parts.find(part => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
};
const dateObj = value => new Date(`${value}T12:00:00Z`);
const formatDate = value => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(dateObj(value));
const formatTime = value => {
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"} Detroit time`;
};
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const user = getUser();
const list = $("#myScheduleList");
const today = getDetroitToday();
let currentView = "upcoming";

$("#scheduleGreeting").textContent = user?.name ? `Welcome, ${user.name}. Here are your booked classes.` : "Your upcoming classes";

// Re-read the shared booking store on every render. This keeps the page in sync
// without reloading when a booking is made or cancelled.
function getScheduleRecords() {
  if (!user?.email) return { upcoming: [], past: [] };
  const records = getBookings()
    .map(booking => ({ ...classes.find(item => item.id === booking.id), bookingDate: booking.date }))
    .filter(item => item.id);
  return {
    upcoming: records.filter(item => item.bookingDate >= today).sort((a, b) => (a.bookingDate + a.time).localeCompare(b.bookingDate + b.time)),
    past: records.filter(item => item.bookingDate < today).sort((a, b) => (b.bookingDate + b.time).localeCompare(a.bookingDate + a.time))
  };
}

function render() {
  const { upcoming, past } = getScheduleRecords();
  $("#upcomingCount").textContent = upcoming.length;
  $("#pastCount").textContent = past.length;
  const items = currentView === "upcoming" ? upcoming : past;

  if (!user?.email) {
    list.innerHTML = `<div class="my-schedule-empty"><div class="empty-icon"><i class="fa-regular fa-calendar"></i></div><h2>Log in to view your schedule</h2><p>Your booked classes will appear here once you sign in to your Disability Network account.</p><a href="auth.html#login">Log in</a></div>`;
    return;
  }
  if (!items.length) {
    list.innerHTML = `<div class="my-schedule-empty"><div class="empty-icon"><i class="fa-regular fa-calendar"></i></div><h2>${currentView === "upcoming" ? "No upcoming classes" : "No past classes"}</h2><p>${currentView === "upcoming" ? "You haven't booked any upcoming classes yet. Browse the schedule to find classes that interest you." : "Your completed classes will appear here."}</p>${currentView === "upcoming" ? '<a href="calendar.html">Browse Classes</a>' : ""}</div>`;
    return;
  }

  list.innerHTML = `<div class="my-booking-list">${items.map(item => `<article class="my-booking-card">
    <div class="my-booking-date"><strong>${dateObj(item.bookingDate).getUTCDate()}</strong><span>${new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" }).format(dateObj(item.bookingDate))}</span></div>
    <img src="${escapeHTML(item.image)}" alt="">
    <div class="my-booking-info"><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(formatDate(item.bookingDate))} · ${escapeHTML(formatTime(item.time))}</p><p>Instructor: ${escapeHTML(item.instructor)} · ${item.duration} min</p><p class="booking-status">${currentView === "upcoming" ? "Booking confirmed" : "Past class"}</p></div>
    ${currentView === "upcoming" ? `<div class="my-booking-actions"><a class="my-booking-action" href="classroom.html?id=${encodeURIComponent(item.id)}&mode=live">Enter</a><button class="my-booking-cancel" type="button" data-schedule-cancel="${escapeHTML(item.id)}" data-booking-date="${escapeHTML(item.bookingDate)}">Cancel</button></div>` : ""}
  </article>`).join("")}</div>`;
}

list.addEventListener("click", event => {
  const button = event.target.closest("[data-schedule-cancel]");
  if (!button) return;
  event.preventDefault();
  cancelClassBooking(button.dataset.scheduleCancel, button.dataset.bookingDate);
  // The shared store emits dn:bookings-updated, which calls render().
});
window.addEventListener("dn:bookings-updated", render);
window.addEventListener("storage", event => {
  if (event.key?.startsWith("dn-bookings:")) render();
});

document.querySelectorAll(".schedule-tab").forEach(button => button.addEventListener("click", () => {
  currentView = button.dataset.view;
  document.querySelectorAll(".schedule-tab").forEach(tab => {
    const active = tab === button;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  render();
}));
render();
