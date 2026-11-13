// Guides directory content.
// Keep guide names and portrait paths here so the page markup stays clean.
// Replace the temporary image filenames with individual portraits when available.
window.guidesData = [
  {
    "name": "Community Hosts",
    "image": "community-1.jpg"
  },
  {
    "name": "Twyla Teitzel",
    "image": "community-2.jpg"
  },
  {
    "name": "Pilar Rodriguez",
    "image": "community-3.jpg"
  },
  {
    "name": "Wade Yarbrough",
    "image": "community-1.jpg"
  },
  {
    "name": "Marjorie Tucker",
    "image": "community-2.jpg"
  },
  {
    "name": "Deana Neibert",
    "image": "community-3.jpg"
  },
  {
    "name": "Bernadette Barton",
    "image": "community-1.jpg"
  },
  {
    "name": "Cyndi McCauley",
    "image": "community-2.jpg"
  },
  {
    "name": "Jennifer Kimball",
    "image": "community-3.jpg"
  },
  {
    "name": "Janine Davis",
    "image": "community-1.jpg"
  },
  {
    "name": "Jacquelyn Taylor",
    "image": "community-2.jpg"
  },
  {
    "name": "Stacy Robinson",
    "image": "community-3.jpg"
  },
  {
    "name": "Elaine Scribner",
    "image": "community-1.jpg"
  },
  {
    "name": "Yanira Puy",
    "image": "community-2.jpg"
  },
  {
    "name": "Community Sessions",
    "image": "community-3.jpg"
  },
  {
    "name": "Lee Weinberg",
    "image": "community-1.jpg"
  },
  {
    "name": "Community Host",
    "image": "community-2.jpg"
  },
  {
    "name": "Alina Lyu",
    "image": "community-3.jpg"
  },
  {
    "name": "Philip Castagnet",
    "image": "community-1.jpg"
  },
  {
    "name": "Community Session",
    "image": "community-2.jpg"
  },
  {
    "name": "Simon Chin",
    "image": "community-3.jpg"
  },
  {
    "name": "Jennifer Fisher",
    "image": "community-1.jpg"
  },
  {
    "name": "Jackie King",
    "image": "community-2.jpg"
  },
  {
    "name": "Vanessa LaBranche",
    "image": "community-3.jpg"
  },
  {
    "name": "Adam Smith",
    "image": "community-1.jpg"
  },
  {
    "name": "Sue Tang",
    "image": "community-2.jpg"
  },
  {
    "name": "Sue Murray",
    "image": "community-3.jpg"
  },
  {
    "name": "Gary Gross",
    "image": "community-1.jpg"
  },
  {
    "name": "Natalie Cossar",
    "image": "community-2.jpg"
  },
  {
    "name": "Glenda Springer",
    "image": "community-3.jpg"
  },
  {
    "name": "Binda Kanayalkar",
    "image": "community-1.jpg"
  },
  {
    "name": "Alana King",
    "image": "community-2.jpg"
  },
  {
    "name": "Shirley Mitchell",
    "image": "community-3.jpg"
  },
  {
    "name": "Pam Penney",
    "image": "community-1.jpg"
  },
  {
    "name": "Joanne Giardini-Russell",
    "image": "community-2.jpg"
  },
  {
    "name": "Amanda Yeo",
    "image": "community-3.jpg"
  },
  {
    "name": "Virginia Buckles",
    "image": "community-1.jpg"
  },
  {
    "name": "Kevin Miller",
    "image": "community-2.jpg"
  },
  {
    "name": "Ellen Jaffe Jones",
    "image": "community-3.jpg"
  },
  {
    "name": "Michele West",
    "image": "community-1.jpg"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#guidesGrid");
  if (!grid || !Array.isArray(window.guidesData)) return;

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  grid.innerHTML = window.guidesData.map((guide) => {
    const name = escapeHTML(guide.name);
    const image = escapeHTML(guide.image);
    return `
      <article class="guide-card">
        <div class="guide-card-banner"
             style="--guide-image: url('assets/images/${image}')"
             aria-hidden="true"></div>
        <div class="guide-avatar">
          <img src="assets/images/${image}"
               alt="Temporary profile photo for ${name}"
               loading="lazy">
        </div>
        <div class="guide-card-info">
          <h2>${name}</h2>
        </div>
      </article>
    `;
  }).join("");
});
