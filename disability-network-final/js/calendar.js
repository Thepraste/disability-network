import { getBookings, isClassBooked, cancelClassBooking } from "./booking-store.js";
import { learningCategories } from "./data.js";
import { getManagedClasses } from "./class-store.js";
const classes = getManagedClasses();
import { createBookingController } from "./booking.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const booking = createBookingController();

const DETROIT_TIME_ZONE = "America/Detroit";
const getDetroitDateKey = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DETROIT_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(date);
  const part = type => parts.find(item => item.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};
const selectedDate = { value: getDetroitDateKey() };
const activeCategories = new Set();
const activeTimes = new Set();
const activeGuides = new Set();
let searchTerm = "";
let visibleLimit = 8;
const PAGE_SIZE = 8;

const dateList = $("#dateList");
const scheduleGroups = $("#scheduleGroups");
const scheduleEmpty = $("#scheduleEmpty");
const loadMoreBtn = $("#loadMoreBtn");
const selectedHeading = $("#selectedDateHeading");
const resultCount = $("#resultCount");
const categoryOptions = $("#categoryOptions");
const getCurrentUser = () => { try { return JSON.parse(localStorage.getItem("dn-current-user") || "null"); } catch { return null; } };
const currentUser = getCurrentUser();
const booked = new Set(getBookings().map(item => item.id));

const toDate = value => new Date(`${value}T12:00:00Z`);
const dateKey = date => `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,"0")}-${String(date.getUTCDate()).padStart(2,"0")}`;
// Session times are Detroit wall-clock times, independent of the visitor's device timezone.
const formatTime = value => {
  const [h,m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2,"0")} ${suffix}`;
};
const formatDay = value => new Intl.DateTimeFormat("en-US",{weekday:"long",day:"numeric",month:"long",timeZone:"UTC"}).format(toDate(value));
const timeBucket = value => {
  const hour = Number(value.split(":")[0]);
  return hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
};
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function renderDates() {
  const start = toDate(getDetroitDateKey());
  dateList.innerHTML = Array.from({length:21},(_,i)=>{
    const d = new Date(start); d.setUTCDate(start.getUTCDate()+i);
    const key = dateKey(d);
    const today = i===0;
    return `<button class="date-item ${key===selectedDate.value?"active":""}" type="button" data-date="${key}" aria-pressed="${key===selectedDate.value}">
      <span class="day-name">${new Intl.DateTimeFormat("en-US",{weekday:"short",timeZone:"UTC"}).format(d)}</span>
      <span class="day-number">${d.getDate()}</span>
      <span class="day-label">${today?"Today":""}</span>
    </button>`;
  }).join("");
  $("#dateMonth").textContent = new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric",timeZone:"UTC"}).format(toDate(selectedDate.value));
}
function renderCategoryFilters() {
  categoryOptions.innerHTML = learningCategories.map(category=>`
    <label><input type="checkbox" name="category" value="${escapeHTML(category)}"> ${escapeHTML(category)}</label>
  `).join("");
}
function matchesFilters(item) {
  if(item.date!==selectedDate.value) return false;
  if(activeCategories.size && !activeCategories.has(item.category)) return false;
  if(activeTimes.size && !activeTimes.has(timeBucket(item.time))) return false;
  if(activeGuides.size) {
    const map = {
      beginner: ["Fitness","Technology","Arts & Creative","Food","Lifestyle"],
      technology: ["Technology"],
      wellness: ["Health & Wellness","Fitness"]
    };
    if(![...activeGuides].some(g=>map[g]?.includes(item.category))) return false;
  }
  if(searchTerm && !`${item.title} ${item.instructor} ${item.category}`.toLowerCase().includes(searchTerm)) return false;
  return true;
}
function card(item) {
  const isBooked=isClassBooked(item.id, item.date);
  return `<article class="schedule-card">
    <div class="schedule-time">${formatTime(item.time)}<span>${new Intl.DateTimeFormat("en-US",{day:"numeric",month:"short",timeZone:"UTC"}).format(toDate(item.date))}</span></div>
    <img class="schedule-image" src="${escapeHTML(item.image)}" alt="" loading="lazy">
    <div class="schedule-details"><h3>${escapeHTML(item.title)}</h3>
      <div class="schedule-meta"><span>By ${escapeHTML(item.instructor)}</span><span class="schedule-category">${escapeHTML(item.category)}</span>${item.video?'<i class="fa-solid fa-video" aria-label="Video session"></i>':""}</div>
      <a class="schedule-details-link" href="class-detail.html?id=${encodeURIComponent(item.id)}">View class details</a>
    </div>
    <div class="schedule-book-actions">${isBooked?`<button class="schedule-book-btn is-booked" type="button" data-calendar-enter="${escapeHTML(item.id)}"><i class="fa-solid fa-play"></i> Enter</button><button class="schedule-cancel-btn" type="button" data-calendar-cancel="${escapeHTML(item.id)}">Cancel</button>`:`<button class="schedule-book-btn" type="button" data-calendar-book="${escapeHTML(item.id)}">Book</button>`}</div>
  </article>`;
}
function renderSchedule() {
  const filtered=classes.filter(matchesFilters).sort((a,b)=>a.time.localeCompare(b.time));
  const shown=filtered.slice(0,visibleLimit);
  selectedHeading.textContent=formatDay(selectedDate.value).toUpperCase();
  resultCount.textContent=`${filtered.length} ${filtered.length===1?"class":"classes"} available`;
  scheduleGroups.innerHTML=shown.length?`<section class="schedule-day-group"><div class="schedule-card-list">${shown.map(card).join("")}</div></section>`:"";
  scheduleEmpty.hidden=filtered.length!==0;
  loadMoreBtn.hidden=filtered.length<=visibleLimit;
  renderDates();
}
function resetAndRender(){visibleLimit=PAGE_SIZE;renderSchedule();}
function clearFilters(){
  activeCategories.clear();activeTimes.clear();activeGuides.clear();searchTerm="";
  $$('input[type="checkbox"]',$("#calendarFilters")).forEach(input=>input.checked=false);
  $$(".search-box input").forEach(input=>input.value="");
  resetAndRender();
}
renderCategoryFilters();
renderDates();
renderSchedule();

dateList.addEventListener("click",event=>{
  const button=event.target.closest("[data-date]");
  if(!button)return;
  selectedDate.value=button.dataset.date;
  resetAndRender();
});
$("#datePrev").addEventListener("click",()=>dateList.scrollBy({left:-250,behavior:"smooth"}));
$("#dateNext").addEventListener("click",()=>dateList.scrollBy({left:250,behavior:"smooth"}));
$("#calendarFilters").addEventListener("change",event=>{
  const input=event.target;
  if(input.name==="category") input.checked?activeCategories.add(input.value):activeCategories.delete(input.value);
  if(input.name==="time") input.checked?activeTimes.add(input.value):activeTimes.delete(input.value);
  if(input.name==="guide") input.checked?activeGuides.add(input.value):activeGuides.delete(input.value);
  resetAndRender();
});
$("#clearFilters").addEventListener("click",clearFilters);
$("#emptyClearFilters").addEventListener("click",clearFilters);
loadMoreBtn.addEventListener("click",()=>{visibleLimit+=PAGE_SIZE;renderSchedule();});
$("#dismissNotice").addEventListener("click",()=>$("#scheduleNotice").remove());
$("#scheduleGroups").addEventListener("click",event=>{
  const cancel=event.target.closest("[data-calendar-cancel]");
  if(cancel){const item=classes.find(entry=>entry.id===cancel.dataset.calendarCancel);if(item)cancelClassBooking(item.id,item.date);return;}
  const enter=event.target.closest("[data-calendar-enter]");
  if(enter){location.href=`classroom.html?id=${encodeURIComponent(enter.dataset.calendarEnter)}&mode=live`;return;}
  const button=event.target.closest("[data-calendar-book]");
  if(!button)return;
  const item=classes.find(entry=>entry.id===button.dataset.calendarBook);
  if(!item||isClassBooked(item.id,item.date))return;
  booking.open(item,button);
});
$$(".search-box input").forEach(input=>input.addEventListener("input",()=>{
  searchTerm=input.value.trim().toLowerCase();
  $$(".search-box input").forEach(other=>{if(other!==input)other.value=input.value;});
  resetAndRender();
}));
const filterToggle=$("#filterMobileToggle");
filterToggle.addEventListener("click",()=>{
  const expanded=$("#calendarFilters").classList.toggle("mobile-expanded");
  filterToggle.setAttribute("aria-expanded",String(expanded));
});
const menuToggle=$("#mobileMenuToggle");
const nav=$("#primaryNavigation");
if(menuToggle&&nav)menuToggle.addEventListener("click",()=>{
  const open=nav.classList.toggle("mobile-open");
  menuToggle.setAttribute("aria-expanded",String(open));
});
const classesToggle=$("#classesToggle");
const classesMenu=$("#classesMenu");
if(classesToggle&&classesMenu)classesToggle.addEventListener("click",()=>{
  const open=classesToggle.getAttribute("aria-expanded")!=="true";
  classesToggle.setAttribute("aria-expanded",String(open));
  classesMenu.classList.toggle("show",open);
});

// Resume a booking that was paused while the visitor signed in.
const pendingClassId = new URLSearchParams(location.hash.replace(/^#/, "")).get("book");
if (pendingClassId && getCurrentUser()?.email) {
  const pendingClass = classes.find(item => item.id === pendingClassId);
  if (pendingClass) {
    booked.add(pendingClass.id);
    booking.open(pendingClass, null);
    history.replaceState(null, "", "calendar.html");
    renderSchedule();
  }
}

window.addEventListener("dn:bookings-updated",renderSchedule);
window.addEventListener("storage",event=>{if(event.key?.startsWith("dn-bookings:"))renderSchedule();});
