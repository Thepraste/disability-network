// Central class catalogue for Disability Network.
// Demo sessions are dated relative to the current Detroit calendar day.
// Replace these demo entries with managed schedule data when the backend is connected.
const getDetroitToday = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Detroit", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date());
  const get = type => Number(parts.find(part => part.type === type).value);
  return new Date(Date.UTC(get("year"), get("month") - 1, get("day")));
};
const addDetroitDays = offset => {
  const date = getDetroitToday();
  date.setUTCDate(date.getUTCDate() + offset);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,"0")}-${String(date.getUTCDate()).padStart(2,"0")}`;
};
const demoSessions = [
  {
    "id": "calendar-demo-1",
    "category": "Fitness",
    "title": "Gentle Seated Strength and Balance",
    "instructor": "Twyla Teitzel",
    "instructorImage": "assets/images/community-1.jpg",
    "image": "assets/images/community-1.jpg",
    "dayOffset": 0,
    "time": "09:00",
    "duration": 25,
    "video": false,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-2",
    "category": "Technology",
    "title": "Smartphone Basics: Calls, Messages and Settings",
    "instructor": "Lee Weinberg",
    "instructorImage": "assets/images/community-2.jpg",
    "image": "assets/images/community-2.jpg",
    "dayOffset": 1,
    "time": "10:00",
    "duration": 35,
    "video": true,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-3",
    "category": "Independent Living",
    "title": "Everyday Home Safety and Fall Prevention",
    "instructor": "Pilar Rodriguez",
    "instructorImage": "assets/images/community-3.jpg",
    "image": "assets/images/community-3.jpg",
    "dayOffset": 2,
    "time": "11:00",
    "duration": 30,
    "video": false,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-4",
    "category": "Health & Wellness",
    "title": "Building Healthy Habits One Step at a Time",
    "instructor": "Stacy Robinson",
    "instructorImage": "assets/images/community-1.jpg",
    "image": "assets/images/community-1.jpg",
    "dayOffset": 3,
    "time": "13:00",
    "duration": 30,
    "video": false,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-5",
    "category": "Arts & Creative",
    "title": "Creative Expression: Art for Everyone",
    "instructor": "Elaine Scribner",
    "instructorImage": "assets/images/community-2.jpg",
    "image": "assets/images/community-2.jpg",
    "dayOffset": 4,
    "time": "14:00",
    "duration": 45,
    "video": true,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-6",
    "category": "Technology",
    "title": "Getting Comfortable with Your Smartphone",
    "instructor": "Stacy Robinson",
    "instructorImage": "assets/images/community-2.jpg",
    "image": "assets/images/community-2.jpg",
    "dayOffset": 5,
    "time": "15:00",
    "duration": 45,
    "video": true,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-7",
    "category": "Fitness",
    "title": "Low-Impact Cardio You Can Do Seated",
    "instructor": "Twyla Teitzel",
    "instructorImage": "assets/images/community-3.jpg",
    "image": "assets/images/community-3.jpg",
    "dayOffset": 6,
    "time": "16:00",
    "duration": 20,
    "video": false,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-8",
    "category": "Community",
    "title": "Community Connections: Meet and Share",
    "instructor": "Community Host",
    "instructorImage": "assets/images/community-1.jpg",
    "image": "assets/images/community-1.jpg",
    "dayOffset": 0,
    "time": "17:00",
    "duration": 60,
    "video": true,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-9",
    "category": "Money & Jobs",
    "title": "Budgeting Basics for Everyday Life",
    "instructor": "Wade Yarbrough",
    "instructorImage": "assets/images/community-2.jpg",
    "image": "assets/images/community-2.jpg",
    "dayOffset": 1,
    "time": "09:30",
    "duration": 40,
    "video": false,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-10",
    "category": "Food",
    "title": "Simple, Healthy Meals on a Budget",
    "instructor": "Pilar Rodriguez",
    "instructorImage": "assets/images/community-3.jpg",
    "image": "assets/images/community-3.jpg",
    "dayOffset": 2,
    "time": "11:30",
    "duration": 30,
    "video": false,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-11",
    "category": "Lifestyle",
    "title": "Staying Organized with Digital Calendars",
    "instructor": "Lee Weinberg",
    "instructorImage": "assets/images/community-2.jpg",
    "image": "assets/images/community-2.jpg",
    "dayOffset": 3,
    "time": "13:30",
    "duration": 30,
    "video": true,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-12",
    "category": "Health & Wellness",
    "title": "Managing Stress Through Mindful Breathing",
    "instructor": "Stacy Robinson",
    "instructorImage": "assets/images/community-1.jpg",
    "image": "assets/images/community-1.jpg",
    "dayOffset": 4,
    "time": "15:30",
    "duration": 20,
    "video": false,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-13",
    "category": "Fitness",
    "title": "Gentle Exercises for Knee Pain",
    "instructor": "Twyla Teitzel",
    "instructorImage": "assets/images/community-3.jpg",
    "image": "assets/images/community-3.jpg",
    "dayOffset": 5,
    "time": "10:00",
    "duration": 20,
    "video": false,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-14",
    "category": "Technology",
    "title": "Video Calling: Connect with Family and Friends",
    "instructor": "Lee Weinberg",
    "instructorImage": "assets/images/community-2.jpg",
    "image": "assets/images/community-2.jpg",
    "dayOffset": 6,
    "time": "12:00",
    "duration": 35,
    "video": true,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-15",
    "category": "Disability Rights",
    "title": "Understanding Your Disability Rights",
    "instructor": "Community Advocate",
    "instructorImage": "assets/images/community-1.jpg",
    "image": "assets/images/community-1.jpg",
    "dayOffset": 0,
    "time": "14:00",
    "duration": 45,
    "video": true,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-16",
    "category": "Independent Living",
    "title": "Assistive Technology for Daily Living",
    "instructor": "Pilar Rodriguez",
    "instructorImage": "assets/images/community-3.jpg",
    "image": "assets/images/community-3.jpg",
    "dayOffset": 1,
    "time": "16:00",
    "duration": 40,
    "video": false,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-17",
    "category": "Travel & History",
    "title": "Discover Accessible Places Around Wayne County",
    "instructor": "Elaine Scribner",
    "instructorImage": "assets/images/community-2.jpg",
    "image": "assets/images/community-2.jpg",
    "dayOffset": 2,
    "time": "09:00",
    "duration": 30,
    "video": false,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-18",
    "category": "Medicare",
    "title": "Medicare Questions and Answers",
    "instructor": "Community Educator",
    "instructorImage": "assets/images/community-1.jpg",
    "image": "assets/images/community-1.jpg",
    "dayOffset": 3,
    "time": "10:30",
    "duration": 45,
    "video": true,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-19",
    "category": "Fitness",
    "title": "Stretch and Move: Full Body Mobility",
    "instructor": "Twyla Teitzel",
    "instructorImage": "assets/images/community-3.jpg",
    "image": "assets/images/community-3.jpg",
    "dayOffset": 4,
    "time": "13:00",
    "duration": 25,
    "video": false,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-20",
    "category": "Other Languages",
    "title": "Everyday English Conversation Practice",
    "instructor": "Alina Lyu",
    "instructorImage": "assets/images/community-2.jpg",
    "image": "assets/images/community-2.jpg",
    "dayOffset": 5,
    "time": "15:00",
    "duration": 40,
    "video": true,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-21",
    "category": "Food",
    "title": "Cooking Made Easier: Kitchen Tips and Tools",
    "instructor": "Pilar Rodriguez",
    "instructorImage": "assets/images/community-3.jpg",
    "image": "assets/images/community-3.jpg",
    "dayOffset": 6,
    "time": "11:00",
    "duration": 35,
    "video": false,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-22",
    "category": "Community",
    "title": "Peer Support and Community Conversation",
    "instructor": "Community Host",
    "instructorImage": "assets/images/community-1.jpg",
    "image": "assets/images/community-1.jpg",
    "dayOffset": 0,
    "time": "14:30",
    "duration": 60,
    "video": true,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-23",
    "category": "Health & Wellness",
    "title": "Understanding Telehealth and Online Care",
    "instructor": "Lee Weinberg",
    "instructorImage": "assets/images/community-2.jpg",
    "image": "assets/images/community-2.jpg",
    "dayOffset": 1,
    "time": "16:30",
    "duration": 30,
    "video": true,
    "status": "upcoming"
  },
  {
    "id": "calendar-demo-24",
    "category": "Lifestyle",
    "title": "Planning Your Week with Confidence",
    "instructor": "Stacy Robinson",
    "instructorImage": "assets/images/community-3.jpg",
    "image": "assets/images/community-3.jpg",
    "dayOffset": 2,
    "time": "18:00",
    "duration": 25,
    "video": false,
    "status": "upcoming"
  }
];
export const classes = demoSessions.map((item, index) => {
  const { dayOffset, ...session } = item;
  return { ...session, date: addDetroitDays(dayOffset) };
});

export const learningCategories = [
  "Fitness",
  "Technology",
  "Arts & Creative",
  "Food",
  "Health & Wellness",
  "Medicare",
  "Money & Jobs",
  "Lifestyle",
  "Travel & History",
  "Community",
  "Independent Living",
  "Disability Rights",
  "Other Languages"
];


// Featured series content. Update this object to change the homepage feature.
export const featuredSeries = {
  badge: "FEATURED PROGRAM",
  title: "Discover More with Disability Network",
  tag: "COMMUNITY CONNECTION",
  description:
    "Explore programs, community activities and opportunities designed to help people with disabilities connect, learn and participate.",
  image: "assets/images/community-3.jpg",
  imageAlt: "Disability Network community members connecting and sharing an activity",
  buttonText: "Explore Programs",
  href: "about.html"
};


/**
 * Featured Disability Network series cards.
 * Replace the temporary image paths with approved series photography when available.
 * Update href values when dedicated series detail pages are created.
 */
export const featuredSeriesCards = [
  {
    id: "independent-living",
    title: "Independent Living Resources",
    tag: "PLAN AHEAD",
    description: "Explore resources and practical guidance that support greater independence at home and in the community.",
    image: "assets/images/community-1.jpg",
    imageAlt: "Disability Network team member in a community support setting",
    buttonText: "View Series",
    href: "#contact"
  },
  {
    id: "assistive-technology",
    title: "Assistive Technology",
    tag: "LIVE WELL",
    description: "Discover accessible technology, tools and everyday solutions that can make daily activities easier.",
    image: "assets/images/community-2.jpg",
    imageAlt: "Disability Network team member representing accessible community support",
    buttonText: "View Series",
    href: "#contact"
  },
  {
    id: "disability-rights",
    title: "Disability Rights & Advocacy",
    tag: "KNOW YOUR RIGHTS",
    description: "Learn about disability rights, self-advocacy and ways to take part in an inclusive community.",
    image: "assets/images/community-3.jpg",
    imageAlt: "Disability Network team member representing advocacy and community inclusion",
    buttonText: "View Series",
    href: "#contact"
  }
];
