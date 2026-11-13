import { saveClassBooking } from "./booking-store.js";
// Booking confirmation and calendar integrations.
export function createBookingController() {
  const modal = document.getElementById("bookingModal");
  const copy = document.getElementById("bookingConfirmationCopy");
  const closeButton = document.getElementById("closeBookingModal");
  const doneButton = document.getElementById("bookingDoneBtn");
  let previousTrigger = null;

  // Interpret scheduled class times in Detroit, regardless of the visitor's device timezone.
  const DETROIT_TIME_ZONE = "America/Detroit";
  const getLocalDate = (date, time) => {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const desiredUtc = Date.UTC(year, month - 1, day, hour, minute);
    let guess = new Date(desiredUtc);
    for (let i = 0; i < 3; i++) {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: DETROIT_TIME_ZONE, year: "numeric", month: "2-digit",
        day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
        hourCycle: "h23"
      }).formatToParts(guess);
      const value = type => Number(parts.find(part => part.type === type).value);
      const representedUtc = Date.UTC(
        value("year"), value("month") - 1, value("day"),
        value("hour"), value("minute"), value("second")
      );
      guess = new Date(guess.getTime() + desiredUtc - representedUtc);
    }
    return guess;
  };
  const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);
  const utcStamp = date => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escapeICS = value => String(value).replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");

  function prepareCalendarLinks(item) {
    const start = getLocalDate(item.date, item.time);
    const end = addMinutes(start, item.duration);
    const details = "Disability Network class. We look forward to learning with you!";
    const location = "Online";

    const google = new URLSearchParams({
      action: "TEMPLATE",
      text: item.title,
      dates: `${utcStamp(start)}/${utcStamp(end)}`,
      details,
      location
    });
    document.getElementById("googleCalendarLink").href =
      `https://calendar.google.com/calendar/render?${google}`;

    const outlook = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      subject: item.title,
      startdt: start.toISOString(),
      enddt: end.toISOString(),
      body: details,
      location
    });
    document.getElementById("outlookCalendarLink").href =
      `https://outlook.live.com/calendar/0/deeplink/compose?${outlook}`;

    const yahoo = new URLSearchParams({
      v: "60",
      title: item.title,
      st: utcStamp(start),
      et: utcStamp(end),
      desc: details,
      in_loc: location
    });
    document.getElementById("yahooCalendarLink").href =
      `https://calendar.yahoo.com/?${yahoo}`;

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Disability Network//Class Booking//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${item.id}-${item.date}@disabilitynetwork`,
      `DTSTAMP:${utcStamp(new Date())}`,
      `DTSTART:${utcStamp(start)}`,
      `DTEND:${utcStamp(end)}`,
      `SUMMARY:${escapeICS(item.title)}`,
      `DESCRIPTION:${escapeICS(details)}`,
      `LOCATION:${escapeICS(location)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const link = document.getElementById("appleCalendarLink");
    if (link.dataset.objectUrl) URL.revokeObjectURL(link.dataset.objectUrl);
    const objectUrl = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    link.href = objectUrl;
    link.dataset.objectUrl = objectUrl;
    link.download = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
  }

  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem("dn-current-user") || "null"); }
    catch { return null; }
  }

  function saveBooking(item) { return saveClassBooking(item); }

  function open(item, trigger) {
    const user = getCurrentUser();
    if (!user?.email) {
      sessionStorage.setItem("dn-pending-booking", item.id);
      window.location.href = "auth.html#login";
      return;
    }
    saveBooking(item);
    previousTrigger = trigger;
    copy.textContent = `You're booked for "${item.title}". We'll send you a reminder before the class starts.`;
    prepareCalendarLinks(item);
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("booking-modal-open");
    closeButton.focus();
  }

  function close() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("booking-modal-open");
    if (previousTrigger?.isConnected) previousTrigger.focus();
  }

  closeButton.addEventListener("click", close);
  doneButton.addEventListener("click", close);
  modal.addEventListener("click", event => {
    if (event.target.matches("[data-close-booking]")) close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("show")) close();
  });

  return { open, close };
}
