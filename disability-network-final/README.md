# Disability Network website

## Run locally
Open this folder in VS Code and use Live Server on `index.html`.
The JavaScript uses ES modules, so do not open the HTML as a `file://` URL.

## Project structure
- `index.html` – homepage markup
- `css/style.css` – existing base styling
- `css/responsive.css` – responsive layout and mobile navigation styles
- `js/data.js` – central class catalogue and learning categories
- `js/main.js` – page initialization, class rendering, search, filters, navigation and carousels
- `js/booking.js` – booking confirmation and calendar integrations
- `assets/images/` – supplied brand and community images

## Adding a class
Add a new object to the `classes` array in `js/data.js`.
Use an image path that exists under `assets/images/`. The current sample cards reuse the three supplied community photographs so the page does not show broken image links. Replace those image paths with actual class thumbnails when you have them.

## Notes
- The Services section has been removed from the homepage.
- The hero call-to-action now links to the learning section.
- Booking is still a front-end demonstration; no reservation is sent to a server.
- Bookings and saved classes are held in memory and reset when the page reloads.


## Final visual polish
The desktop footer spacing and logo presentation have been lightly refined, and class-card metadata typography has been kept consistent for readability. Existing sections, interactions, mobile layout, and the current design direction are preserved.


## My Playlists demo
- Open `my-playlists.html` after signing in with the demo account.
- Create playlists, add/remove classes, search playlists, and delete playlists.
- Playlist data is stored in browser localStorage under a key scoped to the signed-in email. It is demo-only and does not sync across devices.


## Account Settings demo
- Open `settings.html` while signed in with the demo account.
- Profile edits, interest preferences, notification language, partner toggles and Helen partner-cookie clearing are stored per demo account in localStorage.
- Password change is frontend validation only; secure password changes require backend authentication.
- Account deletion clears this demo account's browser-local data and signs the user out. It does not delete a server account because no backend is connected.
- Watched activity remains zero until class attendance/watch tracking is implemented.

## Admin control centre (frontend prototype)

Open `staff-login.html` and sign in with an administrator account created through `admin-setup.html`. The Admin Control Centre now includes:

- Overview metrics and upcoming sessions
- Class and session creation, editing, searching, filtering and deletion
- Tutor account creation, class assignment, activation and deactivation
- Published class-note review and unpublishing
- Live stream and replay URL management (HLS `.m3u8` and direct MP4 links)

Managed class changes are stored in `localStorage` under `dn-managed-classes-v1` and are read by the learner class listing, class detail, calendar, schedule, classroom, playlists and tutor dashboard. Staff accounts, assignments and published notes also remain browser-local. This is a frontend demonstration only; it is not multi-user or production-secure and does not upload media or synchronize across devices. Connect the backend before using real accounts, personal data or production scheduling.
