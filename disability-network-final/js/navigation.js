// Shared navigation behaviour used by every page with the site header.
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector("#mobileMenuToggle");
  const navigation = document.querySelector("#primaryNavigation");

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const open = navigation.classList.toggle("mobile-open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
  }

  document.querySelectorAll(".dropdown-wrapper").forEach(wrapper => {
    const trigger = wrapper.querySelector(".dropdown-toggle");
    const menu = wrapper.querySelector(".dropdown-menu");
    if (!trigger || !menu) return;

    // Give each control a consistent accessible relationship.
    if (!menu.id) menu.id = "classesMenu";
    trigger.setAttribute("aria-controls", menu.id);
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    if (!trigger.hasAttribute("type")) trigger.setAttribute("type", "button");

    const close = () => {
      menu.classList.remove("show");
      trigger.setAttribute("aria-expanded", "false");
    };

    trigger.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const opening = trigger.getAttribute("aria-expanded") !== "true";
      // Close any other open dropdown before toggling this one.
      document.querySelectorAll(".dropdown-wrapper").forEach(other => {
        other.querySelector(".dropdown-menu")?.classList.remove("show");
        other.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
      });
      menu.classList.toggle("show", opening);
      trigger.setAttribute("aria-expanded", String(opening));
    });

    wrapper.addEventListener("click", event => event.stopPropagation());
    document.addEventListener("click", close);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        close();
        trigger.focus();
      }
    });
  });
});
