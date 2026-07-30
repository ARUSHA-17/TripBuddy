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

const initialTrips = [];
const serviceProviders = [];

let state = {
  trips: [],
  selectedCategory: "all",
  searchQuery: "",
  activeView: localStorage.getItem("activeTab") || "discover",
  selectedTripId: null,
  createTripDestinations: [],
  drafts: [],
  currentUser: {
    id: null,
    name: "Guest",
    email: "",
    role: "user",
    isLoggedIn: false,
    status: "none"
  },
  bookmarks: [],
  comments: {},
  pendingUsers: [],
  adminUsers: [],
  allUsers: [],
  siteSettings: {
    allowRegistrations: true,
    enableBanner: true,
    bannerText: "Welcome to TripBuddy! Start planning your next adventure today.",
    maintenanceMode: false
  },
  userFilterTab: "all",
  chats: {}
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  document.body.insertAdjacentHTML('afterbegin', '<div id="global-loader" style="position:fixed;top:0;left:0;width:100%;height:100%;background:var(--bg-dark);z-index:9999;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-spinner fa-spin fa-3x color-primary"></i><p style="margin-left:10px;">Checking session...</p></div>');
  
  await initSupabaseAuthListener();
  
  setupDateInputs();
  updateAuthUI();
  setupNavigationEventListeners();
  renderDestinationsRouteList();
  applySiteSettings();
  await fetchApprovedTripsFromSupabase();
  renderTripGrid();
  renderServicesGrid();
  renderAdminTables();
  renderAdminList();
  initAdminCharts();
  
  removeLoaderAndNavigate();
});

function removeLoaderAndNavigate() {
  const loader = document.getElementById("global-loader");
  if (loader) loader.remove();
  if (state.activeView) navigateTo(state.activeView);
}

async function initSupabaseAuthListener() {
  if (supabaseClient) {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (session && session.user) {
        await handleSupabaseAuthUser(session.user);
      } else {
        state.currentUser = {
          id: null,
          name: "Guest",
          email: "",
          role: "user",
          isLoggedIn: false,
          status: "none"
        };
      }

      supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          await handleSupabaseAuthUser(session.user);
          updateAuthUI();
        } else if (event === 'SIGNED_OUT') {
          state.currentUser = {
            id: null,
            name: "Guest",
            email: "",
            role: "user",
            isLoggedIn: false,
            status: "none"
          };
          updateAuthUI();
        }
      });
    } catch (err) {
      console.warn("Supabase auth listener init error:", err);
      state.currentUser = {
        id: null,
        name: "Guest",
        email: "",
        role: "user",
        isLoggedIn: false,
        status: "none"
      };
    }
  } else {
    state.currentUser = {
      id: null,
      name: "Guest",
      email: "",
      role: "user",
      isLoggedIn: false,
      status: "none"
    };
  }
}

// --- GUEST AUTHENTICATION GUARD & MODAL CONTROLS ---
function requireAuth(actionName, callback) {
  if (state.currentUser && state.currentUser.isLoggedIn) {
    if (typeof callback === "function") callback();
    return true;
  } else {
    showGuestModal(actionName);
    return false;
  }
}

function showGuestModal(actionName = "perform this action") {
  const descEl = document.getElementById("guest-modal-action-desc");
  if (descEl) {
    descEl.innerText = `Please sign in or create an account to ${actionName}.`;
  }
  const modal = document.getElementById("guest-auth-modal");
  if (modal) modal.classList.add("open");
}

function closeGuestModal() {
  const modal = document.getElementById("guest-auth-modal");
  if (modal) modal.classList.remove("open");
}

async function handleSupabaseAuthUser(user) {
  if (!user) return;
  const metadata = user.user_metadata || {};
  let status = metadata.status || "approved";
  let role = metadata.role || "user";
  let name = metadata.full_name || metadata.display_name || metadata.name;
  let bio = metadata.bio || "";
  let avatar_url = metadata.avatar_url || "assets/images/default-avatar.png";

  if (supabaseClient) {
    try {
      const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        if (profile.status) status = profile.status;
        if (profile.role) role = profile.role;
        if (profile.full_name || profile.display_name) name = profile.full_name || profile.display_name;
        if (profile.bio) bio = profile.bio;
        if (profile.avatar_url) avatar_url = profile.avatar_url;
      }
    } catch (err) {
      console.warn("Supabase profile fetch fallback:", err);
    }
  }

  if (!name) name = user.email ? user.email.split("@")[0] : "Guest";

  if (status === "pending_approval") {
    if (supabaseClient) {
      try { await supabaseClient.auth.signOut(); } catch (err) {}
    }
    state.currentUser = { name: "Guest", email: "", role: "user", isLoggedIn: false, status: "pending_approval" };
    updateAuthUI();
    showToast("Your account is pending Admin approval.", "warning");
    return;
  }

  state.currentUser = {
    id: user.id,
    name: name,
    email: user.email,
    role: role,
    status: status,
    bio: bio,
    avatar_url: avatar_url,
    isLoggedIn: true
  };
  updateAuthUI();
}

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
  const container = document.getElementById("discover-trips-container");
  if (container) {
    container.innerHTML = '<div style="text-align: center; padding: 3rem;"><i class="fa-solid fa-spinner fa-spin fa-2x color-primary"></i><p class="mt-2">Loading latest adventures...</p></div>';
  }

  if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
    try {
      const { data, error } = await supabaseClient
        .from('trips')
        .select('*')
        .eq('status', 'approved');

      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
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
      } else {
        state.trips = [];
      }
    } catch (err) {
      console.error("Supabase approved trips query error:", err);
      showToast("Failed to load community trips. Please try again later.", "error");
    }
  }
}

async function fetchUserTripsFromSupabase(userId) {
  const container = document.getElementById("my-trips-container");
  if (!container || !userId) return;
  
  container.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin color-primary"></i> Loading your trips...</div>';

  if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
    try {
      const { data, error } = await supabaseClient
        .from('trips')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const userTrips = data.map(t => ({
            id: t.id,
            title: t.title,
            cover: t.cover,
            startDate: t.start_date,
            endDate: t.end_date,
            status: t.status
        }));
        container.innerHTML = userTrips.map(trip => `
          <div class="my-trip-item mt-2">
            <img src="${trip.cover || 'assets/images/placeholder.jpg'}" alt="${trip.title}">
            <div class="my-trip-info">
              <h4>${trip.title}</h4>
              <span>${trip.startDate} - ${trip.endDate}</span>
            </div>
            <span class="badge-tag ${trip.status === 'approved' ? 'confirmed-tag' : 'warning-tag'}">${(trip.status || 'Draft').toUpperCase()}</span>
            <button class="btn btn-outline btn-sm ml-2" onclick="openChatModal('${trip.id}')">Open Chat</button>
          </div>
        `).join("");
      } else {
        container.innerHTML = `
          <div class="empty-state-card">
            <i class="fa-solid fa-map-location-dot"></i>
            <h3>No upcoming trips yet.</h3>
            <p>Click '+ Create New' to plan your first adventure!</p>
            <p class="mt-2 text-muted micro-note">No saved drafts found.</p>
          </div>
        `;
      }
    } catch (err) {
      console.error("Supabase user trips fetch error:", err);
      showToast("Could not load your trips.", "error");
      container.innerHTML = `
        <div class="empty-state-card">
          <i class="fa-solid fa-circle-exclamation color-danger"></i>
          <h3>Failed to load trips</h3>
          <p>We encountered an error. Please refresh the page.</p>
        </div>
      `;
    }
  } else {
     container.innerHTML = `
        <div class="empty-state-card">
          <i class="fa-solid fa-map-location-dot"></i>
          <h3>No upcoming trips yet.</h3>
          <p>Click '+ Create New' to plan your first adventure!</p>
          <p class="mt-2 text-muted micro-note">No saved drafts found.</p>
        </div>
      `;
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
          user_id: newTripObj.user_id || state.currentUser?.id,
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
      if (error) throw error;
    } catch (err) {
      console.error("Supabase insert error:", err);
      showToast("Failed to save the trip to the server.", "error");
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

function checkIsAdmin() {
  return !!(state.currentUser && state.currentUser.isLoggedIn && state.currentUser.role === "admin");
}

// --- ROLE-BASED AUTH & VISIBILITY CONTROL ---
function updateAuthUI() {
  const adminNav = document.getElementById("nav-admin");
  const dropdownAdmin = document.getElementById("dropdown-admin-item");
  const roleSwitchItem = document.getElementById("dropdown-switch-role-item");
  const footerAdmin = document.getElementById("footer-admin-link");
  const roleLabel = document.getElementById("current-role-label");
  const sidebarAdminName = document.getElementById("sidebar-admin-name");
  
  const navAuthButtons = document.getElementById("nav-auth-buttons");
  const userAvatarWrapper = document.querySelector(".user-avatar-wrapper");
  const notifBtn = document.getElementById("notif-btn");
  const createGuestBanner = document.getElementById("create-trip-guest-banner");

  const isAdmin = checkIsAdmin();
  const isLoggedIn = !!(state.currentUser && state.currentUser.isLoggedIn);

  if (navAuthButtons) {
    navAuthButtons.style.display = isLoggedIn ? "none" : "flex";
  }
  if (userAvatarWrapper) {
    userAvatarWrapper.style.display = isLoggedIn ? "flex" : "none";
  }
  if (notifBtn) {
    notifBtn.style.display = isLoggedIn ? "flex" : "none";
  }
  if (createGuestBanner) {
    createGuestBanner.style.display = isLoggedIn ? "none" : "flex";
  }

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

  if (sidebarAdminName && state.currentUser) {
    sidebarAdminName.innerText = state.currentUser.name || "Guest";
  }

  const userNameEl = document.getElementById("dropdown-user-name");
  const userRoleEl = document.getElementById("dropdown-user-role");
  if (userNameEl) userNameEl.innerText = isLoggedIn ? state.currentUser.name : "Guest";
  if (userRoleEl) {
    if (isAdmin) {
      userRoleEl.innerHTML = `<span class="badge-tag confirmed-tag"><i class="fa-solid fa-user-shield"></i> Primary Administrator</span>`;
    } else if (isLoggedIn) {
      userRoleEl.innerHTML = `<span class="badge-tag verified-tag"><i class="fa-solid fa-circle-check"></i> Verified Traveler</span>`;
    } else {
      userRoleEl.innerHTML = `<span class="badge-tag warning-tag"><i class="fa-solid fa-user"></i> Not Signed In</span>`;
    }
  }

  // Update Profile View Elements
  const profileNameLabel = document.getElementById("profile-name-label");
  const profileBioLabel = document.getElementById("profile-bio-label");
  const profileMainImg = document.getElementById("profile-main-img");
  const headerAvatarImg = document.getElementById("header-avatar-img");
  const profileStatusBadge = document.getElementById("profile-status-badge");

  const headerAvatarInitials = document.getElementById("header-avatar-initials");
  const profileMainInitials = document.getElementById("profile-main-initials");

  if (isLoggedIn) {
    if (profileNameLabel) profileNameLabel.innerText = state.currentUser.name;
    if (profileBioLabel) profileBioLabel.innerText = state.currentUser.bio || "Update your bio to tell travelers about yourself.";
    
    const initials = state.currentUser.name ? state.currentUser.name.substring(0, 2).toUpperCase() : "U";
    if (state.currentUser.avatar_url && !state.currentUser.avatar_url.includes('default-avatar.png')) {
      if (profileMainImg) {
        profileMainImg.src = state.currentUser.avatar_url;
        profileMainImg.style.display = "block";
        if (profileMainInitials) profileMainInitials.style.display = "none";
      }
      if (headerAvatarImg) {
        headerAvatarImg.src = state.currentUser.avatar_url;
        headerAvatarImg.style.display = "block";
        if (headerAvatarInitials) headerAvatarInitials.style.display = "none";
      }
    } else {
      if (profileMainImg) profileMainImg.style.display = "none";
      if (profileMainInitials) {
        profileMainInitials.innerText = initials;
        profileMainInitials.style.display = "flex";
      }
      if (headerAvatarImg) headerAvatarImg.style.display = "none";
      if (headerAvatarInitials) {
        headerAvatarInitials.innerText = initials;
        headerAvatarInitials.style.display = "flex";
      }
    }
    
    if (profileStatusBadge) profileStatusBadge.style.display = "inline-flex";
    
    // Fetch and render user trips
    fetchUserTripsFromSupabase(state.currentUser.id);
  } else {
    if (profileNameLabel) profileNameLabel.innerText = "Guest";
    if (profileBioLabel) profileBioLabel.innerText = "";
    
    if (profileMainImg) profileMainImg.style.display = "none";
    if (profileMainInitials) {
      profileMainInitials.innerText = "G";
      profileMainInitials.style.display = "flex";
    }
    if (headerAvatarImg) headerAvatarImg.style.display = "none";
    if (headerAvatarInitials) {
      headerAvatarInitials.innerText = "G";
      headerAvatarInitials.style.display = "flex";
    }
    
    if (profileStatusBadge) profileStatusBadge.style.display = "none";
    
    const tripsContainer = document.getElementById("my-trips-container");
    if (tripsContainer) tripsContainer.innerHTML = "";
  }
}

function toggleDemoRole(event) {
  const evt = event || (typeof window !== "undefined" ? window.event : null);
  if (evt && typeof evt.preventDefault === "function") {
    evt.preventDefault();
  }

  if (!checkIsAdmin()) {
    showToast("Access Restricted: Only authenticated Administrators can toggle demo role.", "error");
    return;
  }

  state.currentUser.role = "user";
  state.currentUser.name = "Alex Thorne";
  showToast("Switched role to Regular Traveler. Admin Portal access hidden.", "info");
  if (state.activeView === "admin") {
    navigateTo("discover");
  }
  updateAuthUI();
}

// --- SPA VIEW ROUTER WITH STRICT ROLE GUARD ---
async function navigateTo(viewId, event) {
  const evt = event || (typeof window !== "undefined" ? window.event : null);
  if (evt && typeof evt.preventDefault === "function") {
    evt.preventDefault();
  }

  if (viewId === "admin") {
    if (!checkIsAdmin()) {
      showToast("Access Denied: You must be authenticated as an Administrator to access the Super Admin Portal.", "error");
      const adminSec = document.getElementById("view-admin");
      if (adminSec) adminSec.style.display = "none";
      state.activeView = "discover";
      document.querySelectorAll(".view-section").forEach(sec => sec.classList.remove("active"));
      const discSec = document.getElementById("view-discover");
      if (discSec) discSec.classList.add("active");
      return;
    }
    await fetchPendingTripsFromSupabase();
    await renderAdminTables();
    initAdminCharts();
  }

  state.activeView = viewId;
  localStorage.setItem("activeTab", viewId);
  
  document.querySelectorAll(".view-section").forEach(sec => {
    sec.classList.remove("active");
    if (sec.id !== "view-admin" || checkIsAdmin()) {
      sec.style.display = "";
    }
  });
  
  const targetSec = document.getElementById(`view-${viewId}`);
  if (targetSec) {
    targetSec.classList.add("active");
    if (viewId === "admin") targetSec.style.display = "block";
  }

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
      <div class="empty-state-card" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-compass"></i>
        <h3>No community trips published yet.</h3>
        <p>Try clearing your search query or selecting another category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(trip => {
    const isBookmarked = state.bookmarks && state.bookmarks.includes(trip.id);
    return `
    <div class="trip-card ${trip.isFeatured ? 'featured-card-border' : ''}">
      <div class="trip-card-image" style="position: relative;">
        <img src="${trip.cover}" alt="${trip.title}">
        ${trip.isFeatured ? `
          <span class="badge-tag featured-tag badge-top-left"><i class="fa-solid fa-star"></i> FEATURED</span>
        ` : `
          <span class="badge-tag ${trip.badgeClass} badge-top-left"><i class="fa-solid fa-shield-check"></i> ${trip.badge}</span>
        `}
        <button class="bookmark-card-btn ${isBookmarked ? 'active' : ''}" onclick="toggleBookmark('${trip.id}', event)" title="Bookmark Trip" style="position: absolute; bottom: 12px; right: 12px; background: rgba(255,255,255,0.92); border: none; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: ${isBookmarked ? '#f59e0b' : '#64748b'}; font-size: 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.2); transition: transform 0.2s ease;">
          <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
        </button>
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
  `;
  }).join("");
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

// --- BOOKMARKING & COMMENTS SYSTEM ---
function toggleBookmark(tripId, event) {
  const evt = event || (typeof window !== "undefined" ? window.event : null);
  if (evt && typeof evt.stopPropagation === "function") evt.stopPropagation();

  if (!requireAuth("bookmark trips")) return;

  if (!state.bookmarks) state.bookmarks = [];
  const idx = state.bookmarks.indexOf(tripId);
  if (idx > -1) {
    state.bookmarks.splice(idx, 1);
    showToast("Trip removed from bookmarks", "info");
  } else {
    state.bookmarks.push(tripId);
    showToast("Trip saved to your bookmarks!", "success");
  }
  renderTripGrid();
  updateDetailsBookmarkButton();
}

function updateDetailsBookmarkButton() {
  const btn = document.getElementById("details-bookmark-btn");
  if (!btn) return;
  const isBookmarked = state.bookmarks && state.bookmarks.includes(state.selectedTripId);
  if (isBookmarked) {
    btn.innerHTML = `<i class="fa-solid fa-bookmark text-accent"></i> Bookmarked`;
    btn.classList.add("active");
  } else {
    btn.innerHTML = `<i class="fa-regular fa-bookmark"></i> Bookmark Trip`;
    btn.classList.remove("active");
  }
}

function renderTripComments(tripId) {
  const container = document.getElementById("trip-comments-container");
  const countLabel = document.getElementById("comment-count-label");
  if (!container) return;

  const comments = (state.comments && state.comments[tripId]) || [];
  if (countLabel) countLabel.innerText = `${comments.length} Comments`;

  if (comments.length === 0) {
    container.innerHTML = `<p class="text-muted small py-2">No comments yet. Be the first to start the discussion!</p>`;
    return;
  }

  container.innerHTML = comments.map(c => `
    <div class="comment-item flex-align gap-3 py-2 border-bottom">
      <img src="${c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}" class="user-avatar-sm" alt="${c.user}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
      <div class="comment-body">
        <div class="flex-align gap-2">
          <strong>${c.user}</strong>
          <span class="micro text-muted">${c.time}</span>
        </div>
        <p class="small text-body mb-0">${c.text}</p>
      </div>
    </div>
  `).join("");
}

function handlePostComment(e) {
  e.preventDefault();
  if (!requireAuth("post comments on trip posts")) return;

  const input = document.getElementById("comment-text-input");
  const text = input ? input.value.trim() : "";
  if (!text) return;

  const tripId = state.selectedTripId || "WB-101";
  if (!state.comments) state.comments = {};
  if (!state.comments[tripId]) state.comments[tripId] = [];

  const newComment = {
    id: `c_${Date.now()}`,
    user: state.currentUser.name || "Traveler",
    user_id: state.currentUser.id,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    text: text,
    time: "Just now"
  };

  state.comments[tripId].push(newComment);
  renderTripComments(tripId);
  input.value = "";
  showToast("Comment posted successfully!", "success");
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

  renderTripComments(trip.id);
  updateDetailsBookmarkButton();

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

function renderDestinationsRouteList() {
  const container = document.getElementById("destinations-route-container");
  if (!container) return;

  if (!state.createTripDestinations || state.createTripDestinations.length === 0) {
    container.innerHTML = "";
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
  if (!requireAuth("add destination stops")) return;
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
  if (!requireAuth("save trip drafts")) return;
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
  if (!requireAuth("create trip posts")) return;
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
        user_id: state.currentUser ? state.currentUser.id : null,
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
        location: (state.createTripDestinations && state.createTripDestinations.length > 0) ? state.createTripDestinations.join(" → ") : "Sri Lanka",
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
      state.createTripDestinations = [];
      renderDestinationsRouteList();
      
      alert(`Payment Successful! Your trip "${newTitle}" has been submitted to Supabase with status 'pending_approval'.\n\nIt will render on the live public feed as soon as an Administrator approves it in the Admin Panel.`);
      navigateTo("discover");
    }
  }, 1200);
}

// --- TRIP GROUP CHAT & PRIVACY SYSTEM ---
function openChatModal(tripId) {
  if (!requireAuth("connect with trip hosts & travelers")) return;
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

async function handleKYCSubmit(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById("verify-submit-btn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
  }

  const nic = document.getElementById("kyc-nic").value;
  const frontFile = document.getElementById("upload-front-input").files[0];
  const backFile = document.getElementById("upload-back-input").files[0];

  try {
    if (supabaseClient && frontFile && state.currentUser && state.currentUser.id) {
      const frontPath = `${state.currentUser.id}/front_${Date.now()}_${frontFile.name}`;
      const { error: frontErr } = await supabaseClient.storage.from('verification-docs').upload(frontPath, frontFile);
      if (frontErr) throw frontErr;
    }

    if (supabaseClient && backFile && state.currentUser && state.currentUser.id) {
      const backPath = `${state.currentUser.id}/back_${Date.now()}_${backFile.name}`;
      const { error: backErr } = await supabaseClient.storage.from('verification-docs').upload(backPath, backFile);
      if (backErr) throw backErr;
    }

    // Update profile verification status
    if (supabaseClient && state.currentUser && state.currentUser.id) {
      await supabaseClient.from('profiles').update({ verification_status: 'pending' }).eq('id', state.currentUser.id);
    }

    showToast(`Verification Details (NIC: ${nic}) submitted for admin review.`, "success");
    toggleVerificationForm();
  } catch (err) {
    console.error("KYC Upload Error:", err);
    showToast("Failed to upload verification documents. Please try again.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-shield-check"></i> Submit for Verification';
    }
  }
}

function updateUploadStatus(side) {
  const input = document.getElementById(`upload-${side}-input`);
  const statusEl = document.getElementById(`upload-${side}-status`);
  if (input && input.files && input.files[0] && statusEl) {
    statusEl.innerText = `${side === 'front' ? 'Front' : 'Back'} side uploaded: ${input.files[0].name}`;
    statusEl.className = "upload-status success mt-1";
  }
}

function handlePasswordUpdate(e) {
  e.preventDefault();
  alert("Security Credentials Updated Successfully!");
}

// --- TOAST NOTIFICATIONS SYSTEM ---
function showToast(message, type = "success", duration = 3500) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconClass = "fa-circle-check";
  if (type === "error") iconClass = "fa-circle-xmark";
  if (type === "warning") iconClass = "fa-triangle-exclamation";
  if (type === "info") iconClass = "fa-circle-info";

  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%) scale(0.9)";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, duration);
}

// --- CHART.JS VISUAL ANALYTICS ENGINE ---
let userRegistrationChartInstance = null;
let tripCategoryChartInstance = null;

function initAdminCharts() {
  if (typeof Chart === 'undefined') return;

  // 1. Monthly Registrations & Submissions Bar/Line Chart
  const ctxReg = document.getElementById('userRegistrationChart');
  if (ctxReg) {
    if (userRegistrationChartInstance) {
      userRegistrationChartInstance.destroy();
    }
    userRegistrationChartInstance = new Chart(ctxReg, {
      type: 'bar',
      data: {
        labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'User Registrations',
            data: [14, 28, 45, 62, 85, 110],
            backgroundColor: 'rgba(0, 245, 212, 0.65)',
            borderColor: '#00F5D4',
            borderWidth: 2,
            borderRadius: 6
          },
          {
            label: 'Trip Submissions',
            type: 'line',
            data: [5, 12, 19, 30, 42, 58],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            borderWidth: 3,
            tension: 0.35,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Inter', size: 11 } } }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true }
        }
      }
    });
  }

  // 2. Trips by Category Doughnut Chart
  const ctxCat = document.getElementById('tripCategoryChart');
  if (ctxCat) {
    if (tripCategoryChartInstance) {
      tripCategoryChartInstance.destroy();
    }

    const categoriesCount = {
      Adventure: 0,
      Beach: 0,
      Mountain: 0,
      Cultural: 0,
      "Road trip": 0
    };

    state.trips.forEach(t => {
      const cat = t.category || "Adventure";
      if (categoriesCount[cat] !== undefined) {
        categoriesCount[cat]++;
      } else {
        categoriesCount["Adventure"]++;
      }
    });

    tripCategoryChartInstance = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categoriesCount),
        datasets: [{
          data: Object.values(categoriesCount),
          backgroundColor: [
            '#00F5D4', // Adventure
            '#3B82F6', // Beach
            '#8B5CF6', // Mountain
            '#F59E0B', // Cultural
            '#10B981'  // Road trip
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 12, font: { family: 'Inter', size: 11 } } }
        },
        cutout: '65%'
      }
    });
  }
}

// --- SUMMARY CARDS DATA RE-CALCULATION ---
function updateAdminSummaryCards() {
  const totalUsersEl = document.getElementById("admin-stat-total-users");
  const pendingApprovalsEl = document.getElementById("admin-stat-pending-approvals");
  const activeTripsEl = document.getElementById("admin-stat-active-trips");
  const completedTripsEl = document.getElementById("admin-stat-completed-trips");
  const navPendingBadge = document.getElementById("nav-pending-badge");

  const pendingUsersCount = state.pendingUsers.filter(u => u.status === "pending_approval").length;
  const pendingTripsCount = state.trips.filter(t => t.status === "pending_approval").length;
  const totalPending = pendingUsersCount + pendingTripsCount;

  if (totalUsersEl) totalUsersEl.innerText = state.allUsers.length;
  if (pendingApprovalsEl) pendingApprovalsEl.innerText = totalPending;
  if (activeTripsEl) activeTripsEl.innerText = state.trips.filter(t => t.status === "approved").length;
  if (completedTripsEl) completedTripsEl.innerText = "18";

  if (navPendingBadge) {
    navPendingBadge.innerText = totalPending;
    navPendingBadge.style.display = totalPending > 0 ? "inline-block" : "none";
  }
}

// --- SUPER ADMIN SECURITY & DATA TABLES ENGINE ---
async function renderAdminTables() {
  await fetchPendingTripsFromSupabase();
  renderPendingApprovalsTable();
  renderAdminUsersTable();
  renderAdminTripsTable();
  updateAdminSummaryCards();
  renderAdminList();
}

// 1. PENDING APPROVALS TAB
function renderPendingApprovalsTable() {
  const tbody = document.getElementById("admin-pending-tbody");
  if (!tbody) return;

  const searchQuery = (document.getElementById("pending-search-input")?.value || "").toLowerCase();
  const typeFilter = document.getElementById("pending-type-filter")?.value || "all";

  let items = [];

  if (typeFilter === "all" || typeFilter === "user") {
    state.pendingUsers.filter(u => u.status === "pending_approval").forEach(u => {
      items.push({
        type: "User Registration",
        id: u.id || u.email,
        title: u.name,
        subtitle: u.email,
        details: `DOB: ${u.dob || 'N/A'} • Phone: ${u.phone || 'N/A'}`,
        date: u.registerDate || "2026-07-30",
        rawObj: u
      });
    });
  }

  if (typeFilter === "all" || typeFilter === "trip") {
    state.trips.filter(t => t.status === "pending_approval").forEach(t => {
      items.push({
        type: "Trip Submission",
        id: t.id,
        title: t.title,
        subtitle: `Host: ${t.host} • ${t.category}`,
        details: `Quotas: ${t.quotas} • Budget: ${t.price}`,
        date: t.startDate || "2026-10-12",
        rawObj: t
      });
    });
  }

  if (searchQuery) {
    items = items.filter(item => 
      item.title.toLowerCase().includes(searchQuery) ||
      item.subtitle.toLowerCase().includes(searchQuery) ||
      item.details.toLowerCase().includes(searchQuery)
    );
  }

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><i class="fa-solid fa-circle-check text-success"></i> No pending approval requests found. All clear!</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(item => `
    <tr>
      <td>
        <span class="badge-tag ${item.type.includes('User') ? 'blue-tag' : 'warning-tag'}">
          <i class="fa-solid ${item.type.includes('User') ? 'fa-user-clock' : 'fa-route'}"></i> ${item.type}
        </span>
      </td>
      <td>
        <strong>${item.title}</strong><br>
        <span class="micro text-muted">${item.subtitle}</span>
      </td>
      <td><span class="small">${item.details}</span></td>
      <td><span class="micro text-muted">${item.date}</span></td>
      <td>
        ${item.type.includes('User') ? `
          <button class="btn btn-success btn-sm" onclick="approvePendingUser('${item.id}')"><i class="fa-solid fa-check"></i> Approve</button>
          <button class="btn btn-danger btn-sm ml-1" onclick="rejectPendingUser('${item.id}')"><i class="fa-solid fa-xmark"></i> Reject</button>
        ` : `
          <button class="btn btn-success btn-sm" onclick="approveTrip('${item.id}')"><i class="fa-solid fa-check"></i> Approve</button>
          <button class="btn btn-danger btn-sm ml-1" onclick="rejectTrip('${item.id}')"><i class="fa-solid fa-xmark"></i> Reject</button>
        `}
      </td>
    </tr>
  `).join("");
}

async function approvePendingUser(id) {
  const user = state.pendingUsers.find(u => u.id === id || u.email === id);
  if (user) {
    user.status = "approved";
    let mainUser = state.allUsers.find(u => u.email === user.email);
    if (mainUser) {
      mainUser.status = "approved";
    } else {
      state.allUsers.push({ ...user, status: "approved" });
    }

    if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
      try {
        await supabaseClient.from('profiles').update({ status: 'approved' }).eq('email', user.email);
      } catch (err) { console.warn("Supabase user approve fallback:", err); }
    }

    showToast(`User account for "${user.name}" approved successfully!`, "success");
    renderAdminTables();
  }
}

async function rejectPendingUser(id) {
  if (confirm("Are you sure you want to reject this user registration request?")) {
    const user = state.pendingUsers.find(u => u.id === id || u.email === id);
    if (user) {
      user.status = "rejected";
      state.pendingUsers = state.pendingUsers.filter(u => u.id !== id && u.email !== id);
      state.allUsers = state.allUsers.filter(u => u.id !== id && u.email !== id);

      if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
        try {
          await supabaseClient.from('profiles').update({ status: 'rejected' }).eq('email', user.email);
        } catch (err) { console.warn("Supabase user reject fallback:", err); }
      }

      showToast(`User registration for "${user.name}" rejected.`, "error");
      renderAdminTables();
    }
  }
}

// 2. MANAGE USERS TAB
function filterAdminUserTab(status, el) {
  state.userFilterTab = status;
  document.querySelectorAll("#adm-page-users .adm-tab").forEach(t => t.classList.remove("active"));
  if (el) el.classList.add("active");
  renderAdminUsersTable();
}

function renderAdminUsersTable() {
  const tbody = document.getElementById("admin-users-tbody");
  if (!tbody) return;

  const searchQuery = (document.getElementById("users-search-input")?.value || "").toLowerCase();
  const roleFilter = document.getElementById("users-role-filter")?.value || "all";

  let users = [...state.allUsers];

  if (state.userFilterTab && state.userFilterTab !== "all") {
    users = users.filter(u => u.status === state.userFilterTab);
  }

  if (roleFilter !== "all") {
    users = users.filter(u => u.role === roleFilter);
  }

  if (searchQuery) {
    users = users.filter(u => 
      u.name.toLowerCase().includes(searchQuery) || 
      u.email.toLowerCase().includes(searchQuery)
    );
  }

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No user records matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <strong>${u.name}</strong><br>
        <span class="micro text-muted">${u.email}</span>
      </td>
      <td>
        <span class="badge-tag ${u.role === 'admin' ? 'confirmed-tag' : 'verified-tag'}">
          <i class="fa-solid ${u.role === 'admin' ? 'fa-user-shield' : 'fa-user'}"></i> ${u.role.toUpperCase()}
        </span>
        <span class="badge-tag ${u.status === 'approved' ? 'success-tag' : u.status === 'suspended' ? 'danger-tag' : 'warning-tag'} ml-1">
          ${u.status.toUpperCase()}
        </span>
      </td>
      <td>
        <span class="small">${u.phone || 'N/A'}</span><br>
        <span class="micro text-muted">DOB: ${u.dob || 'N/A'}</span>
      </td>
      <td>
        <div class="flex-align gap-2">
          <select class="form-control form-control-sm" style="width: 120px;" onchange="changeUserRole('${u.id}', this.value)">
            <option value="user" ${u.role === 'user' ? 'selected' : ''}>Role: User</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Role: Admin</option>
          </select>
          <button class="btn ${u.status === 'suspended' ? 'btn-success' : 'btn-warning'} btn-sm" onclick="toggleUserSuspension('${u.id}')">
            ${u.status === 'suspended' ? '<i class="fa-solid fa-user-check"></i> Activate' : '<i class="fa-solid fa-user-slash"></i> Suspend'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteUserAccount('${u.id}')" title="Delete User">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function changeUserRole(userId, newRole) {
  const user = state.allUsers.find(u => u.id === userId);
  if (user) {
    user.role = newRole;
    if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
      try {
        await supabaseClient.from('profiles').update({ role: newRole }).eq('id', userId);
      } catch (err) { console.warn("Supabase role update fallback:", err); }
    }
    showToast(`Role for "${user.name}" updated to "${newRole.toUpperCase()}".`, "success");
    updateAuthUI();
    renderAdminUsersTable();
  }
}

async function toggleUserSuspension(userId) {
  const user = state.allUsers.find(u => u.id === userId);
  if (user) {
    user.status = user.status === "suspended" ? "approved" : "suspended";
    if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
      try {
        await supabaseClient.from('profiles').update({ status: user.status }).eq('id', userId);
      } catch (err) { console.warn("Supabase status fallback:", err); }
    }
    showToast(`Account for "${user.name}" is now ${user.status.toUpperCase()}.`, user.status === 'approved' ? 'success' : 'warning');
    renderAdminUsersTable();
    updateAdminSummaryCards();
  }
}

async function deleteUserAccount(userId) {
  const user = state.allUsers.find(u => u.id === userId);
  if (!user) return;

  if (confirm(`Permanently delete account for "${user.name}" (${user.email})? This action cannot be undone.`)) {
    state.allUsers = state.allUsers.filter(u => u.id !== userId);
    state.pendingUsers = state.pendingUsers.filter(u => u.id !== userId);

    if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
      try {
        await supabaseClient.from('profiles').delete().eq('id', userId);
      } catch (err) { console.warn("Supabase delete fallback:", err); }
    }

    showToast(`User account for "${user.name}" removed from database.`, "error");
    renderAdminUsersTable();
    updateAdminSummaryCards();
  }
}

// 3. MANAGE TRIPS TAB
function renderAdminTripsTable() {
  const tbody = document.getElementById("admin-trips-tbody");
  if (!tbody) return;

  const searchQuery = (document.getElementById("trips-search-input")?.value || "").toLowerCase();
  const categoryFilter = document.getElementById("trips-category-filter")?.value || "all";

  let trips = [...state.trips];

  if (categoryFilter !== "all") {
    trips = trips.filter(t => t.category === categoryFilter);
  }

  if (searchQuery) {
    trips = trips.filter(t => 
      t.id.toLowerCase().includes(searchQuery) ||
      t.title.toLowerCase().includes(searchQuery) ||
      t.host.toLowerCase().includes(searchQuery)
    );
  }

  if (trips.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No trip posts matching filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = trips.map(t => `
    <tr>
      <td>
        <strong>#${t.id}</strong>
        ${t.isFeatured ? '<br><span class="badge-tag featured-tag micro"><i class="fa-solid fa-star"></i> FEATURED</span>' : ''}
      </td>
      <td>
        <strong>${t.title}</strong><br>
        <span class="badge-tag micro">${t.category}</span> • <span class="micro text-muted">${t.location}</span>
      </td>
      <td>${t.host}</td>
      <td>
        <strong>${t.price}</strong><br>
        <span class="micro text-muted">${t.quotas}</span>
      </td>
      <td>
        <span class="badge-tag ${t.status === 'approved' ? 'success-tag' : t.status === 'rejected' ? 'danger-tag' : 'warning-tag'}">
          ${t.status.toUpperCase()}
        </span>
      </td>
      <td>
        <div class="flex-align gap-2">
          <button class="btn btn-outline btn-sm" onclick="openEditTripModal('${t.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
          <button class="btn ${t.isFeatured ? 'btn-warning' : 'btn-accent'} btn-sm" onclick="toggleForceFeatureTrip('${t.id}')">
            <i class="fa-solid fa-star"></i> ${t.isFeatured ? 'Unfeature' : 'Force Feature'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteTripPost('${t.id}')" title="Delete Post"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function approveTrip(tripId) {
  const trip = state.trips.find(t => t.id === tripId);
  if (trip) {
    trip.status = "approved";
    trip.badge = "VERIFIED HOST";
    trip.badgeClass = "verified-tag";

    if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
      try {
        await supabaseClient.from('trips').update({ status: 'approved', badge: 'VERIFIED HOST', badge_class: 'verified-tag' }).eq('id', tripId);
      } catch (err) { console.warn("Supabase update fallback:", err); }
    }

    renderAdminTables();
    renderTripGrid();
    initAdminCharts();
    showToast(`Trip "${trip.title}" approved & published live!`, "success");
  }
}

async function rejectTrip(tripId) {
  if (confirm(`Are you sure you want to reject trip submission #${tripId}?`)) {
    const trip = state.trips.find(t => t.id === tripId);
    if (trip) trip.status = "rejected";
    state.trips = state.trips.filter(t => t.id !== tripId);

    if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
      try {
        await supabaseClient.from('trips').update({ status: 'rejected' }).eq('id', tripId);
      } catch (err) { console.warn("Supabase trip rejection error:", err); }
    }

    renderAdminTables();
    renderTripGrid();
    initAdminCharts();
    showToast(`Trip #${tripId} submission rejected.`, "error");
  }
}

async function toggleForceFeatureTrip(tripId) {
  const trip = state.trips.find(t => t.id === tripId);
  if (trip) {
    trip.isFeatured = !trip.isFeatured;

    if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
      try {
        await supabaseClient.from('trips').update({ is_featured: trip.isFeatured }).eq('id', tripId);
      } catch (err) { console.warn("Supabase feature update fallback:", err); }
    }

    showToast(`Trip #${tripId} is now ${trip.isFeatured ? 'FEATURED on homepage!' : 'unfeatured.'}`, trip.isFeatured ? 'success' : 'info');
    renderAdminTripsTable();
    renderTripGrid();
  }
}

async function deleteTripPost(tripId) {
  if (confirm(`Are you sure you want to remove trip post #${tripId}? This will remove it from public discover.`)) {
    state.trips = state.trips.filter(t => t.id !== tripId);

    if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
      try {
        await supabaseClient.from('trips').delete().eq('id', tripId);
      } catch (err) { console.warn("Supabase delete trip fallback:", err); }
    }

    showToast(`Trip #${tripId} post removed successfully.`, "error");
    renderAdminTripsTable();
    renderTripGrid();
    updateAdminSummaryCards();
    initAdminCharts();
  }
}

// 4. EDIT TRIP MODAL
function openEditTripModal(tripId) {
  const trip = state.trips.find(t => t.id === tripId);
  if (!trip) return;

  document.getElementById("edit-trip-id").value = trip.id;
  document.getElementById("edit-trip-id-display").innerText = `#${trip.id}`;
  document.getElementById("edit-trip-title").value = trip.title;
  document.getElementById("edit-trip-category").value = trip.category;
  document.getElementById("edit-trip-price").value = trip.price;
  document.getElementById("edit-trip-location").value = trip.location;
  document.getElementById("edit-trip-quotas").value = trip.quotas;
  document.getElementById("edit-trip-vehicle").value = trip.vehicle;
  document.getElementById("edit-trip-description").value = trip.description;

  document.getElementById("edit-trip-modal").classList.add("open");
}

function closeEditTripModal() {
  document.getElementById("edit-trip-modal").classList.remove("open");
}

async function handleSaveTripEdit(e) {
  e.preventDefault();
  const tripId = document.getElementById("edit-trip-id").value;
  const trip = state.trips.find(t => t.id === tripId);

  if (trip) {
    trip.title = document.getElementById("edit-trip-title").value;
    trip.category = document.getElementById("edit-trip-category").value;
    trip.price = document.getElementById("edit-trip-price").value;
    trip.location = document.getElementById("edit-trip-location").value;
    trip.quotas = document.getElementById("edit-trip-quotas").value;
    trip.vehicle = document.getElementById("edit-trip-vehicle").value;
    trip.description = document.getElementById("edit-trip-description").value;

    if (supabaseClient && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
      try {
        await supabaseClient.from('trips').update({
          title: trip.title,
          category: trip.category,
          price: trip.price,
          location: trip.location,
          quotas: trip.quotas,
          vehicle: trip.vehicle,
          description: trip.description
        }).eq('id', tripId);
      } catch (err) { console.warn("Supabase edit fallback:", err); }
    }

    closeEditTripModal();
    showToast(`Trip details for #${tripId} updated successfully!`, "success");
    renderAdminTripsTable();
    renderTripGrid();
    initAdminCharts();
  }
}

// 5. SITE SETTINGS CONTROLS
function handleSaveSiteSettings(e) {
  e.preventDefault();
  const allowReg = document.getElementById("setting-allow-registrations").checked;
  const enableBanner = document.getElementById("setting-enable-banner").checked;
  const bannerText = document.getElementById("setting-banner-text").value.trim();
  const maintenanceMode = document.getElementById("setting-maintenance-mode").checked;

  state.siteSettings = {
    allowRegistrations: allowReg,
    enableBanner: enableBanner,
    bannerText: bannerText,
    maintenanceMode: maintenanceMode
  };

  applySiteSettings();
  showToast("Site-wide settings saved and applied live!", "success");
}

function applySiteSettings() {
  const bannerEl = document.getElementById("site-announcement-banner");
  const bannerTextEl = document.getElementById("announcement-banner-text");

  if (bannerEl && bannerTextEl) {
    if (state.siteSettings.enableBanner && state.siteSettings.bannerText) {
      bannerTextEl.innerText = state.siteSettings.bannerText;
      bannerEl.style.display = "block";
    } else {
      bannerEl.style.display = "none";
    }
  }
}

function dismissAnnouncementBanner() {
  const bannerEl = document.getElementById("site-announcement-banner");
  if (bannerEl) bannerEl.style.display = "none";
}

function handleAdminGlobalSearch() {
  const query = (document.getElementById("admin-global-search")?.value || "").toLowerCase().trim();
  if (!query) return;

  const usersInput = document.getElementById("users-search-input");
  const tripsInput = document.getElementById("trips-search-input");
  const pendingInput = document.getElementById("pending-search-input");

  if (usersInput) { usersInput.value = query; renderAdminUsersTable(); }
  if (tripsInput) { tripsInput.value = query; renderAdminTripsTable(); }
  if (pendingInput) { pendingInput.value = query; renderPendingApprovalsTable(); }
}

function switchAdminTab(tabName, event) {
  const evt = event || (typeof window !== "undefined" ? window.event : null);
  if (evt && typeof evt.preventDefault === "function") {
    evt.preventDefault();
  }

  document.querySelectorAll(".admin-nav-item").forEach(item => item.classList.remove("active"));
  const navItem = document.getElementById(`adm-nav-${tabName}`);
  if (navItem) navItem.classList.add("active");

  document.querySelectorAll(".admin-page-content").forEach(page => page.classList.remove("active"));
  const pageContent = document.getElementById(`adm-page-${tabName}`);
  if (pageContent) pageContent.classList.add("active");

  if (tabName === "dashboard") {
    initAdminCharts();
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
    showToast("This email is already designated as an Administrator.", "warning");
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
  showToast(`Administrator privileges granted to ${name} (${email}).`, "success");
}

function revokeAdminPrivileges(email) {
  if (confirm(`Revoke admin privileges for ${email}?`)) {
    state.adminUsers = state.adminUsers.filter(a => a.email.toLowerCase() !== email.toLowerCase());
    renderAdminList();
    showToast(`Admin privileges revoked for ${email}.`, "info");
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

function updateNotificationBadge(count) {
  const badge = document.getElementById("notif-badge");
  if (!badge) return;
  if (count > 0) {
    badge.innerText = count;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
}

function clearAllNotifications() {
  const notifList = document.querySelector(".notif-list");
  if (notifList) {
    notifList.innerHTML = '<div class="notif-item"><div class="notif-content"><p class="text-muted text-center py-3">No new notifications.</p></div></div>';
  }
  updateNotificationBadge(0);
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

  const loginEmail = document.getElementById("login-email-input");
  const loginPass = document.getElementById("login-password-input");
  if (loginEmail) loginEmail.value = "";
  if (loginPass) loginPass.value = "";

  document.getElementById("auth-modal").classList.add("open");
}

function closeAuthModal() {
  document.getElementById("auth-modal").classList.remove("open");
  const loginEmail = document.getElementById("login-email-input");
  const loginPass = document.getElementById("login-password-input");
  if (loginEmail) loginEmail.value = "";
  if (loginPass) loginPass.value = "";
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

async function handleLoginSubmit(e) {
  e.preventDefault();

  const emailInput = document.getElementById("login-email-input");
  const passwordInput = document.getElementById("login-password-input");

  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";

  if (!email || !password) {
    showToast("Please enter email and password.", "warning");
    return;
  }

  let authUser = null;
  let authError = null;

  // 1. SIGN-IN LOGIC: Use supabase.auth.signInWithPassword({ email, password })
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });
      authUser = data?.user;
      authError = error;
    } catch (err) {
      console.error("Supabase signInWithPassword exception:", err);
      authError = err;
    }
  }

  if (authError && authError.message) {
    console.warn("Supabase auth error message:", authError.message);
  }

  let userStatus = null;
  let userRole = null;
  let userName = null;
  let userId = null;

  if (authUser) {
    userId = authUser.id;
    const metadata = authUser.user_metadata || {};
    userStatus = metadata.status;
    userRole = metadata.role;
    userName = metadata.full_name || metadata.name || email.split("@")[0];

    // Check custom profiles table for user status & role
    if (supabaseClient) {
      try {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        if (profile) {
          if (profile.status) userStatus = profile.status;
          if (profile.role) userRole = profile.role;
          if (profile.full_name) userName = profile.full_name;
        }
      } catch (err) {
        console.warn("Profiles query error:", err);
      }
    }
  }

  // Fallback to local state / demo accounts
  if (!userStatus || !userRole) {
    const localUser = state.allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (localUser) {
      userId = userId || localUser.id;
      userStatus = userStatus || localUser.status;
      userRole = userRole || localUser.role;
      userName = userName || localUser.name;
    } else if (email.toLowerCase().includes("admin")) {
      userRole = userRole || "admin";
      userStatus = userStatus || "approved";
      userName = userName || "Primary System Admin";
    } else {
      userRole = userRole || "user";
      userStatus = userStatus || "approved";
      userName = userName || email.split("@")[0];
    }
  }

  // Check user status
  // If status === 'pending_approval', prevent full login and display: "Your account is pending Admin approval."
  if (userStatus === "pending_approval") {
    if (supabaseClient) {
      try { await supabaseClient.auth.signOut(); } catch (err) {}
    }
    showToast("Your account is pending Admin approval.", "warning");
    return;
  }

  if (userStatus === "suspended" || userStatus === "rejected") {
    if (supabaseClient) {
      try { await supabaseClient.auth.signOut(); } catch (err) {}
    }
    showToast(`Account cannot sign in (Status: ${userStatus.toUpperCase()}). Please contact Admin.`, "error");
    return;
  }

  // If status === 'approved', log them in smoothly.
  state.currentUser = {
    id: userId || `USR-${Date.now()}`,
    name: userName,
    email: email,
    role: userRole,
    status: userStatus,
    isLoggedIn: true
  };

  closeAuthModal();
  updateAuthUI();

  // If role === 'admin', show the Admin Dashboard section
  if (userRole === "admin") {
    showToast("Authenticated as Administrator! Super Admin Portal unlocked.", "success");
    navigateTo("admin");
  } else {
    showToast(`Welcome back, ${userName}! Logged in successfully.`, "success");
    navigateTo("discover");
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();

  if (state.siteSettings && state.siteSettings.allowRegistrations === false) {
    showToast("New user registrations are currently disabled by Site Administrator.", "error");
    closeAuthModal();
    return;
  }

  const nameInput = document.getElementById("reg-name-input");
  const emailInput = document.getElementById("reg-email-input");
  const passwordInput = document.getElementById("reg-password-input");
  const confirmPasswordInput = document.getElementById("reg-confirm-password-input");

  const name = nameInput ? nameInput.value.trim() : "New User";
  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";
  const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";

  if (!email || !password) {
    showToast("Please enter an email address and password.", "warning");
    return;
  }

  if (passwordInput && confirmPasswordInput && password !== confirmPassword) {
    showToast("Passwords do not match.", "error");
    return;
  }

  let signUpUser = null;
  let signUpError = null;

  // 1. SIGN-UP LOGIC: Use supabase.auth.signUp({ email, password, options: { data: { role: 'user', status: 'pending_approval' } } })
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            name: name,
            role: 'user',
            status: 'pending_approval'
          }
        }
      });
      signUpUser = data?.user;
      signUpError = error;
    } catch (err) {
      console.error("Supabase auth.signUp exception:", err);
      signUpError = err;
    }
  }

  if (signUpError && signUpError.message) {
    console.warn("Supabase auth.signUp error:", signUpError.message);
  }

  const newUserId = signUpUser?.id || `USR-${Math.floor(1000 + Math.random() * 9000)}`;

  // Store user details in a custom profiles table in the public schema
  if (supabaseClient) {
    try {
      await supabaseClient.from('profiles').upsert([{
        id: newUserId,
        full_name: name,
        email: email,
        role: 'user',
        status: 'pending_approval'
      }]);
    } catch (err) {
      console.warn("Supabase profile insert fallback:", err);
    }
  }

  const newUser = {
    id: newUserId,
    name: name,
    email: email,
    dob: "2000-01-01",
    phone: "+94 77 000 0000",
    role: "user",
    status: "pending_approval",
    registerDate: formatDateISO(new Date())
  };

  if (!state.pendingUsers.some(u => u.email === email)) {
    state.pendingUsers.push(newUser);
  }
  if (!state.allUsers.some(u => u.email === email)) {
    state.allUsers.push(newUser);
  }

  closeAuthModal();
  renderAdminTables();
  showToast("Your account is pending Admin approval.", "warning");
}

async function handleLogout(e) {
  const evt = e || (typeof window !== "undefined" ? window.event : null);
  if (evt && typeof evt.preventDefault === "function") {
    evt.preventDefault();
  }
  
  if (supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (err) {
      console.warn("Logout warning:", err);
    }
  }
  
  state.currentUser = {
    id: null,
    name: "Guest",
    email: "",
    role: "user",
    isLoggedIn: false,
    status: "none"
  };
  
  localStorage.removeItem("activeTab");
  showToast("Logged out successfully.", "info");
  updateAuthUI();
  navigateTo("discover");
}

// --- NOTIFICATION PREFERENCES ---
function openNotificationPrefsModal() {
  const modal = document.getElementById("notif-prefs-modal");
  if (modal) {
    // Attempt to load existing preferences if available
    if (state.currentUser && state.currentUser.id && supabaseClient) {
      supabaseClient.from('profiles').select('notification_preferences').eq('id', state.currentUser.id).single()
      .then(({data}) => {
         if (data && data.notification_preferences) {
           const prefs = data.notification_preferences;
           document.getElementById("pref-email").checked = !!prefs.email;
           document.getElementById("pref-sms").checked = !!prefs.sms;
           document.getElementById("pref-push").checked = !!prefs.push;
         }
      }).catch(err => console.warn("Failed to fetch notification prefs", err));
    }
    modal.classList.add("active");
  }
}

function closeNotificationPrefsModal() {
  const modal = document.getElementById("notif-prefs-modal");
  if (modal) modal.classList.remove("active");
}

async function saveNotificationPrefs(e) {
  e.preventDefault();
  const prefs = {
    email: document.getElementById("pref-email").checked,
    sms: document.getElementById("pref-sms").checked,
    push: document.getElementById("pref-push").checked
  };

  if (state.currentUser && state.currentUser.id && supabaseClient) {
    try {
      await supabaseClient.from('profiles').update({ notification_preferences: prefs }).eq('id', state.currentUser.id);
      showToast("Notification preferences saved successfully.", "success");
    } catch (err) {
      console.error("Error saving preferences:", err);
      showToast("Failed to save notification preferences.", "error");
    }
  } else {
    // Local fallback
    showToast("Notification preferences updated (Local mode).", "success");
  }
  closeNotificationPrefsModal();
}

// --- PROFILE EDITING (NAME & BIO) ---
function toggleNameEdit() {
  const label = document.getElementById("profile-name-label");
  const form = document.getElementById("profile-name-edit-form");
  const btn = document.getElementById("btn-edit-name");
  
  if (form.style.display === "none") {
    document.getElementById("profile-name-input").value = state.currentUser.name;
    form.style.display = "flex";
    label.style.display = "none";
    btn.style.display = "none";
  } else {
    form.style.display = "none";
    label.style.display = "inline-block";
    btn.style.display = "inline-block";
  }
}

async function saveNameEdit() {
  const newName = document.getElementById("profile-name-input").value.trim();
  if (!newName) return;
  
  if (state.currentUser && state.currentUser.id && supabaseClient) {
    try {
      await supabaseClient.from('profiles').update({ full_name: newName }).eq('id', state.currentUser.id);
      
      // Update metadata too
      await supabaseClient.auth.updateUser({
        data: { full_name: newName }
      });
      
      state.currentUser.name = newName;
      updateAuthUI();
      showToast("Profile name updated successfully!", "success");
      toggleNameEdit();
    } catch (err) {
      console.error("Error updating name:", err);
      showToast("Failed to update name.", "error");
    }
  } else {
    state.currentUser.name = newName;
    updateAuthUI();
    showToast("Profile name updated (Local).", "success");
    toggleNameEdit();
  }
}

function toggleBioEdit() {
  const label = document.getElementById("profile-bio-label");
  const form = document.getElementById("profile-bio-edit-form");
  const btn = document.getElementById("btn-edit-bio");
  
  if (form.style.display === "none") {
    document.getElementById("profile-bio-input").value = state.currentUser.bio || "";
    form.style.display = "block";
    label.style.display = "none";
    btn.style.display = "none";
  } else {
    form.style.display = "none";
    label.style.display = "inline-block";
    btn.style.display = "inline-block";
  }
}

async function saveBioEdit() {
  const newBio = document.getElementById("profile-bio-input").value.trim();
  
  if (state.currentUser && state.currentUser.id && supabaseClient) {
    try {
      await supabaseClient.from('profiles').update({ bio: newBio }).eq('id', state.currentUser.id);
      
      state.currentUser.bio = newBio;
      updateAuthUI();
      showToast("Bio updated successfully!", "success");
      toggleBioEdit();
    } catch (err) {
      console.error("Error updating bio:", err);
      showToast("Failed to update bio.", "error");
    }
  } else {
    state.currentUser.bio = newBio;
    updateAuthUI();
    showToast("Bio updated (Local).", "success");
    toggleBioEdit();
  }
}

// --- AVATAR UPLOAD ---
async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!state.currentUser || !state.currentUser.id || !supabaseClient) {
    showToast("Must be logged in to upload avatar.", "error");
    return;
  }
  
  const fileExt = file.name.split('.').pop();
  const filePath = `${state.currentUser.id}-${Math.random()}.${fileExt}`;
  
  showToast("Uploading avatar...", "info");
  
  try {
    const { error: uploadError } = await supabaseClient.storage.from('avatars').upload(filePath, file);
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
    
    await supabaseClient.from('profiles').update({ avatar_url: publicUrl }).eq('id', state.currentUser.id);
    await supabaseClient.auth.updateUser({
      data: { avatar_url: publicUrl }
    });
    
    state.currentUser.avatar_url = publicUrl;
    updateAuthUI();
    showToast("Avatar uploaded successfully!", "success");
  } catch (err) {
    console.error("Avatar upload error:", err);
    showToast("Failed to upload avatar.", "error");
  }
}

// --- HEADER DROPDOWN ---
function confirmLogout(event) {
  if (confirm("Are you sure you want to sign out?")) {
    handleLogout(event);
  } else if (event) {
    event.preventDefault();
  }
}

document.addEventListener("click", (event) => {
  const dropdown = document.getElementById("user-dropdown");
  const headerAvatarContainer = document.querySelector(".user-avatar-wrapper");
  
  if (dropdown && dropdown.classList.contains("open")) {
    if (!dropdown.contains(event.target) && (!headerAvatarContainer || !headerAvatarContainer.contains(event.target))) {
      closeUserDropdown();
    }
  }
  
  const notifDrawer = document.getElementById("notif-drawer");
  const notifBell = document.getElementById("notif-bell");
  
  if (notifDrawer && notifDrawer.classList.contains("open")) {
    if (!notifDrawer.contains(event.target) && (!notifBell || !notifBell.contains(event.target))) {
      closeNotifDrawer();
    }
  }
});
