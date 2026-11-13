const USER_KEY = "dn-current-user";

function getSavedUser() {
  try {
    const value = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    return value && typeof value.email === "string" && value.email.trim() ? value : null;
  } catch {
    return null;
  }
}

function updateHeaderAccountState() {
  const user = getSavedUser();
  const signedIn = Boolean(user);

  // Hide/show every matching guest control together, preventing mixed header states.
  document.querySelectorAll("[data-guest-actions], .auth-buttons").forEach(element => {
    element.hidden = signedIn;
    element.setAttribute("aria-hidden", String(signedIn));
  });

  document.querySelectorAll("[data-account-menu]").forEach(menu => {
    menu.hidden = !signedIn;
    menu.setAttribute("aria-hidden", String(!signedIn));

    const trigger = menu.querySelector(".account-trigger");
    const dropdown = menu.querySelector(".account-dropdown");
    const nameNode = menu.querySelector("[data-account-name]");
    const avatarNode = menu.querySelector("[data-account-avatar]");

    if (!signedIn) {
      if (trigger) trigger.setAttribute("aria-expanded", "false");
      if (dropdown) dropdown.hidden = true;
      return;
    }

    const fullName = String(user.name || user.email.split("@")[0] || "Member").trim();
    const firstName = fullName.split(/\s+/)[0] || "Member";
    if (nameNode) nameNode.textContent = firstName;
    if (avatarNode) avatarNode.textContent = firstName.charAt(0).toUpperCase();
  });
}

document.querySelectorAll("[data-account-menu] .account-trigger").forEach(trigger => {
  trigger.addEventListener("click", event => {
    event.stopPropagation();
    const menu = trigger.closest("[data-account-menu]");
    const dropdown = menu?.querySelector(".account-dropdown");
    const opening = trigger.getAttribute("aria-expanded") !== "true";
    trigger.setAttribute("aria-expanded", String(opening));
    if (dropdown) dropdown.hidden = !opening;
  });
});

document.addEventListener("click", event => {
  document.querySelectorAll("[data-account-menu]").forEach(menu => {
    if (!menu.contains(event.target)) {
      menu.querySelector(".account-trigger")?.setAttribute("aria-expanded", "false");
      const dropdown = menu.querySelector(".account-dropdown");
      if (dropdown) dropdown.hidden = true;
    }
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll("[data-account-menu]").forEach(menu => {
      menu.querySelector(".account-trigger")?.setAttribute("aria-expanded", "false");
      const dropdown = menu.querySelector(".account-dropdown");
      if (dropdown) dropdown.hidden = true;
    });
  }
});

document.querySelectorAll("[data-account-logout]").forEach(button => {
  button.addEventListener("click", () => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem("dn-pending-booking");
    updateHeaderAccountState();
    window.location.href = "index.html";
  });
});

window.addEventListener("storage", event => {
  if (event.key === USER_KEY) updateHeaderAccountState();
});

// Keep the header in sync when account details change in this same tab.
window.updateHeaderAccountState = updateHeaderAccountState;
window.addEventListener("dn:account-updated", updateHeaderAccountState);

// Inline before first paint to avoid briefly showing both states.
updateHeaderAccountState();
