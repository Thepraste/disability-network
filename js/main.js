import { getBookings, cancelClassBooking } from "./booking-store.js";
import { learningCategories, featuredSeries, featuredSeriesCards } from "./data.js";
import { getManagedClasses } from "./class-store.js";
const classes = getManagedClasses();
import { createBookingController } from "./booking.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const classTrack = $("#classTrack");
const liveClassTrack = $("#liveClassTrack");
const categoryHeading = $("#classCategoryHeading");
const categoryButtons = $$(".learning-category-btn");
const searchInputs = $$('.search-box input[type="search"]');
const booking = createBookingController();

const readStoredIds = key => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter(id => typeof id === "string") : [];
  } catch {
    return [];
  }
};
const savedClasses = new Set(readStoredIds("dn-saved-classes"));
const recentlyViewed = readStoredIds("dn-recently-viewed");
const bookedClasses = new Set(getBookings().map(item => item.id));
let activeCategory = "Fitness";
let searchTerm = "";

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric"
  }).format(date);
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit"
  }).format(date);
}

function renderMyLearning() {
  const savedCount = $("#savedClassesCount");
  const recentCount = $("#recentClassesCount");
  const savedContent = $("#savedClassesContent");
  const recentContent = $("#recentClassesContent");
  if (!savedCount || !recentCount || !savedContent || !recentContent) return;

  const renderCollection = (ids, emptyTitle, emptyText) => {
    const items = ids.map(id => classes.find(item => item.id === id)).filter(Boolean);
    if (!items.length) {
      return `<strong>${emptyTitle}</strong><p>${emptyText}</p>`;
    }
    return `<ul class="my-learning-list">${items.map(item => `
      <li>
        <span class="my-learning-item-title">${item.title}</span>
        <span class="my-learning-item-category">${item.category}</span>
      </li>`).join("")}</ul>`;
  };

  const savedIds = [...savedClasses];
  const recentIds = recentlyViewed;
  savedCount.textContent = `${savedIds.length} ${savedIds.length === 1 ? "class" : "classes"}`;
  recentCount.textContent = `${recentIds.length} ${recentIds.length === 1 ? "class" : "classes"}`;
  savedContent.innerHTML = renderCollection(
    savedIds,
    "NO SAVED CLASSES YET",
    "Save classes you're interested in so they're easy to find later."
  );
  recentContent.innerHTML = renderCollection(
    recentIds,
    "NOTHING VIEWED YET",
    "Classes you open will appear here so you can easily return to them."
  );
}

function cardTemplate(item) {
  const saved = savedClasses.has(item.id);
  const booked = bookedClasses.has(item.id);

  return `
    <article class="class-card" data-class-id="${item.id}" tabindex="0" aria-label="Open ${item.title}">
      <div class="class-card-image">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        ${item.video ? `<span class="class-video-badge" aria-label="Video class"><i class="fa-solid fa-video"></i></span>` : ""}
        <button class="class-bookmark ${saved ? "saved" : ""}" type="button"
          data-class-bookmark="${item.id}" aria-label="${saved ? "Remove" : "Save"} ${item.title}"
          aria-pressed="${saved}" title="${saved ? "Remove saved class" : "Save class"}">
          <i class="${saved ? "fa-solid" : "fa-regular"} fa-bookmark"></i>
        </button>
      </div>
      <div class="class-card-content">
        <h4>${item.title}</h4>
        <div class="class-instructor">
          <img src="${item.instructorImage}" alt="" loading="lazy">
          <span>${item.instructor}</span>
        </div>
        <div class="class-date-time">
          <i class="fa-regular fa-calendar"></i>
          <span>${formatDate(item.date)}, ${formatTime(item.time)}</span>
        </div>
        <div class="class-book-actions">
          ${booked ? `<button class="class-book-btn is-booked" type="button" data-enter-class="${item.id}"><i class="fa-solid fa-play"></i> Enter</button><button class="class-cancel-btn" type="button" data-cancel-class="${item.id}" aria-label="Cancel booking">Cancel</button>` : `<button class="class-book-btn" type="button" data-book-class="${item.id}">Book</button>`}
        </div>
      </div>
    </article>`;
}

function getVisibleClasses(category = activeCategory) {
  return classes.filter(item => {
    const matchesCategory = item.category === category;
    const matchesSearch = !searchTerm ||
      `${item.title} ${item.instructor} ${item.category}`.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
}

function updateArrows(track, previous, next) {
  if (!track || !previous || !next) return;
  const maxScroll = track.scrollWidth - track.clientWidth;
  previous.disabled = track.scrollLeft <= 2;
  next.disabled = maxScroll <= 2 || track.scrollLeft >= maxScroll - 2;
}

function updateAllArrows() {
  updateArrows(classTrack, $("#classPrev"), $("#classNext"));
  updateArrows(liveClassTrack, $("#livePrev"), $("#liveNext"));
  updateArrows($("#eventTrack"), $("#eventPrev"), $("#eventNext"));
}

function renderClasses() {
  const items = getVisibleClasses();
  categoryHeading.textContent = activeCategory;
  classTrack.innerHTML = items.length
    ? items.map(cardTemplate).join("")
    : `<p class="class-empty-message">No classes found. Try another category or search term.</p>`;
  classTrack.scrollTo({ left: 0, behavior: "smooth" });
  requestAnimationFrame(updateAllArrows);
}

function renderLiveClasses() {
  const items = classes.filter(item => item.video).slice(0, 5);
  liveClassTrack.innerHTML = items.length
    ? items.map(cardTemplate).join("")
    : `<p class="class-empty-message">No live or starting-soon classes at the moment.</p>`;
  requestAnimationFrame(updateAllArrows);
}

function setActiveCategory(button) {
  categoryButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  activeCategory = button.dataset.learningCategory;
  // Keep the selected pill visible in the horizontally scrollable category row.
  button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  renderClasses();
}

categoryButtons.forEach(button => {
  button.addEventListener("click", () => setActiveCategory(button));
});

function updateBookingButtons(id, isBooked) {
  // Update only the matching card actions. Do not rebuild either carousel:
  // rebuilding cards restarts their reveal animations and can shift the layout.
  $$(`.class-card[data-class-id="${CSS.escape(id)}"]`).forEach(card => {
    const actions = $(".class-book-actions", card);
    if (!actions) return;
    actions.innerHTML = isBooked
      ? `<button class="class-book-btn is-booked" type="button" data-enter-class="${id}"><i class="fa-solid fa-play"></i> Enter</button><button class="class-cancel-btn" type="button" data-cancel-class="${id}" aria-label="Cancel booking">Cancel</button>`
      : `<button class="class-book-btn" type="button" data-book-class="${id}">Book</button>`;
  });
}

function syncBookingButtons() {
  const nextBooked = new Set(getBookings().map(item => item.id));
  const changedIds = new Set([...bookedClasses, ...nextBooked]);
  changedIds.forEach(id => updateBookingButtons(id, nextBooked.has(id)));
  bookedClasses.clear();
  nextBooked.forEach(id => bookedClasses.add(id));
}

function handleCardAction(event) {
  const cancelButton = event.target.closest("[data-cancel-class]");
  if (cancelButton) {
    const item = classes.find(entry => entry.id === cancelButton.dataset.cancelClass);
    if (item) cancelClassBooking(item.id, item.date);
    return;
  }
  const enterButton = event.target.closest("[data-enter-class]");
  if (enterButton) { window.location.href = `classroom.html?id=${encodeURIComponent(enterButton.dataset.enterClass)}&mode=live`; return; }
  const bookmarkButton = event.target.closest("[data-class-bookmark]");
  if (bookmarkButton) {
    const id = bookmarkButton.dataset.classBookmark;
    savedClasses.has(id) ? savedClasses.delete(id) : savedClasses.add(id);
    localStorage.setItem("dn-saved-classes", JSON.stringify([...savedClasses]));
    // Re-render both views so the saved state remains consistent everywhere.
    renderClasses();
    renderLiveClasses();
    renderMyLearning();
    return;
  }

  const openedCard = event.target.closest(".class-card");
  if (openedCard && !event.target.closest("button")) {
    recordRecentlyViewed(openedCard);
    openedCard.classList.add("was-viewed");
    return;
  }

  const bookButton = event.target.closest("[data-book-class]");
  if (bookButton) {
    const item = classes.find(entry => entry.id === bookButton.dataset.bookClass);
    if (!item || bookedClasses.has(item.id)) return;
    booking.open(item, bookButton);
  }
}

window.addEventListener("dn:bookings-updated", syncBookingButtons);
window.addEventListener("storage", event => {
  if (event.key?.startsWith("dn-bookings:")) syncBookingButtons();
});

classTrack.addEventListener("click", handleCardAction);
liveClassTrack.addEventListener("click", handleCardAction);

function recordRecentlyViewed(card) {
  const id = card?.dataset.classId;
  if (!id) return;
  const existingIndex = recentlyViewed.indexOf(id);
  if (existingIndex !== -1) recentlyViewed.splice(existingIndex, 1);
  recentlyViewed.unshift(id);
  recentlyViewed.splice(8);
  localStorage.setItem("dn-recently-viewed", JSON.stringify(recentlyViewed));
  renderMyLearning();
}

[classTrack, liveClassTrack].forEach(track => {
  track.addEventListener("keydown", event => {
    if ((event.key === "Enter" || event.key === " ") &&
        event.target.matches(".class-card")) {
      event.preventDefault();
      recordRecentlyViewed(event.target);
    }
  });
});

function moveCarousel(track, direction) {
  const card = $(".class-card", track);
  if (!card) return;
  const gap = parseFloat(getComputedStyle(track).gap) || 16;
  track.scrollBy({
    left: direction * (card.getBoundingClientRect().width + gap),
    behavior: "smooth"
  });
}

$("#classPrev").addEventListener("click", () => moveCarousel(classTrack, -1));
$("#classNext").addEventListener("click", () => moveCarousel(classTrack, 1));
$("#livePrev").addEventListener("click", () => moveCarousel(liveClassTrack, -1));
$("#liveNext").addEventListener("click", () => moveCarousel(liveClassTrack, 1));

classTrack.addEventListener("scroll", updateAllArrows, { passive: true });
liveClassTrack.addEventListener("scroll", updateAllArrows, { passive: true });

const eventTrack = $("#eventTrack");
$("#eventPrev").addEventListener("click", () => {
  eventTrack.scrollBy({ left: -Math.max(280, eventTrack.clientWidth * 0.8), behavior: "smooth" });
});
$("#eventNext").addEventListener("click", () => {
  eventTrack.scrollBy({ left: Math.max(280, eventTrack.clientWidth * 0.8), behavior: "smooth" });
});
eventTrack.addEventListener("scroll", updateAllArrows, { passive: true });

$("#seriesCardsPrev")?.addEventListener("click", () => moveSeriesCards(-1));
$("#seriesCardsNext")?.addEventListener("click", () => moveSeriesCards(1));
$("#seriesCardsTrack")?.addEventListener("scroll", updateSeriesCardsArrows, { passive: true });

searchInputs.forEach(input => {
  input.addEventListener("input", event => {
    searchTerm = event.target.value.trim().toLowerCase();
    searchInputs.forEach(otherInput => {
      if (otherInput !== event.target) otherInput.value = event.target.value;
    });
    renderClasses();
  });
});

// Accessible dropdown navigation.
const classesToggle = $("#classesToggle");
const classesMenu = $("#classesMenu");
function closeDropdown() {
  classesMenu?.classList.remove("show");
  classesToggle?.setAttribute("aria-expanded", "false");
}
classesToggle?.addEventListener("click", event => {
  event.stopPropagation();
  const open = classesMenu.classList.toggle("show");
  classesToggle.setAttribute("aria-expanded", String(open));
});
document.addEventListener("click", event => {
  if (!event.target.closest(".dropdown-wrapper")) closeDropdown();
});

// Mobile navigation menu.
const mobileMenuToggle = $("#mobileMenuToggle");
const navigation = $("#primaryNavigation");
mobileMenuToggle?.addEventListener("click", () => {
  const open = navigation.classList.toggle("mobile-open");
  mobileMenuToggle.setAttribute("aria-expanded", String(open));
  mobileMenuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  mobileMenuToggle.innerHTML = `<i class="fa-solid ${open ? "fa-xmark" : "fa-bars"}"></i><span>${open ? "Close" : "Menu"}</span>`;
});
$$(".nav-links a, .mobile-utility-links a").forEach(link => link.addEventListener("click", () => {
  navigation.classList.remove("mobile-open");
  mobileMenuToggle?.setAttribute("aria-expanded", "false");
  if (mobileMenuToggle) mobileMenuToggle.innerHTML = '<i class="fa-solid fa-bars"></i><span>Menu</span>';
}));

// Close the mobile menu with Escape or when the user taps outside the header.
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    navigation?.classList.remove("mobile-open");
    mobileMenuToggle?.setAttribute("aria-expanded", "false");
    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute("aria-label", "Open navigation");
      mobileMenuToggle.innerHTML = '<i class="fa-solid fa-bars"></i><span>Menu</span>';
    }
    closeDropdown();
  }
});

document.addEventListener("click", event => {
  if (!event.target.closest(".site-header")) {
    navigation?.classList.remove("mobile-open");
    mobileMenuToggle?.setAttribute("aria-expanded", "false");
    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute("aria-label", "Open navigation");
      mobileMenuToggle.innerHTML = '<i class="fa-solid fa-bars"></i><span>Menu</span>';
    }
  }
});


// Render the featured Keep Learning series from the central data file.
function renderFeaturedSeries() {
  const image = $("#featuredSeriesImage");
  const badge = $("#featuredSeriesBadge");
  const title = $("#featuredSeriesTitle");
  const tag = $("#featuredSeriesTag");
  const description = $("#featuredSeriesDescription");
  const link = $("#featuredSeriesLink");

  if (!featuredSeries || !image || !badge || !title || !tag || !description || !link) return;

  image.src = featuredSeries.image;
  image.alt = featuredSeries.imageAlt || featuredSeries.title;
  badge.textContent = featuredSeries.badge;
  title.textContent = featuredSeries.title;
  tag.textContent = featuredSeries.tag;
  description.textContent = featuredSeries.description;
  link.href = featuredSeries.href;
  link.innerHTML = `${featuredSeries.buttonText} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>`;
}


// Render the three featured series cards from the central data file.
function renderFeaturedSeriesCards() {
  const track = $("#seriesCardsTrack");
  if (!track || !Array.isArray(featuredSeriesCards)) return;

  track.innerHTML = featuredSeriesCards.map(item => `
    <article class="series-card" data-series-id="${item.id}">
      <a class="series-card-image" href="${item.href}" aria-label="${item.buttonText}: ${item.title}">
        <img src="${item.image}" alt="${item.imageAlt || item.title}" loading="lazy">
      </a>
      <div class="series-card-content">
        <h3>${item.title}</h3>
        <span class="series-card-tag">${item.tag}</span>
        <p>${item.description}</p>
        <a class="series-card-button" href="${item.href}" aria-label="${item.buttonText}: ${item.title}">
          ${item.buttonText}
        </a>
      </div>
    </article>
  `).join("");

  requestAnimationFrame(updateSeriesCardsArrows);
}

function updateSeriesCardsArrows() {
  const track = $("#seriesCardsTrack");
  const previous = $("#seriesCardsPrev");
  const next = $("#seriesCardsNext");
  if (!track || !previous || !next) return;
  const maxScroll = track.scrollWidth - track.clientWidth;
  previous.disabled = track.scrollLeft <= 2;
  next.disabled = maxScroll <= 2 || track.scrollLeft >= maxScroll - 2;
}

function moveSeriesCards(direction) {
  const track = $("#seriesCardsTrack");
  const card = $(".series-card", track);
  if (!track || !card) return;
  const gap = parseFloat(getComputedStyle(track).gap) || 24;
  track.scrollBy({
    left: direction * (card.getBoundingClientRect().width + gap),
    behavior: "smooth"
  });
}

// Initial render.
renderFeaturedSeries();
renderFeaturedSeriesCards();
renderMyLearning();
renderClasses();
renderLiveClasses();
requestAnimationFrame(updateAllArrows);
window.addEventListener("resize", () => { updateAllArrows(); updateSeriesCardsArrows(); });

// Helen Digital Assistant — local demo responses (replaceable by an API later)
const helenForm = document.querySelector("#helenForm");
const helenQuestion = document.querySelector("#helenQuestion");
const helenResponse = document.querySelector("#helenResponse");
const helenResponseText = document.querySelector("#helenResponseText");
const helenSuggestions = document.querySelectorAll(".helen-suggestion");

const helenDemoReplies = [
  { match: ["support", "service", "help", "resource"], answer: "Disability Network can help you explore community resources, independent living support, referrals and programs. The right options depend on your needs and where you live. Contact our team and we can help you identify a useful next step." },
  { match: ["technology", "assistive", "device"], answer: "Assistive technology can include screen readers, communication devices, mobility aids and tools that make everyday tasks easier. A good starting point is to identify the activity you want support with, then speak with a qualified provider about suitable options." },
  { match: ["employment", "job", "work", "career"], answer: "You can explore vocational rehabilitation, accessible job-search resources and employers that offer accommodations. Contact our team for help finding services and employment resources in your area." },
  { match: ["class", "learn", "course", "workshop"], answer: "Explore the classes and workshops on this page to find learning opportunities. You can save classes using the bookmark icon and revisit them in the My Learning section." }
];

function getHelenDemoReply(question) {
  const normalized = question.toLowerCase();
  const found = helenDemoReplies.find(item => item.match.some(word => normalized.includes(word)));
  return found?.answer || "Thanks for your question. I can help point you toward disability resources, independent living information, classes and community support. For a specific answer about your situation, please contact the Disability Network team using the Contact Our Team link.";
}

function askHelen(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;
  helenQuestion.value = cleanQuestion;
  helenResponseText.textContent = getHelenDemoReply(cleanQuestion);
  helenResponse.hidden = false;
}

helenSuggestions.forEach(button => {
  button.addEventListener("click", () => {
    helenQuestion.value = button.textContent.trim();
    askHelen(helenQuestion.value);
  });
});

helenForm?.addEventListener("submit", event => {
  event.preventDefault();
  askHelen(helenQuestion.value);
});


// Additional homepage discovery carousels.
function moveDiscoveryTrack(trackId, direction) {
  const track = document.getElementById(trackId);
  const card = track?.querySelector('.discovery-card');
  if (!track || !card) return;
  const gap = parseFloat(getComputedStyle(track).gap) || 18;
  track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: 'smooth' });
}
[['featuredPrev','featuredTrack',-1],['featuredNext','featuredTrack',1],['popularPrev','popularTrack',-1],['popularNext','popularTrack',1]].forEach(([buttonId, trackId, direction]) => {
  document.getElementById(buttonId)?.addEventListener('click', () => moveDiscoveryTrack(trackId, direction));
});

// Community story area intentionally uses an editorial placeholder until approved,
// real community testimonials are supplied by Disability Network.
const communityStorySlides = [
  {
    avatar: 'D', label: 'Community spotlight', name: 'Your story belongs here',
    quote: 'We are collecting stories from people in the Disability Network community. Check back soon to hear directly from community members about their experiences, milestones and the support that has made a difference.'
  },
  {
    avatar: '♥', label: 'Share your experience', name: 'Help others feel connected',
    quote: 'Your experience can help someone else discover a resource, feel understood or take a new step toward their goals. We welcome stories about community connection, independence, learning and advocacy.'
  }
];
let communityStoryIndex = 0;
function renderCommunityStory() {
  const slide = communityStorySlides[communityStoryIndex];
  const avatar = document.getElementById('storyAvatar');
  const label = document.getElementById('storyLabel');
  const name = document.getElementById('storyName');
  const quote = document.getElementById('storyQuote');
  if (!avatar || !label || !name || !quote) return;
  avatar.textContent = slide.avatar;
  label.textContent = slide.label;
  name.textContent = slide.name;
  quote.textContent = slide.quote;
}
document.getElementById('storyPrev')?.addEventListener('click', () => {
  communityStoryIndex = (communityStoryIndex - 1 + communityStorySlides.length) % communityStorySlides.length;
  renderCommunityStory();
});
document.getElementById('storyNext')?.addEventListener('click', () => {
  communityStoryIndex = (communityStoryIndex + 1) % communityStorySlides.length;
  renderCommunityStory();
});
renderCommunityStory();


// Personalize the homepage hero for signed-in learners.
function updateHomeHeroForAccount() {
  const title = document.querySelector("#homeHeroTitle");
  const description = document.querySelector("#homeHeroDescription");
  const button = document.querySelector("#homeHeroButton");
  if (!title || !description || !button) return;

  let account = null;
  try { account = JSON.parse(localStorage.getItem("dn-current-user") || "null"); } catch {}
  if (!account?.email) return;

  const savedFirstName = String(account.firstName || account.name || account.email.split("@")[0]).trim();
  const firstName = savedFirstName.split(/\s+/)[0] || "there";
  title.replaceChildren();
  title.append(document.createTextNode(`Welcome back, ${firstName}!`));
  description.textContent = "New classes, learning resources, and live sessions are waiting for you.";
  button.innerHTML = 'Continue Learning <i class="fa-solid fa-arrow-right"></i>';
  button.href = "my-schedule.html";
}
updateHomeHeroForAccount();
window.addEventListener("storage", event => {
  if (event.key === "dn-current-user") updateHomeHeroForAccount();
});
window.addEventListener("dn:account-updated", updateHomeHeroForAccount);
