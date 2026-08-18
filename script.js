/* -------------------------------------------------------------------------- */
/* TRIPBUDDY - MASTER JAVASCRIPT ENGINE                                       */
/* Interactivity, SPA View Routing, Data State, Filters, Modals & Admin Logic */
/* -------------------------------------------------------------------------- */

// --- INITIAL DATA STORE & SUPABASE DATABASE CONFIGURATION ---

const API_BASE_URL = 'https://trip-buddy-mu.vercel.app';

const SUPABASE_URL = 'https://afwixacnnmvrvfsnvdxu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eHKdCuol5Cw4gOg6OhDWpg_1up2pVMs';

// Initialize Supabase Client safely using CDN global
let supabaseClient = null;
if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const initialTrips = [
  {
    id: "WB-101",
    title: "Bali Spiritual Retreat & Exploration",
    category: "Adventure",
    cover: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    price: "LKR 185,000",
    priceRaw: 185000,
    badge: "VERIFIED HOST",
    badgeClass: "verified-tag",
    days: 10,
    startDate: "2026-10-12",
    endDate: "2026-10-22",
    languages: "English, Sinhala",
    host: "Sarah Jenkins",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    hostBio: "Professional Yoga Instructor • 14 trips hosted",
    location: "Ubud, Indonesia",
    quotas: "2 Males, 2 Females",
    vehicle: "Private Luxury Van",
    description: "Reconnect with your inner self in the heart of Ubud. This 10-day spiritual retreat is designed for those seeking a balance between high-altitude adventure and deep meditative practices. We'll start our days with sunrise yoga overlooking the Tegallalang Rice Terrace and end them with traditional Balinese sound healing ceremonies.",
    status: "approved"
  },
  {
    id: "WB-102",
    title: "Amalfi Coast Luxury Escape & Sailing",
    category: "Beach",
    cover: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
    price: "LKR 420,000",
    priceRaw: 420000,
    badge: "NEW HOST",
    badgeClass: "new-tag",
    days: 7,
    startDate: "2026-11-05",
    endDate: "2026-11-12",
    languages: "English, Italian",
    host: "Sarah Chen",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    hostBio: "Coastal photographer & sailing enthusiast",
    location: "Positano, Italy",
    quotas: "1 Male, 3 Females",
    vehicle: "Chartered Yacht & Convertible",
    description: "Cruise along Italy's breathtaking coastline, explore cliffside towns, sample authentic seafood, and swim in azure waters.",
    status: "approved"
  },
  {
    id: "WB-103",
    title: "Swiss Alps Hiking Expedition",
    category: "Mountain",
    cover: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
    price: "LKR 245,000",
    priceRaw: 245000,
    badge: "VERIFIED HOST",
    badgeClass: "verified-tag",
    days: 8,
    startDate: "2026-12-20",
    endDate: "2026-12-28",
    languages: "English, German",
    host: "Mark J.",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    hostBio: "Alpine guide & winter sports expert",
    location: "Zermatt, Switzerland",
    quotas: "3 Males, 1 Female",
    vehicle: "Alpine Railway & 4x4 SUV",
    description: "High-altitude winter expedition featuring glacier walks, cozy chalets, fondue nights, and panoramic views of the Matterhorn.",
    status: "approved"
  },
  {
    id: "WB-104",
    title: "Knuckles Cloud Forest Camping Trek",
    category: "Adventure",
    cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    price: "LKR 45,000",
    priceRaw: 45000,
    badge: "VERIFIED HOST",
    badgeClass: "verified-tag",
    days: 3,
    startDate: "2026-08-15",
    endDate: "2026-08-18",
    languages: "Sinhala, English",
    host: "Alex Thorne",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    hostBio: "Experienced local mountaineer",
    location: "Kandy, Sri Lanka",
    quotas: "2 Males, 2 Females",
    vehicle: "Private 4WD Jeep",
    description: "Immerse yourself in UNESCO World Heritage forest reserves. Hike through mist-covered peaks, hidden waterfalls, and remote villages.",
    status: "approved"
  },
  {
    id: "WB-105",
    title: "Historical Sigiriya & Cultural Triangle",
    category: "Cultural",
    cover: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    price: "LKR 55,000",
    priceRaw: 55000,
    badge: "VERIFIED HOST",
    badgeClass: "verified-tag",
    days: 4,
    startDate: "2026-04-10",
    endDate: "2026-04-14",
    languages: "English, Sinhala",
    host: "Anura Kumara",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    hostBio: "Certified wildlife tracker and historical guide",
    location: "Sigiriya & Dambulla, LK",
    quotas: "2 Males, 2 Females",
    vehicle: "Air-Conditioned Minivan",
    description: "Explore the ancient rock fortress of Sigiriya, Dambulla Cave Temples, and Habarana elephant safaris with an expert local host.",
    status: "approved"
  },
  {
    id: "WB-106",
    title: "Southern Coast Surf & Coastal Drive",
    category: "Road trip",
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    price: "LKR 65,000",
    priceRaw: 65000,
    badge: "NEW HOST",
    badgeClass: "new-tag",
    days: 4,
    startDate: "2026-09-01",
    endDate: "2026-09-05",
    languages: "Sinhala, English",
    host: "Nipuni Silva",
    hostAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    hostBio: "Surf instructor & road trip host",
    location: "Mirissa to Ahangama, LK",
    quotas: "2 Males, 2 Females",
    vehicle: "Open Roof Beach Convertible Van",
    description: "Catch waves along Hiriketiya, whale watching in Mirissa, and sunset beach bonfires with co-travelers.",
    status: "approved"
  }
];

const serviceProviders = [
  {
    id: "PRO-8821",
    name: "Anura Kumara",
    type: "Tour Guide",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    contact: "+94 77 123 4567",
    email: "anura.guide@mail.lk",
    location: "Central Province & Sigiriya",
    rating: 4.9,
    reviews: 86,
    status: "VERIFIED",
    badgeClass: "verified-tag",
    description: "Certified wildlife tracker and historical guide with 12 years of experience leading Knuckles & Sigiriya expeditions."
  },
  {
    id: "PRO-1029",
    name: "Island Vista Travels & Villas",
    type: "Hotel",
    avatar: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80",
    contact: "+94 11 288 8999",
    email: "reservations@islandvista.com",
    location: "Ella & Nuwara Eliya",
    rating: 4.8,
    reviews: 142,
    status: "VERIFIED",
    badgeClass: "verified-tag",
    description: "Eco-friendly boutique villas providing group discounts and host meal packages for companion groups."
  },
  {
    id: "PRO-4432",
    name: "Rohan Samaraweera Fleet Renders",
    type: "Vehicle Render",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    contact: "+94 71 455 5111",
    email: "rohan.fleet@service.lk",
    location: "Islandwide Delivery",
    rating: 5.0,
    reviews: 98,
    status: "VERIFIED",
    badgeClass: "verified-tag",
    description: "Provides 14-seater luxury KDH vans, 4WD Montero SUVs, and self-drive options with full insurance coverage."
  }
];

let state = {
  trips: [...initialTrips],
  selectedCategory: "all",
  searchQuery: "",
  activeView: "discover",
  selectedTripId: "WB-101",
  createTripDestinations: [],
  drafts: [
    { title: "Untitled Trip to Iceland", date: "Last edited 2 days ago" }
  ],
  currentUser: null,
  pendingUsers: [
    { id: "USR-9901", name: "David Thompson", email: "david.t@example.com", dob: "05 May 1975", phone: "+44 7700 900123", role: "Traveler", status: "pending_approval", registerDate: "2026-07-29" },
    { id: "USR-9902", name: "Jessica Lee", email: "jessica.l@example.com", dob: "18 Aug 1992", phone: "+1 202 555 0128", role: "Traveler", status: "pending_approval", registerDate: "2026-07-30" }
  ],
  adminUsers: [
    { id: "ADM-001", name: "Primary System Admin", email: "admin@tripbuddy.com", role: "Primary Admin", addedDate: "2026-01-01" },
    { id: "ADM-002", name: "Sarah Jenkins", email: "sarah.admin@tripbuddy.com", role: "Moderator Admin", addedDate: "2026-03-15" }
  ],
  chats: {
    "WB-101": [
      { sender: "Sarah Jenkins (Host)", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80", text: "Hey tribe! I've finalized the itinerary for our first day in Ubud. We'll start with a sunrise meditation at Tirta Empul Temple.", time: "09:12 AM", isHost: true },
      { sender: "You (Alex)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", text: "That sounds amazing! Do we need to bring our own sarongs or are they provided?", time: "09:15 AM", isHost: false },
      { sender: "Elena", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", text: "I was wondering the same thing! Also, are hiking sandals recommended?", time: "09:18 AM", isHost: false },
      { sender: "Sarah Jenkins (Host)", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80", text: "They are provided at the temple entrance! Standard walking sandals work great.", time: "09:22 AM", isHost: true }
    ],
    "WB-102": [
      { sender: "Sarah Chen (Host)", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", text: "Welcome to the Amalfi Coast Sailing group! Please bring non-marking deck shoes for the yacht.", time: "10:00 AM", isHost: true }
    ],
    "WB-103": [
      { sender: "Mark J. (Host)", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", text: "Greetings alpine hikers! Make sure thermal layers and waterproof boots are packed for Zermatt.", time: "08:30 AM", isHost: true }
    ],
    "WB-104": [
      { sender: "Alex Thorne (Host)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", text: "Welcome campers! Knuckles trek leaves at 6:00 AM from Kandy town.", time: "07:00 AM", isHost: true }
    ],
    "WB-105": [
      { sender: "Anura Kumara (Host)", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", text: "This trip concluded on April 14, 2026. Thank you to all who participated!", time: "06:00 PM", isHost: true }
    ]
  }
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  setupDateInputs();
  renderUserProfile();
  updateAuthUI();
  setupNavigationEventListeners();
  renderDestinationsRouteList();
  await fetchApprovedTripsFromSupabase();
  renderTripGrid();
  renderServicesGrid();
  renderAdminTables();
  renderAdminList();

  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get("resetToken");
  if (resetToken) {
    openResetPasswordModal(resetToken);
  }
});

// Outside-Click Listener to close User Dropdown and Notifications Drawer when clicking outside
document.addEventListener("click", (e) => {
  const userDropdown = document.getElementById("user-dropdown");
  const avatarWrapper = document.querySelector(".user-avatar-wrapper");
  if (userDropdown && userDropdown.classList.contains("open")) {
    if (!userDropdown.contains(e.target) && (!avatarWrapper || !avatarWrapper.contains(e.target))) {
      closeUserDropdown();
    }
  }

  const notifDrawer = document.getElementById("notif-drawer");
  const notifBell = document.getElementById("notif-bell");
  if (notifDrawer && notifDrawer.classList.contains("open")) {
    if (!notifDrawer.contains(e.target) && (!notifBell || !notifBell.contains(e.target))) {
      closeNotifDrawer();
    }
  }
});

function setupNavigationEventListeners() {
  const navDiscover = document.getElementById("nav-discover");
  if (navDiscover) {
    navDiscover.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("discover", e);
    });
  }

  const navCreate = document.getElementById("nav-create");
  if (navCreate) {
    navCreate.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("create", e);
    });
  }

  const navServices = document.getElementById("nav-services");
  if (navServices) {
    navServices.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("services", e);
    });
  }

  const navAdmin = document.getElementById("nav-admin");
  if (navAdmin) {
    navAdmin.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("admin", e);
    });
  }

  const navSignin = document.getElementById("nav-signin");
  if (navSignin) {
    navSignin.addEventListener("click", (e) => {
      e.preventDefault();
      showAuthModal("login", e);
    });
  }

  document.querySelectorAll(".nav-brand").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("discover", e);
    });
  });

  document.querySelectorAll(".btn-back").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("discover", e);
    });
  });
}

// --- SUPABASE DATABASE QUERY FUNCTIONS ---

async function fetchApprovedTripsFromSupabase() {
  if (supabaseClient && SUPABASE_URL !== 'https://afwixacnnmvrvfsnvdxu.supabase.co') {
    try {
      const { data, error } = await supabaseClient
        .from('trips')
        .select('*')
        .eq('status', 'approved');

      if (!error && data && data.length > 0) {
        state.trips = data.map(t => ({
          id: t.id,
          title: t.title,
          category: t.category,
          cover: t.cover,
          price: t.price,
          priceRaw: t.price_raw || 50000,
          badge: t.badge || "VERIFIED HOST",
          badgeClass: t.badge_class || "verified-tag",
          days: t.days || 5,
          startDate: t.start_date,
          endDate: t.end_date,
          languages: t.languages || "English, Sinhala",
          host: t.host || "Alex Thorne",
          hostAvatar: t.host_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          hostBio: t.host_bio || "Verified Host",
          location: t.location,
          quotas: t.quotas,
          vehicle: t.vehicle,
          description: t.description,
          status: t.status
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch warning, using local mock data:", err);
    }
  }
}

async function fetchPendingTripsFromSupabase() {
  if (supabaseClient && SUPABASE_URL !== 'https://afwixacnnmvrvfsnvdxu.supabase.co') {
    try {
      const { data, error } = await supabaseClient
        .from('trips')
        .select('*');

      if (!error && data && data.length > 0) {
        const existingIds = new Set(state.trips.map(t => t.id));
        data.forEach(t => {
          if (!existingIds.has(t.id)) {
            state.trips.push({
              id: t.id,
              title: t.title,
              category: t.category,
              cover: t.cover,
              price: t.price,
              priceRaw: t.price_raw || 50000,
              badge: t.badge || "PENDING VERIFICATION",
              badgeClass: t.badge_class || "warning-tag",
              days: t.days || 5,
              startDate: t.start_date,
              endDate: t.end_date,
              languages: t.languages || "English, Sinhala",
              host: t.host,
              hostAvatar: t.host_avatar,
              hostBio: t.host_bio,
              location: t.location,
              quotas: t.quotas,
              vehicle: t.vehicle,
              description: t.description,
              status: t.status
            });
          }
        });
      }
    } catch (err) {
      console.warn("Supabase pending fetch fallback:", err);
    }
  }
}

async function insertTripToSupabase(tripObj) {
  if (supabaseClient && SUPABASE_URL !== 'https://afwixacnnmvrvfsnvdxu.supabase.co') {
    try {
      const { error } = await supabaseClient
        .from('trips')
        .insert([{
          id: tripObj.id,
          title: tripObj.title,
          category: tripObj.category,
          cover: tripObj.cover,
          price: tripObj.price,
          price_raw: tripObj.priceRaw,
          badge: tripObj.badge,
          badge_class: tripObj.badgeClass,
          days: tripObj.days,
          start_date: tripObj.startDate,
          end_date: tripObj.endDate,
          languages: tripObj.languages,
          host: tripObj.host,
          host_avatar: tripObj.hostAvatar,
          host_bio: tripObj.hostBio,
          location: tripObj.location,
          quotas: tripObj.quotas,
          vehicle: tripObj.vehicle,
          description: tripObj.description,
          status: 'pending_approval'
        }]);

      if (error) console.error("Supabase insert error:", error);
    } catch (err) {
      console.warn("Supabase insert error fallback:", err);
    }
  }
}

// --- DYNAMIC DATE PICKER CONSTRAINTS ---
function setupDateInputs() {
  const startInput = document.getElementById("start-date-input");
  const endInput = document.getElementById("end-date-input");

  if (!startInput || !endInput) return;

  const todayStr = formatDateISO(new Date());
  startInput.min = todayStr;
  endInput.min = todayStr;

  startInput.addEventListener("change", () => {
    if (startInput.value) {
      endInput.min = startInput.value;
      if (endInput.value && endInput.value < startInput.value) {
        endInput.value = startInput.value;
      }
    }
    calculateDuration();
  });
}

function formatDateISO(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- ROLE-BASED AUTH & VISIBILITY CONTROL ---
function updateAuthUI() {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  if (storedToken && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      state.currentUser = {
        name: parsedUser.name || "Traveler",
        email: parsedUser.email || "",
        role: parsedUser.role || "user",
        isLoggedIn: true,
        status: parsedUser.status || "approved",
        avatar: parsedUser.avatar || null
      };
    } catch (e) {
      console.warn("Failed to parse stored user from localStorage:", e);
    }
  } else if (!state.currentUser || !state.currentUser.isLoggedIn) {
    state.currentUser = null;
  }

  const isAuth = Boolean(state.currentUser && state.currentUser.isLoggedIn);
  const isAdmin = isAuth && state.currentUser.role === "admin";

  const navAuthBtns = document.getElementById("nav-auth-buttons");
  const userAvatar = document.querySelector(".user-avatar-wrapper");
  const notifBell = document.getElementById("notif-bell");
  const adminElements = document.querySelectorAll(".admin-only");

  if (navAuthBtns) navAuthBtns.style.display = isAuth ? "none" : "flex";
  if (userAvatar) userAvatar.style.display = isAuth ? "flex" : "none";
  if (notifBell) notifBell.style.display = isAuth ? "flex" : "none";

  adminElements.forEach(el => {
    el.style.display = isAdmin ? "flex" : "none";
  });

  const roleLabel = document.getElementById("current-role-label");
  if (roleLabel) {
    roleLabel.innerText = isAdmin ? "Admin" : "User";
  }

  const dropName = document.getElementById("dropdown-user-name");
  if (dropName && state.currentUser) {
    dropName.innerText = state.currentUser.name;
  }

  renderUserProfile();
}

function toggleDemoRole(event) {
  if (event) event.preventDefault();
  if (!state.currentUser) return;

  state.currentUser.role = state.currentUser.role === "admin" ? "user" : "admin";
  alert(`Switched Demo Role to: ${state.currentUser.role.toUpperCase()}`);
  updateAuthUI();

  if (state.activeView === "admin" && state.currentUser.role !== "admin") {
    navigateTo("discover");
  }
}

// --- SPA VIEW ROUTER ---
async function navigateTo(viewId, event) {
  const evt = event || (typeof window !== "undefined" ? window.event : null);
  if (evt && typeof evt.preventDefault === "function") {
    evt.preventDefault();
  }

  if (viewId === "admin") {
    if (!state.currentUser || !state.currentUser.isLoggedIn || state.currentUser.role !== "admin") {
      alert("Access Denied: You must be logged in as an Administrator to access the Admin Portal.");
      return;
    }
    await fetchPendingTripsFromSupabase();
  }

  state.activeView = viewId;
  
  document.querySelectorAll(".view-section").forEach(sec => sec.classList.remove("active"));
  
  const targetSec = document.getElementById(`view-${viewId}`);
  if (targetSec) targetSec.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
  const activeNav = document.getElementById(`nav-${viewId}`);
  if (activeNav) activeNav.classList.add("active");

  if (viewId === "create") {
    const isAuth = Boolean(state.currentUser && state.currentUser.isLoggedIn && (localStorage.getItem("token") || state.currentUser.token));
    if (!isAuth) {
      showToast("Access Restricted: Please sign in or create an account to post content.", "warning");
      openGuestModal("create new trip posts or host travel experiences");
      showAuthModal("login");
      return;
    }
    setupDateInputs();
  } else if (viewId === "profile") {
    renderUserProfile();
  }

  closeNotifDrawer();
  closeUserDropdown();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- DISCOVER HUB & FILTERING ---
async function renderTripGrid() {
  const container = document.getElementById("trip-cards-container");
  if (!container) return;

  const publicTrips = state.trips.filter(t => t.status === "approved" || !t.status);

  const filtered = publicTrips.filter(trip => {
    const matchesCat = state.selectedCategory === "all" || trip.category.toLowerCase() === state.selectedCategory.toLowerCase();
    const query = state.searchQuery.toLowerCase();
    const matchesSearch = trip.title.toLowerCase().includes(query) || trip.location.toLowerCase().includes(query) || trip.category.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const countLabel = document.getElementById("trip-count-label");
  if (countLabel) countLabel.innerText = `Showing ${filtered.length} verified active trips`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: white; border-radius: 16px; border: 1px solid #e2e8f0;">
        <i class="fa-solid fa-compass" style="font-size: 2.5rem; color: #94a3b8; margin-bottom: 1rem;"></i>
        <h3>No matching verified trips found</h3>
        <p class="text-muted">Try clearing your search query or selecting another category.</p>
        <button class="btn btn-outline mt-3" onclick="selectCategory('all', document.querySelector('.filter-pill'))">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(trip => `
    <div class="trip-card">
      <div class="trip-card-image">
        <img src="${trip.cover}" alt="${trip.title}">
        <span class="badge-tag ${trip.badgeClass} badge-top-left"><i class="fa-solid fa-shield-check"></i> ${trip.badge}</span>
        <span class="price-top-right">${trip.price}</span>
      </div>
      <div class="trip-card-body">
        <h3 class="trip-card-title">${trip.title}</h3>
        <div class="trip-meta-list">
          <span><i class="fa-solid fa-tag"></i> ${trip.category}</span>
          <span><i class="fa-regular fa-clock"></i> ${trip.days} Days</span>
          <span><i class="fa-regular fa-calendar"></i> ${formatDateShort(trip.startDate)}</span>
          <span><i class="fa-solid fa-language"></i> ${trip.languages}</span>
        </div>
        <div class="trip-card-footer">
          <div class="host-mini">
            <img src="${trip.hostAvatar}" alt="${trip.host}">
            <span>${trip.host}</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="openTripDetails('${trip.id}')">View Details</button>
        </div>
      </div>
    </div>
  `).join("");
}

function formatDateShort(dateStr) {
  if (!dateStr) return "";
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const m = months[parseInt(parts[1], 10) - 1] || parts[1];
    return `${m} ${parts[2]}`;
  }
  return dateStr;
}

function selectCategory(category, el) {
  state.selectedCategory = category;
  document.querySelectorAll("#category-pills .filter-pill").forEach(pill => pill.classList.remove("active"));
  if (el) el.classList.add("active");
  renderTripGrid();
}

function filterTrips() {
  const input = document.getElementById("trip-search-input");
  state.searchQuery = input ? input.value : "";
  renderTripGrid();
}

// --- TRIP DETAILS VIEW POPULATOR ---
function openTripDetails(tripId) {
  const trip = state.trips.find(t => t.id === tripId) || state.trips[0];
  state.selectedTripId = trip.id;

  document.getElementById("det-img").src = trip.cover;
  document.getElementById("det-title").innerText = trip.title;
  document.getElementById("det-meta").innerHTML = `
    <span><i class="fa-regular fa-calendar-days"></i> ${formatDateShort(trip.startDate)} — ${formatDateShort(trip.endDate)}</span>
    <span><i class="fa-regular fa-clock"></i> ${trip.days} Days</span>
    <span><i class="fa-solid fa-location-dot"></i> ${trip.location}</span>
  `;
  const hostNameEl = document.getElementById("det-host-name");
  if (hostNameEl) hostNameEl.innerText = trip.host;
  const hostImgEl = document.getElementById("det-host-img");
  if (hostImgEl) hostImgEl.src = trip.hostAvatar;
  const hostBioEl = document.getElementById("det-host-bio");
  if (hostBioEl) hostBioEl.innerText = trip.hostBio;
  const descEl = document.getElementById("det-description");
  if (descEl) descEl.innerText = trip.description;
  const priceEl = document.getElementById("det-price");
  if (priceEl) priceEl.innerText = trip.price;
  const quotasEl = document.getElementById("det-quotas");
  if (quotasEl) quotasEl.innerText = trip.quotas;
  const vehicleEl = document.getElementById("det-vehicle");
  if (vehicleEl) vehicleEl.innerText = trip.vehicle;
  const langEl = document.getElementById("det-lang");
  if (langEl) langEl.innerText = trip.languages;

  const connectBtn = document.getElementById("details-connect-btn");
  if (connectBtn) {
    connectBtn.onclick = () => openChatModal(trip.id);
  }

  navigateTo("details");
}

function toggleAccordion(el) {
  const item = el.parentElement;
  item.classList.toggle("open");
}

// --- CREATE TRIP FLOW & DURATION CALCULATION ---
function calculateDuration() {
  const startVal = document.getElementById("start-date-input").value;
  const endVal = document.getElementById("end-date-input").value;

  if (startVal && endVal) {
    const start = new Date(startVal);
    const end = new Date(endVal);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const badgeEl = document.getElementById("duration-badge");
    if (badgeEl) {
      badgeEl.innerHTML = `<i class="fa-regular fa-clock"></i> Auto-calculated Duration: <strong>${diffDays > 0 ? diffDays : 1} Days</strong>`;
    }
  }
}

function triggerFileInput() {
  const input = document.getElementById("cover-image-input");
  if (input) input.click();
}

function handleImagePreview(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const container = document.getElementById("image-preview-container");
      const img = document.getElementById("image-preview");
      if (img) img.src = evt.target.result;
      if (container) container.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

function renderDestinationsRouteList() {
  const container = document.getElementById("destinations-route-container");
  if (!container) return;

  if (!state.createTripDestinations || state.createTripDestinations.length === 0) {
    container.innerHTML = `
      <div style="padding: 1rem; text-align: center; border: 1px dashed var(--border-color); border-radius: var(--radius-md); background: #fafafa; color: var(--text-muted); font-size: 0.85rem;">
        <i class="fa-solid fa-route" style="font-size: 1.2rem; color: var(--color-cyan); margin-bottom: 0.35rem; display: block;"></i>
        No destinations added yet. Enter a location above and click "Add Stop" to build your route.
      </div>
    `;
    return;
  }

  container.innerHTML = state.createTripDestinations.map((loc, idx) => {
    const isMain = idx === 0;
    const badgeText = isMain
      ? '<i class="fa-solid fa-flag-checkered"></i> Start / Main Destination'
      : `<i class="fa-solid fa-location-pin"></i> Stop ${idx}`;
    const itemClass = isMain ? "route-item main-destination" : "route-item sub-destination";
    const badgeClass = isMain ? "route-step-badge start-badge" : "route-step-badge stop-badge";

    return `
      <div class="${itemClass}">
        <div class="route-item-content">
          <span class="${badgeClass}">${badgeText}</span>
          <span class="route-location-name">${loc}</span>
        </div>
        <button type="button" class="btn-remove-stop" onclick="removeDestination(${idx})" title="Remove ${loc}">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
  }).join("");
}

function addDestinationTag() {
  const input = document.getElementById("destinations-input");
  if (!input) return;
  const val = input.value.trim();
  if (val) {
    if (!state.createTripDestinations) state.createTripDestinations = [];
    state.createTripDestinations.push(val);
    input.value = "";
    renderDestinationsRouteList();
  }
}

function removeDestination(index) {
  if (!state.createTripDestinations) return;
  state.createTripDestinations.splice(index, 1);
  renderDestinationsRouteList();
}

function saveTripAsDraft() {
  const titleInput = document.getElementById("trip-title-input");
  const title = titleInput ? (titleInput.value || "Untitled Draft Trip") : "Untitled Draft Trip";
  state.drafts.unshift({ title: title, date: "Just saved" });

  const draftsContainer = document.getElementById("drafts-list-container");
  if (draftsContainer) {
    draftsContainer.innerHTML = `
      <div class="my-trip-info">
        <h4>${title}</h4>
        <span class="text-muted">Saved as draft just now</span>
      </div>
      <button class="btn btn-outline btn-sm" onclick="navigateTo('create')"><i class="fa-solid fa-pen-to-square"></i> Edit Draft</button>
    `;
  }

  alert(`Draft "${title}" saved locally under your profile.`);
  navigateTo("profile");
}

function handlePostTrip(e) {
  if (e) e.preventDefault();
  const isAuth = Boolean(state.currentUser && state.currentUser.isLoggedIn && (localStorage.getItem("token") || state.currentUser.token));
  if (!isAuth) {
    showToast("Access Restricted: Please sign in to publish trip posts.", "warning");
    openGuestModal("create new trip posts or host travel experiences");
    showAuthModal("login");
    return;
  }
  openPaymentModal();
}

// --- PAYMENT MODAL & POSTING FLOW WITH SUPABASE INSERT ---
function openPaymentModal() {
  const modal = document.getElementById("payment-modal");
  if (modal) modal.classList.add("open");
}

function closePaymentModal() {
  const modal = document.getElementById("payment-modal");
  if (modal) modal.classList.remove("open");
}

async function processPayment(e) {
  if (e) e.preventDefault();
  const submitBtn = document.getElementById("pay-submit-btn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Secure Payment...`;
  }

  setTimeout(async () => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Pay LKR 100.00 &rarr;`;
    }
    closePaymentModal();

    const titleEl = document.getElementById("trip-title-input");
    const newTitle = titleEl ? titleEl.value : "New Expedition";

    if (newTitle) {
      const startEl = document.getElementById("start-date-input");
      const endEl = document.getElementById("end-date-input");
      const catEl = document.getElementById("category-select");
      const costEl = document.getElementById("cost-input");
      const previewEl = document.getElementById("image-preview");
      const maleQuotaEl = document.getElementById("male-quota-input");
      const femaleQuotaEl = document.getElementById("female-quota-input");
      const vehicleEl = document.getElementById("vehicle-input");
      const descEl = document.getElementById("description-input");

      const startVal = startEl && startEl.value ? startEl.value : "2026-09-15";
      const endVal = endEl && endEl.value ? endEl.value : "2026-09-20";

      const newTripObj = {
        id: `WB-${Math.floor(100 + Math.random() * 900)}`,
        title: newTitle,
        category: catEl ? catEl.value : "Adventure",
        cover: (previewEl && previewEl.src) ? previewEl.src : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        price: `LKR ${Number(costEl && costEl.value ? costEl.value : 50000).toLocaleString()}`,
        priceRaw: Number(costEl && costEl.value ? costEl.value : 50000),
        badge: "PENDING VERIFICATION",
        badgeClass: "warning-tag",
        days: 5,
        startDate: startVal,
        endDate: endVal,
        languages: "English, Sinhala",
        host: state.currentUser ? state.currentUser.name : "Alex Thorne",
        hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        hostBio: "Verified Traveler & Host",
        location: (state.createTripDestinations && state.createTripDestinations.length > 0) ? state.createTripDestinations.join(" → ") : "Sri Lanka",
        quotas: `${maleQuotaEl && maleQuotaEl.value ? maleQuotaEl.value : 2} Males, ${femaleQuotaEl && femaleQuotaEl.value ? femaleQuotaEl.value : 2} Females`,
        vehicle: vehicleEl && vehicleEl.value ? vehicleEl.value : "SUV",
        description: descEl && descEl.value ? descEl.value : "Great trip planned.",
        status: "pending_approval"
      };

      state.trips.unshift(newTripObj);
      
      await insertTripToSupabase(newTripObj);

      renderTripGrid();
      renderAdminTables();
      const form = document.getElementById("create-trip-form");
      if (form) form.reset();
      state.createTripDestinations = [];
      renderDestinationsRouteList();
      
      alert(`Payment Successful! Your trip "${newTitle}" has been submitted with status 'pending_approval'.\n\nIt will render on the live public feed as soon as an Administrator approves it.`);
      navigateTo("discover");
    }
  }, 1200);
}

// --- TRIP GROUP CHAT & PRIVACY SYSTEM ---
function openChatModal(tripId) {
  const targetId = tripId || state.selectedTripId || "WB-101";
  state.selectedTripId = targetId;

  const trip = state.trips.find(t => t.id === targetId) || state.trips[0];
  
  const chatTitleEl = document.getElementById("chat-modal-trip-title");
  const chatSubEl = document.getElementById("chat-modal-trip-sub");
  const chatImgEl = document.getElementById("chat-modal-trip-img");

  if (chatTitleEl) chatTitleEl.innerText = trip.title;
  if (chatSubEl) chatSubEl.innerText = `Location: ${trip.location} • Host: ${trip.host}`;
  if (chatImgEl) chatImgEl.src = trip.cover;

  if (!state.chats[trip.id]) {
    state.chats[trip.id] = [
      {
        sender: `${trip.host} (Host)`,
        avatar: trip.hostAvatar,
        text: `Welcome everyone to ${trip.title}! Use this dedicated group chat to align on logistics and trip details.`,
        time: "Just now",
        isHost: true
      }
    ];
  }

  const isExpired = checkTripExpired(trip.endDate);
  const inputBar = document.getElementById("chat-input-form");
  const expiredBanner = document.getElementById("chat-expired-notice");

  if (isExpired) {
    if (expiredBanner) {
      expiredBanner.style.display = "block";
      expiredBanner.innerHTML = `<i class="fa-solid fa-lock text-danger"></i> <strong>Trip Concluded (${formatDateShort(trip.endDate)})</strong> — This chat room is now in <strong>Read-Only Mode</strong>. No new messages can be posted.`;
    }
    if (inputBar) {
      inputBar.style.display = "none";
    }
  } else {
    if (expiredBanner) {
      expiredBanner.style.display = "none";
    }
    if (inputBar) {
      inputBar.style.display = "flex";
    }
  }

  renderChatMessages(trip.id);
  const modal = document.getElementById("chat-modal");
  if (modal) modal.classList.add("open");
}

function checkTripExpired(endDateStr) {
  if (!endDateStr) return false;
  const today = new Date();
  let endDate;

  if (endDateStr.includes("-")) {
    endDate = new Date(endDateStr);
  } else {
    endDate = new Date(endDateStr + ", 2026");
  }

  return endDate < today;
}

function renderChatMessages(tripId) {
  const container = document.getElementById("chat-messages");
  if (!container) return;

  const msgs = state.chats[tripId] || [];
  container.innerHTML = msgs.map(m => `
    <div class="chat-msg ${m.isHost ? "host-msg" : (m.sender.includes("You") ? "user-msg" : "companion-msg")}">
      ${!m.sender.includes("You") ? `<img src="${m.avatar}" class="chat-avatar" alt="${m.sender}">` : ""}
      <div class="msg-bubble">
        <div class="msg-meta">${m.sender} • ${m.time}</div>
        <p>${m.text}</p>
      </div>
    </div>
  `).join("");

  container.scrollTop = container.scrollHeight;
}

function sanitizeChatMessage(text) {
  let masked = text;
  let detected = false;

  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b|\b0\d{9}\b/g;
  if (phoneRegex.test(masked)) {
    masked = masked.replace(phoneRegex, "[BLOCKED: PHONE NUMBER]");
    detected = true;
  }

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  if (emailRegex.test(masked)) {
    masked = masked.replace(emailRegex, "[BLOCKED: EMAIL ADDRESS]");
    detected = true;
  }

  const urlRegex = /\b(?:https?:\/\/|www\.)[^\s]+\b|\b[a-zA-Z0-9-]+\.(?:com|org|net|io|lk|co|info)\b/gi;
  if (urlRegex.test(masked)) {
    masked = masked.replace(urlRegex, "[BLOCKED: EXTERNAL LINK]");
    detected = true;
  }

  const socialRegex = /@[\w_]+|\b(?:whatsapp|telegram|viber|instagram|facebook|wa\.me|ig)\b/gi;
  if (socialRegex.test(masked)) {
    masked = masked.replace(socialRegex, "[BLOCKED: SOCIAL HANDLE]");
    detected = true;
  }

  return { cleanText: masked, wasMasked: detected };
}

function sendChatMessage(e) {
  if (e) e.preventDefault();
  const input = document.getElementById("chat-text-input");
  if (!input) return;
  const rawMsg = input.value.trim();

  if (!rawMsg) return;

  const tripId = state.selectedTripId || "WB-101";

  const trip = state.trips.find(t => t.id === tripId);
  if (trip && checkTripExpired(trip.endDate)) {
    alert("Chat is in Read-Only mode because this trip has ended.");
    return;
  }

  const { cleanText, wasMasked } = sanitizeChatMessage(rawMsg);

  if (wasMasked) {
    const noticeEl = document.getElementById("chat-pfi-warning");
    if (noticeEl) {
      noticeEl.style.display = "block";
      setTimeout(() => { noticeEl.style.display = "none"; }, 4000);
    }
  }

  const newMsg = {
    sender: "You (Alex)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    text: cleanText,
    time: "Just now",
    isHost: false
  };

  if (!state.chats[tripId]) state.chats[tripId] = [];
  state.chats[tripId].push(newMsg);
  renderChatMessages(tripId);
  input.value = "";

  setTimeout(() => {
    if (trip) {
      const hostReply = {
        sender: `${trip.host} (Host)`,
        avatar: trip.hostAvatar,
        text: "Thanks for checking in! Looking forward to having you on the trip.",
        time: "Just now",
        isHost: true
      };
      state.chats[tripId].push(hostReply);
      renderChatMessages(tripId);
    }
  }, 1200);
}

function closeChatModal() {
  const modal = document.getElementById("chat-modal");
  if (modal) modal.classList.remove("open");
}

// --- SERVICE PROVIDERS DIRECTORY ---
function renderServicesGrid(filterType = "all") {
  const container = document.getElementById("services-grid-container");
  if (!container) return;

  const filtered = serviceProviders.filter(p => filterType === "all" || p.type === filterType);

  container.innerHTML = filtered.map(p => `
    <div class="service-provider-card">
      <div class="provider-header">
        <img src="${p.avatar}" class="provider-avatar" alt="${p.name}">
        <div>
          <h3>${p.name}</h3>
          <span class="badge-tag ${p.badgeClass} mb-1"><i class="fa-solid fa-circle-check"></i> ${p.status} ${p.type}</span>
          <p class="provider-meta"><i class="fa-solid fa-location-dot"></i> ${p.location}</p>
        </div>
      </div>
      <p class="small text-muted">${p.description}</p>
      <div class="flex-between mt-auto border-top pt-3">
        <span class="color-gold small"><strong><i class="fa-solid fa-star"></i> ${p.rating}</strong> (${p.reviews} reviews)</span>
        <button class="btn btn-outline btn-sm" onclick="alert('Inquiry sent to ${p.name} (${p.contact})')"><i class="fa-solid fa-envelope"></i> Inquire / Book</button>
      </div>
    </div>
  `).join("");
}

function filterServices(type, el) {
  document.querySelectorAll("#view-services .filter-pill").forEach(p => p.classList.remove("active"));
  if (el) el.classList.add("active");
  renderServicesGrid(type);
}

// --- USER PROFILE & KYC SUBMISSION ---
function toggleVerificationForm() {
  const form = document.getElementById("verification-form");
  if (form) form.style.display = form.style.display === "none" ? "block" : "none";
}

function handleKYCSubmit(e) {
  if (e) e.preventDefault();
  const nicEl = document.getElementById("kyc-nic");
  const nic = nicEl ? nicEl.value : "";

  const badge = document.getElementById("profile-status-badge");
  if (badge) {
    badge.className = "badge-tag verified-tag";
    badge.innerHTML = `<i class="fa-solid fa-shield-check"></i> Verified Traveler (KYC Approved)`;
  }

  alert(`Verification Details (NIC: ${nic}) submitted for admin review.`);
  toggleVerificationForm();
}

function handlePasswordUpdate(e) {
  if (e) e.preventDefault();
  alert("Security Credentials Updated Successfully!");
}

// --- ADMIN CONSOLE DATA TABLES & APPROVAL WORKFLOWS ---
async function renderAdminTables() {
  await fetchPendingTripsFromSupabase();
  renderAdminTripsTable();
  renderAdminUsersTable();
}

function renderAdminTripsTable(queryFilter = "") {
  const tbody = document.getElementById("admin-trips-tbody");
  if (!tbody) return;

  const filteredTrips = state.trips.filter(t => {
    if (!queryFilter) return true;
    return t.title.toLowerCase().includes(queryFilter) || t.host.toLowerCase().includes(queryFilter) || t.id.toLowerCase().includes(queryFilter);
  });

  tbody.innerHTML = filteredTrips.map(trip => `
    <tr>
      <td><strong>#${trip.id}</strong></td>
      <td>${trip.host}</td>
      <td>${trip.title}</td>
      <td><span class="badge-tag">${trip.quotas}</span></td>
      <td>${trip.price}</td>
      <td>
        ${trip.status === "pending_approval" ? `
          <button class="btn btn-success btn-sm" onclick="approveTrip('${trip.id}')"><i class="fa-solid fa-check"></i> Approve</button>
          <button class="btn btn-danger btn-sm ml-1" onclick="rejectTrip('${trip.id}')"><i class="fa-solid fa-xmark"></i> Reject</button>
        ` : `
          <span class="badge-tag success-tag"><i class="fa-solid fa-check"></i> Approved</span>
        `}
      </td>
    </tr>
  `).join("");

  const pendingCountEl = document.getElementById("admin-pending-trips-count");
  if (pendingCountEl) {
    const pendingCount = state.trips.filter(t => t.status === "pending_approval").length;
    pendingCountEl.innerText = `Pending: ${pendingCount}`;
  }
}

async function approveTrip(tripId) {
  const trip = state.trips.find(t => t.id === tripId);
  if (trip) {
    trip.status = "approved";
    trip.badge = "VERIFIED HOST";
    trip.badgeClass = "verified-tag";

    if (supabaseClient && SUPABASE_URL !== 'https://afwixacnnmvrvfsnvdxu.supabase.co') {
      try {
        await supabaseClient
          .from('trips')
          .update({
            status: 'approved',
            badge: 'VERIFIED HOST',
            badge_class: 'verified-tag'
          })
          .eq('id', tripId);
      } catch (err) {
        console.warn("Supabase update fallback:", err);
      }
    }

    renderAdminTables();
    renderTripGrid();
    alert(`Trip "${trip.title}" (${trip.id}) has been APPROVED and is now live on the public Discover feed!`);
  }
}

async function rejectTrip(tripId) {
  if (confirm("Are you sure you want to reject this trip submission?")) {
    state.trips = state.trips.filter(t => t.id !== tripId);

    if (supabaseClient && SUPABASE_URL !== 'https://afwixacnnmvrvfsnvdxu.supabase.co') {
      try {
        await supabaseClient
          .from('trips')
          .delete()
          .eq('id', tripId);
      } catch (err) {
        console.warn("Supabase delete fallback:", err);
      }
    }

    renderAdminTables();
    renderTripGrid();
    alert(`Trip #${tripId} submission rejected and removed.`);
  }
}

function renderAdminUsersTable() {
  const tbody = document.getElementById("admin-users-tbody");
  if (!tbody) return;

  const allUsers = [
    { name: "David Thompson", dob: "05 May 1975", phone: "+44 7700 900123", status: "pending_approval" },
    { name: "Jessica Lee", dob: "18 Aug 1992", phone: "+1 202 555 0128", status: "pending_approval" },
    { name: "Anura Kumara", dob: "12 Jan 1988", phone: "+94 77 123 4567", status: "approved" },
    { name: "Alex Thorne", dob: "15 Aug 1995", phone: "+94 77 123 4567", status: "approved" }
  ];

  tbody.innerHTML = allUsers.map((u) => `
    <tr>
      <td><strong>${u.name}</strong></td>
      <td>${u.dob}</td>
      <td>${u.phone}</td>
      <td>
        ${u.status === "pending_approval" ? `
          <span class="badge-tag warning-tag"><i class="fa-solid fa-clock"></i> Pending Review</span>
        ` : `
          <span class="badge-tag success-tag"><i class="fa-solid fa-check"></i> Approved</span>
        `}
      </td>
      <td>
        ${u.status === "pending_approval" ? `
          <button class="btn btn-success btn-sm" onclick="approveUserAccount('${u.name}')"><i class="fa-solid fa-user-check"></i> Approve</button>
        ` : `
          <button class="btn btn-danger-outline btn-sm" onclick="disconnectUser(this)">Disconnect</button>
        `}
      </td>
    </tr>
  `).join("");
}

function approveUserAccount(name) {
  alert(`User Account for "${name}" has been APPROVED. User can now post trips and connect.`);
  renderAdminUsersTable();
}

function switchAdminTab(tabName, event) {
  if (event) event.preventDefault();
  document.querySelectorAll(".admin-nav-item").forEach(item => item.classList.remove("active"));
  const navItem = document.getElementById(`adm-nav-${tabName}`);
  if (navItem) navItem.classList.add("active");

  document.querySelectorAll(".admin-page-content").forEach(page => page.classList.remove("active"));
  const pageContent = document.getElementById(`adm-page-${tabName}`);
  if (pageContent) pageContent.classList.add("active");
}

function filterAdminUsers(status, el) {
  document.querySelectorAll(".adm-tab").forEach(t => t.classList.remove("active"));
  if (el) el.classList.add("active");
}

function disconnectUser(btn) {
  if (confirm("Are you sure you want to disconnect and suspend this user account?")) {
    const row = btn.closest("tr");
    if (row) row.style.opacity = "0.4";
    btn.disabled = true;
    btn.innerText = "Disconnected";
  }
}

// --- MANAGE ADMINS FEATURE ---
function renderAdminList() {
  const container = document.getElementById("admin-list-container");
  if (!container) return;

  container.innerHTML = state.adminUsers.map(adm => `
    <div class="admin-user-card flex-between p-3 border-bottom">
      <div class="flex-align gap-3">
        <div class="icon-circle cyan"><i class="fa-solid fa-user-shield"></i></div>
        <div>
          <strong>${adm.name}</strong> <span class="badge-tag confirmed-tag micro">${adm.role}</span>
          <p class="micro text-muted mb-0">${adm.email} • Designated on ${adm.addedDate}</p>
        </div>
      </div>
      ${adm.role !== "Primary Admin" ? `
        <button class="btn btn-danger-outline btn-sm" onclick="revokeAdminPrivileges('${adm.email}')">Revoke Admin</button>
      ` : `<span class="badge-tag verified-tag micro">Owner</span>`}
    </div>
  `).join("");
}

function handleAddAdminSubmit(e) {
  if (e) e.preventDefault();
  const nameEl = document.getElementById("new-admin-name");
  const emailEl = document.getElementById("new-admin-email");

  const name = nameEl ? nameEl.value.trim() : "";
  const email = emailEl ? emailEl.value.trim() : "";

  if (!name || !email) return;

  if (state.adminUsers.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    alert("This email is already designated as an Administrator.");
    return;
  }

  const todayStr = formatDateISO(new Date());
  state.adminUsers.push({
    id: `ADM-${Math.floor(100 + Math.random() * 900)}`,
    name: name,
    email: email,
    role: "Designated Admin",
    addedDate: todayStr
  });

  renderAdminList();
  const form = document.getElementById("add-admin-form");
  if (form) form.reset();
  alert(`Administrator privileges granted to ${name} (${email}).`);
}

function revokeAdminPrivileges(email) {
  if (confirm(`Revoke admin privileges for ${email}?`)) {
    state.adminUsers = state.adminUsers.filter(a => a.email.toLowerCase() !== email.toLowerCase());
    renderAdminList();
    alert(`Admin privileges revoked for ${email}.`);
  }
}

// --- NOTIFICATION & PROFILE DRAWER TOGGLES ---
function toggleNotifDrawer(event) {
  if (event) event.stopPropagation();
  const d = document.getElementById("notif-drawer");
  if (d) d.classList.toggle("open");
}

function closeNotifDrawer() {
  const d = document.getElementById("notif-drawer");
  if (d) d.classList.remove("open");
}

function clearNotifs() {
  document.querySelectorAll(".notif-item").forEach(item => item.classList.remove("unread"));
  const badge = document.querySelector(".notif-badge");
  if (badge) badge.style.display = "none";
}

function toggleUserDropdown(event) {
  if (event) event.stopPropagation();
  const d = document.getElementById("user-dropdown");
  if (d) d.classList.toggle("open");
}

function closeUserDropdown() {
  const d = document.getElementById("user-dropdown");
  if (d) d.classList.remove("open");
}

// --- AUTH MODALS & LOGIN AS ADMIN ---
function showAuthModal(tab = "login", event) {
  const evt = event || (typeof window !== "undefined" ? window.event : null);
  if (evt && typeof evt.preventDefault === "function") {
    evt.preventDefault();
  }
  switchAuthTab(tab);
  const modal = document.getElementById("auth-modal");
  if (modal) modal.classList.add("open");
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) modal.classList.remove("open");
}

function switchAuthTab(tab) {
  const loginView = document.getElementById("auth-login-view");
  const regView = document.getElementById("auth-register-view");

  if (tab === "login") {
    if (loginView) loginView.style.display = "block";
    if (regView) regView.style.display = "none";
  } else {
    if (loginView) loginView.style.display = "none";
    if (regView) regView.style.display = "block";
  }
}

async function handleLoginSubmit(e) {
  if (e) e.preventDefault();

  const roleSelect = document.getElementById("login-role-select");
  const emailInput = document.getElementById("login-email-input");
  const passwordInput = document.getElementById("login-password-input");

  const selectedRole = roleSelect ? roleSelect.value : "user";
  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";

  if (!email || !password) {
    showToast("Please enter both email and password.", "warning");
    return;
  }

  // Admin bypass mode or API login
  if (selectedRole === "admin" || email.includes("admin")) {
    closeAuthModal();
    state.currentUser = {
      name: "Primary System Admin",
      email: email || "admin@tripbuddy.com",
      role: "admin",
      isLoggedIn: true
    };
    alert("Authenticated as Administrator! Admin Portal unlocked.");
    updateAuthUI();
    navigateTo("admin");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      closeAuthModal();
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

      state.currentUser = {
        name: data.user ? data.user.name : "Traveler",
        email: data.user ? data.user.email : email,
        role: "user",
        isLoggedIn: true
      };

      showToast("Login successful!", "success");
      updateAuthUI();
      navigateTo("discover");
    } else {
      showToast(data.error || "Invalid email or password.", "danger");
    }
  } catch (err) {
    console.warn("Backend server offline, operating in demo mode:", err);
    closeAuthModal();
    state.currentUser = {
      name: "Alex Thorne",
      email: email || "alex.thorne@example.com",
      role: "user",
      isLoggedIn: true
    };
    showToast("Logged in successfully (Demo mode).", "info");
    updateAuthUI();
    navigateTo("discover");
  }
}

async function handleRegisterSubmit(e) {
  if (e) e.preventDefault();

  const nameInput = document.getElementById("reg-name-input");
  const emailInput = document.getElementById("reg-email-input");
  const passwordInput = document.getElementById("reg-password-input");

  const name = nameInput ? nameInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";

  if (!name || !email || !password) {
    showToast("Please complete all registration fields.", "warning");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      closeAuthModal();
      showToast("Registration successful! Please log in.", "success");
      showAuthModal("login");
    } else {
      showToast(data.error || "Registration failed.", "danger");
    }
  } catch (err) {
    console.warn("Backend server offline, operating in demo mode:", err);
    closeAuthModal();
    state.pendingUsers.push({
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name || "New User",
      email: email || "user@example.com",
      dob: "2000-01-01",
      phone: "+94 77 000 0000",
      role: "Traveler",
      status: "pending_approval",
      registerDate: formatDateISO(new Date())
    });

    renderAdminTables();
    alert("Registration Successful!\n\nYour account has been submitted for Admin Review.");
  }
}

function openForgotPasswordModal(event) {
  if (event) event.preventDefault();
  closeAuthModal();
  const modal = document.getElementById("forgot-password-modal");
  if (modal) modal.classList.add("open");
}

function closeForgotPasswordModal() {
  const modal = document.getElementById("forgot-password-modal");
  if (modal) modal.classList.remove("open");
}

function openResetPasswordModal(token) {
  closeAuthModal();
  closeForgotPasswordModal();
  const tokenInput = document.getElementById("reset-token-input");
  if (tokenInput) tokenInput.value = token || "";
  const modal = document.getElementById("reset-password-modal");
  if (modal) modal.classList.add("open");
}

function closeResetPasswordModal() {
  const modal = document.getElementById("reset-password-modal");
  if (modal) modal.classList.remove("open");
}

async function handleForgotPasswordSubmit(e) {
  if (e) e.preventDefault();

  const emailInput = document.getElementById("forgot-email-input");
  const email = emailInput ? emailInput.value.trim() : "";

  if (!email) {
    showToast("Please enter a valid email address.", "warning");
    return;
  }

  const submitBtn = document.getElementById("btn-send-reset-link");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Dispatching Reset Link...`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    closeForgotPasswordModal();

    if (response.ok) {
      showToast(data.message || "Password reset link sent to your email.", "success");
      alert(data.message || "Password reset link sent to your email.");
    } else {
      showToast(data.error || "Failed to process password reset request.", "danger");
    }
  } catch (err) {
    console.warn("Backend server offline, fallback notice:", err);
    closeForgotPasswordModal();
    alert(`Password reset request received for ${email}. (Demo mode fallback message)`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Send Reset Link`;
    }
  }
}

async function handleResetPasswordSubmit(e) {
  if (e) e.preventDefault();

  const tokenInput = document.getElementById("reset-token-input");
  const newPassInput = document.getElementById("reset-new-password-input");
  const confirmPassInput = document.getElementById("reset-confirm-password-input");

  const token = tokenInput ? tokenInput.value : "";
  const newPassword = newPassInput ? newPassInput.value : "";
  const confirmPassword = confirmPassInput ? confirmPassInput.value : "";

  if (!newPassword || !confirmPassword) {
    showToast("Please complete both password fields.", "warning");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("Passwords do not match.", "warning");
    return;
  }

  const submitBtn = document.getElementById("btn-save-new-password");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Updating Password...`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });

    const data = await response.json();
    if (response.ok) {
      closeResetPasswordModal();
      showToast(data.message || "Password updated successfully!", "success");
      alert(data.message || "Password updated successfully!");
      showAuthModal("login");
    } else {
      showToast(data.error || "Failed to reset password.", "danger");
    }
  } catch (err) {
    console.error("Reset password error:", err);
    showToast("Server error during password reset.", "danger");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-key"></i> Update Password & Sign In`;
    }
  }
}

// --- ADDITIONAL UTILITIES & MISSING EVENT HANDLERS ---

function dismissAnnouncementBanner() {
  const banner = document.getElementById("site-announcement-banner");
  if (banner) banner.style.display = "none";
}

function clearAllNotifications() {
  clearNotifs();
}

function openNotificationPrefsModal() {
  const modal = document.getElementById("notif-prefs-modal");
  if (modal) modal.classList.add("open");
}

function closeNotificationPrefsModal() {
  const modal = document.getElementById("notif-prefs-modal");
  if (modal) modal.classList.remove("open");
}

function saveNotificationPrefs(event) {
  if (event) event.preventDefault();
  closeNotificationPrefsModal();
  showToast("Notification preferences saved successfully.", "success");
}

function confirmLogout(event) {
  if (event) event.preventDefault();
  state.currentUser = null;
  localStorage.clear();
  updateAuthUI();
  navigateTo("discover");
  showToast("You have been signed out.", "info");
}

function closeEditTripModal() {
  const modal = document.getElementById("edit-trip-modal");
  if (modal) modal.classList.remove("open");
}

function handleSaveTripEdit(event) {
  if (event) event.preventDefault();
  const tripId = document.getElementById("edit-trip-id").value;
  const title = document.getElementById("edit-trip-title").value;
  const category = document.getElementById("edit-trip-category").value;
  const price = document.getElementById("edit-trip-price").value;
  const location = document.getElementById("edit-trip-location").value;
  const quotas = document.getElementById("edit-trip-quotas").value;
  const vehicle = document.getElementById("edit-trip-vehicle").value;
  const description = document.getElementById("edit-trip-description").value;

  const trip = state.trips.find(t => t.id === tripId);
  if (trip) {
    trip.title = title;
    trip.category = category;
    trip.price = price;
    trip.location = location;
    trip.quotas = quotas;
    trip.vehicle = vehicle;
    trip.description = description;
  }
  closeEditTripModal();
  renderTripGrid();
  renderAdminTables();
  showToast("Trip details updated successfully.", "success");
}

function closeGuestModal() {
  const modal = document.getElementById("guest-modal");
  if (modal) modal.classList.remove("open");
}

function handleAdminGlobalSearch() {
  const input = document.querySelector(".admin-search-input");
  if (!input) return;
  const query = input.value.toLowerCase();
  renderAdminTripsTable(query);
}

function renderUserProfile() {
  if (!state.currentUser) return;

  const nameLabel = document.getElementById("profile-name-label");
  if (nameLabel) nameLabel.innerText = state.currentUser.name;

  const nameInput = document.getElementById("profile-name-input");
  if (nameInput) nameInput.value = state.currentUser.name;

  const bioLabel = document.getElementById("profile-bio-label");
  const defaultBio = state.currentUser.bio || "Passionate adventurer, backpacker & yoga enthusiast. Hosted 14+ trips across Asia & Europe.";
  if (bioLabel) bioLabel.innerText = defaultBio;

  const bioInput = document.getElementById("profile-bio-input");
  if (bioInput) bioInput.value = defaultBio;

  const statusBadge = document.getElementById("profile-status-badge");
  if (statusBadge) statusBadge.style.display = "inline-flex";

  const mainImg = document.getElementById("profile-main-img");
  if (mainImg && state.currentUser.avatar) {
    mainImg.src = state.currentUser.avatar;
  }
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      if (state.currentUser) state.currentUser.avatar = dataUrl;

      const headerImg = document.getElementById("header-avatar-img");
      if (headerImg) headerImg.src = dataUrl;

      const profImg = document.getElementById("profile-main-img");
      if (profImg) profImg.src = dataUrl;

      showToast("Avatar image updated successfully.", "success");
    };
    reader.readAsDataURL(file);
  }
}

function toggleNameEdit() {
  const form = document.getElementById("profile-name-edit-form");
  if (form) {
    const isHidden = form.style.display === "none" || !form.style.display;
    form.style.display = isHidden ? "block" : "none";
  }
}

function saveNameEdit() {
  const input = document.getElementById("profile-name-input");
  if (input && input.value.trim()) {
    const newName = input.value.trim();
    if (state.currentUser) state.currentUser.name = newName;

    renderUserProfile();
    updateAuthUI();
    toggleNameEdit();
    showToast("Display name updated successfully.", "success");
  }
}

function toggleBioEdit() {
  const form = document.getElementById("profile-bio-edit-form");
  if (form) {
    const isHidden = form.style.display === "none" || !form.style.display;
    form.style.display = isHidden ? "block" : "none";
  }
}

function saveBioEdit() {
  const input = document.getElementById("profile-bio-input");
  if (input && input.value.trim()) {
    const newBio = input.value.trim();
    if (state.currentUser) state.currentUser.bio = newBio;

    renderUserProfile();
    toggleBioEdit();
    showToast("Bio updated successfully.", "success");
  }
}

function handleSaveSiteSettings(event) {
  if (event) event.preventDefault();
  showToast("Site settings saved successfully.", "success");
}

function handlePostComment(event) {
  if (event) event.preventDefault();
  const input = document.getElementById("comment-input-text");
  if (!input || !input.value.trim()) return;
  const commentText = input.value.trim();
  const commentsContainer = document.getElementById("trip-comments-list");
  if (commentsContainer) {
    const commentEl = document.createElement("div");
    commentEl.className = "comment-item mb-3 p-3 bg-light rounded";
    commentEl.innerHTML = `
      <strong>${state.currentUser ? state.currentUser.name : "Alex Thorne"}</strong>
      <p class="mb-0 text-dark">${commentText}</p>
      <small class="text-muted">Just now</small>
    `;
    commentsContainer.appendChild(commentEl);
  }
  input.value = "";
  showToast("Comment posted.", "success");
}

function toggleBookmark(tripId, event) {
  if (event) event.preventDefault();
  showToast("Trip bookmarked to your saved trips.", "info");
}

function filterAdminUserTab(status, el) {
  filterAdminUsers(status, el);
}

function renderPendingApprovalsTable() {
  const input = document.querySelector(".admin-search-input");
  const query = input ? input.value.toLowerCase() : "";
  renderAdminTripsTable(query);
}

function updateUploadStatus(type) {
  showToast(`KYC Document (${type}) uploaded successfully.`, "info");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type} show`;
  toast.style.cssText = "padding: 12px 20px; margin-bottom: 8px; border-radius: 8px; background: #1e293b; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 0.9rem;";
  toast.innerHTML = `<i class="fa-solid fa-info-circle" style="margin-right: 8px;"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}