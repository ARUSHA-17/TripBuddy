/* -------------------------------------------------------------------------- */
/* TRIPBUDDY - MASTER JAVASCRIPT ENGINE                                       */
/* Interactivity, SPA View Routing, Data State, Filters, Modals & Admin Logic */
/* -------------------------------------------------------------------------- */

// --- INITIAL DATA STORE & SUPABASE DATABASE CONFIGURATION ---

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
  drafts: [
    { title: "Untitled Trip to Iceland", date: "Last edited 2 days ago" }
  ],
  currentUser: {
    name: "Alex Thorne",
    email: "alex.thorne@example.com",
    role: "user", // "user" by default for normal travelers, "admin" for administrators
    isLoggedIn: true,
    status: "approved"
  },
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
  updateAuthUI();
  setupNavigationEventListeners();
  await fetchApprovedTripsFromSupabase();
  renderTripGrid();
  renderServicesGrid();
  renderAdminTables();
  renderAdminList();
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

// 1. Fetch only approved trips from Supabase for public discover rendering
async function fetchApprovedTripsFromSupabase() {
  if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
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
          priceRaw: t.price_raw || t.priceRaw,
          badge: t.badge || "VERIFIED HOST",
          badgeClass: t.badge_class || t.badgeClass || "verified-tag",
          days: t.days,
          startDate: t.start_date || t.startDate,
          endDate: t.end_date || t.endDate,
          languages: t.languages,
          host: t.host,
          hostAvatar: t.host_avatar || t.hostAvatar,
          hostBio: t.host_bio || t.hostBio,
          location: t.location,
          quotas: t.quotas,
          vehicle: t.vehicle,
          description: t.description,
          status: t.status || "approved"
        }));
      }
    } catch (err) {
      console.warn("Supabase approved trips query fallback:", err);
    }
  }
}

// 2. Insert new trip post into Supabase with status 'pending_approval'
async function insertTripToSupabase(newTripObj) {
  if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
    try {
      const { data, error } = await supabaseClient
        .from('trips')
        .insert([{
          id: newTripObj.id,
          title: newTripObj.title,
          category: newTripObj.category,
          cover: newTripObj.cover,
          price: newTripObj.price,
          price_raw: newTripObj.priceRaw,
          badge: newTripObj.badge,
          badge_class: newTripObj.badgeClass,
          days: newTripObj.days,
          start_date: newTripObj.startDate,
          end_date: newTripObj.endDate,
          languages: newTripObj.languages,
          host: newTripObj.host,
          host_avatar: newTripObj.hostAvatar,
          host_bio: newTripObj.hostBio,
          location: newTripObj.location,
          quotas: newTripObj.quotas,
          vehicle: newTripObj.vehicle,
          description: newTripObj.description,
          status: 'pending_approval'
        }]);
      if (error) console.error("Supabase insert error:", error);
    } catch (err) {
      console.warn("Supabase insert trip fallback:", err);
    }
  }
}

// 3. Fetch pending trips from Supabase for Admin Moderation
async function fetchPendingTripsFromSupabase() {
  if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
    try {
      const { data, error } = await supabaseClient
        .from('trips')
        .select('*')
        .eq('status', 'pending_approval');

      if (!error && data) {
        const mapped = data.map(t => ({
          id: t.id,
          title: t.title,
          category: t.category,
          cover: t.cover,
          price: t.price,
          priceRaw: t.price_raw || t.priceRaw,
          badge: t.badge || "PENDING VERIFICATION",
          badgeClass: t.badge_class || t.badgeClass || "warning-tag",
          days: t.days,
          startDate: t.start_date || t.startDate,
          endDate: t.end_date || t.endDate,
          languages: t.languages,
          host: t.host,
          hostAvatar: t.host_avatar || t.hostAvatar,
          hostBio: t.host_bio || t.hostBio,
          location: t.location,
          quotas: t.quotas,
          vehicle: t.vehicle,
          description: t.description,
          status: 'pending_approval'
        }));

        mapped.forEach(p => {
          if (!state.trips.some(t => t.id === p.id)) {
            state.trips.unshift(p);
          }
        });
      }
    } catch (err) {
      console.warn("Supabase pending trips query fallback:", err);
    }
  }
}

// --- DYNAMIC DATE PICKER CONSTRAINTS ---
function setupDateInputs() {
  const startDateInput = document.getElementById("start-date-input");
  const endDateInput = document.getElementById("end-date-input");
  const todayHighlight = document.getElementById("today-highlight-badge");

  const today = new Date();
  const todayStr = formatDateISO(today);

  // Tomorrow is min selectable start date
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = formatDateISO(tomorrow);

  if (todayHighlight) {
    todayHighlight.innerHTML = `<i class="fa-solid fa-calendar-xmark"></i> Today: <strong>${todayStr}</strong> (Disabled) — Start dates selectable from tomorrow (${tomorrowStr}) onward.`;
  }

  if (startDateInput) {
    startDateInput.min = tomorrowStr;
    if (startDateInput.value && startDateInput.value < tomorrowStr) {
      startDateInput.value = tomorrowStr;
    }

    startDateInput.addEventListener("change", () => {
      const selectedStart = startDateInput.value;
      if (endDateInput) {
        endDateInput.min = selectedStart;
        if (endDateInput.value && endDateInput.value < selectedStart) {
          endDateInput.value = selectedStart;
        }
      }
      calculateDuration();
    });
  }

  if (endDateInput && startDateInput && startDateInput.value) {
    endDateInput.min = startDateInput.value;
  }
}

function formatDateISO(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// --- ROLE-BASED AUTH & VISIBILITY CONTROL ---
function updateAuthUI() {
  const adminNav = document.getElementById("nav-admin");
  const dropdownAdmin = document.getElementById("dropdown-admin-item");
  const roleSwitchItem = document.getElementById("dropdown-switch-role-item");
  const footerAdmin = document.getElementById("footer-admin-link");
  const roleLabel = document.getElementById("current-role-label");

  const isAdmin = state.currentUser && state.currentUser.isLoggedIn && state.currentUser.role === "admin";

  if (adminNav) {
    adminNav.style.display = isAdmin ? "inline-flex" : "none";
  }
  if (dropdownAdmin) {
    dropdownAdmin.style.display = isAdmin ? "flex" : "none";
  }
  if (roleSwitchItem) {
    roleSwitchItem.style.display = isAdmin ? "flex" : "none";
  }
  if (footerAdmin) {
    footerAdmin.style.display = isAdmin ? "list-item" : "none";
  }

  if (roleLabel) {
    roleLabel.innerText = isAdmin ? "Admin" : "User";
  }

  const userNameEl = document.getElementById("dropdown-user-name");
  const userRoleEl = document.getElementById("dropdown-user-role");
  if (userNameEl) userNameEl.innerText = state.currentUser ? state.currentUser.name : "Guest";
  if (userRoleEl) {
    if (isAdmin) {
      userRoleEl.innerHTML = `<span class="badge-tag confirmed-tag"><i class="fa-solid fa-user-shield"></i> Primary Administrator</span>`;
    } else {
      userRoleEl.innerHTML = `<span class="badge-tag verified-tag"><i class="fa-solid fa-circle-check"></i> Verified Traveler</span>`;
    }
  }
}

function toggleDemoRole(event) {
  const evt = event || (typeof window !== "undefined" ? window.event : null);
  if (evt && typeof evt.preventDefault === "function") {
    evt.preventDefault();
  }

  if (!state.currentUser || state.currentUser.role !== "admin") {
    alert("Access Restricted: Only authenticated Administrators are authorized to access role switching.");
    return;
  }

  state.currentUser.role = "user";
  state.currentUser.name = "Alex Thorne";
  alert("Switched role to Regular Traveler. Admin Portal access hidden.");
  if (state.activeView === "admin") {
    navigateTo("discover");
  }
  updateAuthUI();
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
    setupDateInputs();
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
  document.getElementById("det-host-name").innerText = trip.host;
  document.getElementById("det-host-img").src = trip.hostAvatar;
  document.getElementById("det-host-bio").innerText = trip.hostBio;
  document.getElementById("det-description").innerText = trip.description;
  document.getElementById("det-price").innerText = trip.price;
  document.getElementById("det-quotas").innerText = trip.quotas;
  document.getElementById("det-vehicle").innerText = trip.vehicle;
  document.getElementById("det-lang").innerText = trip.languages;

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
    
    document.getElementById("duration-badge").innerHTML = `<i class="fa-regular fa-clock"></i> Auto-calculated Duration: <strong>${diffDays > 0 ? diffDays : 1} Days</strong>`;
  }
}

function triggerFileInput() {
  document.getElementById("cover-image-input").click();
}

function handleImagePreview(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const container = document.getElementById("image-preview-container");
      const img = document.getElementById("image-preview");
      img.src = evt.target.result;
      container.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

function addDestinationTag() {
  const input = document.getElementById("destinations-input");
  const val = input.value.trim();
  if (val) {
    const container = document.getElementById("destinations-tags-container");
    const span = document.createElement("span");
    span.className = "badge-tag";
    span.innerHTML = `${val} <i class="fa-solid fa-xmark" onclick="this.parentElement.remove()"></i>`;
    container.appendChild(span);
    input.value = "";
  }
}

function saveTripAsDraft() {
  const title = document.getElementById("trip-title-input").value || "Untitled Draft Trip";
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
  e.preventDefault();
  openPaymentModal();
}

// --- PAYMENT MODAL & POSTING FLOW WITH SUPABASE INSERT ---
function openPaymentModal() {
  document.getElementById("payment-modal").classList.add("open");
}

function closePaymentModal() {
  document.getElementById("payment-modal").classList.remove("open");
}

async function processPayment(e) {
  e.preventDefault();
  const submitBtn = document.getElementById("pay-submit-btn");
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Secure Payment...`;

  setTimeout(async () => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `Pay LKR 100.00 &rarr;`;
    closePaymentModal();

    const newTitle = document.getElementById("trip-title-input").value;
    if (newTitle) {
      const startVal = document.getElementById("start-date-input").value || "2026-09-15";
      const endVal = document.getElementById("end-date-input").value || "2026-09-20";

      const newTripObj = {
        id: `WB-${Math.floor(100 + Math.random() * 900)}`,
        title: newTitle,
        category: document.getElementById("category-select").value || "Adventure",
        cover: document.getElementById("image-preview").src || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        price: `LKR ${Number(document.getElementById("cost-input").value || 50000).toLocaleString()}`,
        priceRaw: Number(document.getElementById("cost-input").value || 50000),
        badge: "PENDING VERIFICATION",
        badgeClass: "warning-tag",
        days: 5,
        startDate: startVal,
        endDate: endVal,
        languages: "English, Sinhala",
        host: state.currentUser ? state.currentUser.name : "Alex Thorne",
        hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        hostBio: "Verified Traveler & Host",
        location: "Sri Lanka",
        quotas: `${document.getElementById("male-quota-input").value || 2} Males, ${document.getElementById("female-quota-input").value || 2} Females`,
        vehicle: document.getElementById("vehicle-input").value || "SUV",
        description: document.getElementById("description-input").value || "Great trip planned.",
        status: "pending_approval" // ADMIN VERIFICATION RULE
      };

      state.trips.unshift(newTripObj);
      
      // INSERT INTO SUPABASE WITH STATUS 'pending_approval'
      await insertTripToSupabase(newTripObj);

      renderTripGrid();
      renderAdminTables();
      document.getElementById("create-trip-form").reset();
      
      alert(`Payment Successful! Your trip "${newTitle}" has been submitted to Supabase with status 'pending_approval'.\n\nIt will render on the live public feed as soon as an Administrator approves it in the Admin Panel.`);
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
  document.getElementById("chat-modal").classList.add("open");
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

// PRIVACY FILTER (PFI / Sensitive Info Masking)
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
  e.preventDefault();
  const input = document.getElementById("chat-text-input");
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
  document.getElementById("chat-modal").classList.remove("open");
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
  form.style.display = form.style.display === "none" ? "block" : "none";
}

function handleKYCSubmit(e) {
  e.preventDefault();
  const nic = document.getElementById("kyc-nic").value;

  document.getElementById("profile-status-badge").className = "badge-tag verified-tag";
  document.getElementById("profile-status-badge").innerHTML = `<i class="fa-solid fa-shield-check"></i> Verified Traveler (KYC Approved)`;

  alert(`Verification Details (NIC: ${nic}) submitted for admin review.`);
  toggleVerificationForm();
}

function handlePasswordUpdate(e) {
  e.preventDefault();
  alert("Security Credentials Updated Successfully!");
}

// --- ADMIN CONSOLE DATA TABLES & APPROVAL WORKFLOWS WITH SUPABASE UPDATE ---
async function renderAdminTables() {
  await fetchPendingTripsFromSupabase();
  renderAdminTripsTable();
  renderAdminUsersTable();
}

function renderAdminTripsTable() {
  const tbody = document.getElementById("admin-trips-tbody");
  if (!tbody) return;

  tbody.innerHTML = state.trips.map(trip => `
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

// UPDATE SUPABASE DATABASE ON APPROVAL: .update({ status: 'approved' })
async function approveTrip(tripId) {
  const trip = state.trips.find(t => t.id === tripId);
  if (trip) {
    trip.status = "approved";
    trip.badge = "VERIFIED HOST";
    trip.badgeClass = "verified-tag";

    if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
      try {
        const { error } = await supabaseClient
          .from('trips')
          .update({
            status: 'approved',
            badge: 'VERIFIED HOST',
            badge_class: 'verified-tag'
          })
          .eq('id', tripId);

        if (error) console.error("Supabase update error:", error);
      } catch (err) {
        console.warn("Supabase update fallback:", err);
      }
    }

    renderAdminTables();
    renderTripGrid();
    alert(`Trip "${trip.title}" (${trip.id}) has been APPROVED in Supabase and is now live on the public Discover feed!`);
  }
}

async function rejectTrip(tripId) {
  if (confirm("Are you sure you want to reject this trip submission?")) {
    state.trips = state.trips.filter(t => t.id !== tripId);

    if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
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

  tbody.innerHTML = allUsers.map((u, idx) => `
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

function switchAdminTab(tabName) {
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
    row.style.opacity = "0.4";
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
  e.preventDefault();
  const name = document.getElementById("new-admin-name").value.trim();
  const email = document.getElementById("new-admin-email").value.trim();

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
  document.getElementById("add-admin-form").reset();
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
function toggleNotifDrawer() {
  document.getElementById("notif-drawer").classList.toggle("open");
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

function toggleUserDropdown() {
  document.getElementById("user-dropdown").classList.toggle("open");
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
  document.getElementById("auth-modal").classList.add("open");
}

function closeAuthModal() {
  document.getElementById("auth-modal").classList.remove("open");
}

function switchAuthTab(tab) {
  if (tab === "login") {
    document.getElementById("auth-login-view").style.display = "block";
    document.getElementById("auth-register-view").style.display = "none";
  } else {
    document.getElementById("auth-login-view").style.display = "none";
    document.getElementById("auth-register-view").style.display = "block";
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  closeAuthModal();

  const roleSelect = document.getElementById("login-role-select");
  const emailInput = document.getElementById("login-email-input");

  const selectedRole = roleSelect ? roleSelect.value : "user";
  const email = emailInput ? emailInput.value : "";

  if (selectedRole === "admin" || email.includes("admin")) {
    state.currentUser = {
      name: "Primary System Admin",
      email: email || "admin@tripbuddy.com",
      role: "admin",
      isLoggedIn: true
    };
    alert("Authenticated as Administrator! Admin Portal unlocked and displayed.");
    updateAuthUI();
    navigateTo("admin");
  } else {
    state.currentUser = {
      name: "Alex Thorne",
      email: email || "alex.thorne@example.com",
      role: "user",
      isLoggedIn: true
    };
    alert("Logged in successfully as Regular Traveler (Alex Thorne).");
    updateAuthUI();
    navigateTo("discover");
  }
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  closeAuthModal();

  const nameInput = document.getElementById("reg-name-input");
  const emailInput = document.getElementById("reg-email-input");

  const name = nameInput ? nameInput.value : "New User";
  const email = emailInput ? emailInput.value : "user@example.com";

  state.pendingUsers.push({
    id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name,
    email: email,
    dob: "2000-01-01",
    phone: "+94 77 000 0000",
    role: "Traveler",
    status: "pending_approval",
    registerDate: formatDateISO(new Date())
  });

  renderAdminTables();
  alert("Registration Successful!\n\nYour account has been set to 'pending_approval' and submitted for Admin Review.");
}
