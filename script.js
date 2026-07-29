/* -------------------------------------------------------------------------- */
/* TRIPBUDDY - MASTER JAVASCRIPT ENGINE                              */
/* Interactivity, SPA View Routing, Data State, Filters, Modals & Admin Logic */
/* -------------------------------------------------------------------------- */

// --- INITIAL DATA STORE ---
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
    startDate: "Oct 12",
    endDate: "Oct 22, 2024",
    languages: "English, Sinhala",
    host: "Sarah Jenkins",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    hostBio: "Professional Yoga Instructor • 14 trips hosted",
    location: "Ubud, Indonesia",
    quotas: "2 Males, 2 Females",
    vehicle: "Private Luxury Van",
    description: "Reconnect with your inner self in the heart of Ubud. This 10-day spiritual retreat is designed for those seeking a balance between high-altitude adventure and deep meditative practices. We'll start our days with sunrise yoga overlooking the Tegallalang Rice Terrace and end them with traditional Balinese sound healing ceremonies."
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
    startDate: "Nov 05",
    endDate: "Nov 12, 2024",
    languages: "English, Italian",
    host: "Sarah Chen",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    hostBio: "Coastal photographer & sailing enthusiast",
    location: "Positano, Italy",
    quotas: "1 Male, 3 Females",
    vehicle: "Chartered Yacht & Convertible",
    description: "Cruise along Italy's breathtaking coastline, explore cliffside towns, sample authentic seafood, and swim in azure waters."
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
    startDate: "Dec 20",
    endDate: "Dec 28, 2024",
    languages: "English, German",
    host: "Mark J.",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    hostBio: "Alpine guide & winter sports expert",
    location: "Zermatt, Switzerland",
    quotas: "3 Males, 1 Female",
    vehicle: "Alpine Railway & 4x4 SUV",
    description: "High-altitude winter expedition featuring glacier walks, cozy chalets, fondue nights, and panoramic views of the Matterhorn."
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
    startDate: "Aug 15",
    endDate: "Aug 18, 2026",
    languages: "Sinhala, English",
    host: "Alex Thorne",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    hostBio: "Experienced local mountaineer",
    location: "Kandy, Sri Lanka",
    quotas: "2 Males, 2 Females",
    vehicle: "Private 4WD Jeep",
    description: "Immerse yourself in UNESCO World Heritage forest reserves. Hike through mist-covered peaks, hidden waterfalls, and remote villages."
  },
  {
    id: "WB-105",
    title: "Kyoto Zen Temple & Bamboo Tour",
    category: "Cultural",
    cover: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    price: "LKR 310,000",
    priceRaw: 310000,
    badge: "VERIFIED HOST",
    badgeClass: "verified-tag",
    days: 6,
    startDate: "Sep 10",
    endDate: "Sep 16, 2024",
    languages: "English, Japanese",
    host: "Kenji Sato",
    hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    hostBio: "Cultural historian & tea master",
    location: "Kyoto, Japan",
    quotas: "2 Males, 2 Females",
    vehicle: "Shinkansen Bullet Train & Local Metro",
    description: "Experience Japan's autumn foliage, ancient shrines, traditional tea ceremonies, and culinary tours."
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
    startDate: "Sep 01",
    endDate: "Sep 05, 2026",
    languages: "Sinhala, English",
    host: "Nipuni Silva",
    hostAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    hostBio: "Surf instructor & road trip host",
    location: "Mirissa to Ahangama, LK",
    quotas: "2 Males, 2 Females",
    vehicle: "Open Roof Beach Convertible Van",
    description: "Catch waves along Hiriketiya, whale watching in Mirissa, and sunset beach bonfires with co-travelers."
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
    role: "user", // "user" by default for normal users, "admin" for administrators
    isLoggedIn: true
  }
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();
  renderTripGrid();
  renderServicesGrid();
});

// --- ROLE-BASED AUTH & VISIBILITY CONTROL ---
function updateAuthUI() {
  const adminNav = document.getElementById("nav-admin");
  const dropdownAdmin = document.getElementById("dropdown-admin-item");
  const footerAdmin = document.getElementById("footer-admin-link");
  const roleLabel = document.getElementById("current-role-label");

  const isAdmin = state.currentUser && state.currentUser.isLoggedIn && state.currentUser.role === "admin";

  if (adminNav) {
    adminNav.style.display = isAdmin ? "inline-flex" : "none";
  }
  if (dropdownAdmin) {
    dropdownAdmin.style.display = isAdmin ? "flex" : "none";
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
      userRoleEl.innerHTML = `<span class="badge-tag confirmed-tag"><i class="fa-solid fa-user-shield"></i> Administrator</span>`;
    } else {
      userRoleEl.innerHTML = `<span class="badge-tag verified-tag"><i class="fa-solid fa-circle-check"></i> Verified Traveler</span>`;
    }
  }
}

function toggleDemoRole() {
  if (!state.currentUser) {
    state.currentUser = { name: "Alex Thorne", role: "user", isLoggedIn: true };
  }

  if (state.currentUser.role === "admin") {
    state.currentUser.role = "user";
    state.currentUser.name = "Alex Thorne";
    alert("Switched role to Regular User. The Admin Portal is now hidden and restricted.");
    if (state.activeView === "admin") {
      navigateTo("discover");
    }
  } else {
    state.currentUser.role = "admin";
    state.currentUser.name = "System Admin";
    alert("Switched role to Administrator. Admin Portal is now visible in the main header!");
  }
  updateAuthUI();
}

// --- SPA VIEW ROUTER ---
function navigateTo(viewId) {
  // Access Protection: Only users with role === 'admin' can open the admin portal view
  if (viewId === "admin") {
    if (!state.currentUser || !state.currentUser.isLoggedIn || state.currentUser.role !== "admin") {
      alert("Access Denied: You must be logged in as an Administrator to access the Admin Portal.");
      return;
    }
  }

  state.activeView = viewId;
  
  // Hide all sections
  document.querySelectorAll(".view-section").forEach(sec => sec.classList.remove("active"));
  
  // Show target section
  const targetSec = document.getElementById(`view-${viewId}`);
  if (targetSec) targetSec.classList.add("active");

  // Update Nav Links Active state
  document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
  const activeNav = document.getElementById(`nav-${viewId}`);
  if (activeNav) activeNav.classList.add("active");

  // Close any open drawers or modals
  closeNotifDrawer();
  closeUserDropdown();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- DISCOVER HUB & FILTERING ---
function renderTripGrid() {
  const container = document.getElementById("trip-cards-container");
  if (!container) return;

  const filtered = state.trips.filter(trip => {
    const matchesCat = state.selectedCategory === "all" || trip.category.toLowerCase() === state.selectedCategory.toLowerCase();
    const query = state.searchQuery.toLowerCase();
    const matchesSearch = trip.title.toLowerCase().includes(query) || trip.location.toLowerCase().includes(query) || trip.category.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const countLabel = document.getElementById("trip-count-label");
  if (countLabel) countLabel.innerText = `Showing ${filtered.length} active trips`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: white; border-radius: 16px; border: 1px solid #e2e8f0;">
        <i class="fa-solid fa-compass" style="font-size: 2.5rem; color: #94a3b8; margin-bottom: 1rem;"></i>
        <h3>No matching trips found</h3>
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
          <span><i class="fa-regular fa-calendar"></i> ${trip.startDate}</span>
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
    <span><i class="fa-regular fa-calendar-days"></i> ${trip.startDate} — ${trip.endDate}</span>
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
    const diffTime = Math.abs(end - start);
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

  // Update Profile Drafts UI
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

// --- PAYMENT MODAL & FLOW ---
function openPaymentModal() {
  document.getElementById("payment-modal").classList.add("open");
}

function closePaymentModal() {
  document.getElementById("payment-modal").classList.remove("open");
}

function openConnectPaymentFlow() {
  openPaymentModal();
}

function processPayment(e) {
  e.preventDefault();
  const submitBtn = document.getElementById("pay-submit-btn");
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Secure Payment...`;

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `Pay LKR 100.00 &rarr;`;
    closePaymentModal();

    // Check if coming from Create Trip
    const newTitle = document.getElementById("trip-title-input").value;
    if (newTitle) {
      const newTripObj = {
        id: `WB-${Math.floor(100 + Math.random() * 900)}`,
        title: newTitle,
        category: document.getElementById("category-select").value || "Adventure",
        cover: document.getElementById("image-preview").src || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        price: `LKR ${Number(document.getElementById("cost-input").value || 50000).toLocaleString()}`,
        priceRaw: Number(document.getElementById("cost-input").value || 50000),
        badge: "VERIFIED HOST",
        badgeClass: "verified-tag",
        days: 5,
        startDate: "Sep 15",
        endDate: "Sep 20, 2026",
        languages: "English, Sinhala",
        host: "Alex Thorne",
        hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        hostBio: "Verified Traveler & Host",
        location: "Sri Lanka",
        quotas: `${document.getElementById("male-quota-input").value} Males, ${document.getElementById("female-quota-input").value} Females`,
        vehicle: document.getElementById("vehicle-input").value || "SUV",
        description: document.getElementById("description-input").value || "Great trip planned."
      };

      state.trips.unshift(newTripObj);
      renderTripGrid();
      document.getElementById("create-trip-form").reset();
      alert(`Payment Successful! Your trip "${newTitle}" has been posted live.`);
      navigateTo("discover");
    } else {
      alert("Payment Successful! Connection fee verified. Direct Chat unlocked!");
      openChatModal();
    }
  }, 1200);
}

// --- DIRECT CHAT SIMULATION MODAL ---
function openChatModal() {
  document.getElementById("chat-modal").classList.add("open");
}

function closeChatModal() {
  document.getElementById("chat-modal").classList.remove("open");
}

function sendChatMessage(e) {
  e.preventDefault();
  const input = document.getElementById("chat-text-input");
  const msg = input.value.trim();

  if (msg) {
    const chatStream = document.getElementById("chat-messages");
    const msgDiv = document.createElement("div");
    msgDiv.className = "chat-msg user-msg";
    msgDiv.innerHTML = `
      <div class="msg-bubble">
        <div class="msg-meta">You • Just now</div>
        <p>${msg}</p>
      </div>
    `;
    chatStream.appendChild(msgDiv);
    chatStream.scrollTop = chatStream.scrollHeight;
    input.value = "";

    // Simulated Host Response
    setTimeout(() => {
      const replyDiv = document.createElement("div");
      replyDiv.className = "chat-msg host-msg";
      replyDiv.innerHTML = `
        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" class="chat-avatar" alt="Sarah">
        <div class="msg-bubble">
          <div class="msg-meta">Sarah • Just now</div>
          <p>Thanks for confirming! I've added you to our logistics group sheet.</p>
        </div>
      `;
      chatStream.appendChild(replyDiv);
      chatStream.scrollTop = chatStream.scrollHeight;
    }, 1000);
  }
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
  const phone = document.getElementById("kyc-phone").value;
  const nic = document.getElementById("kyc-nic").value;

  document.getElementById("profile-status-badge").className = "badge-tag verified-tag";
  document.getElementById("profile-status-badge").innerHTML = `<i class="fa-solid fa-shield-check"></i> Verified Traveler (KYC Approved)`;

  alert(`Verification Submitted Successfully! Details (NIC: ${nic}) verified by admin overseer.`);
  toggleVerificationForm();
}

function handlePasswordUpdate(e) {
  e.preventDefault();
  alert("Security Credentials Updated Successfully!");
}

// --- ADMIN CONSOLE TAB SWITCHING & ACTIONS ---
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

function approveTrip(btn) {
  const row = btn.closest("tr");
  row.querySelector("td:last-child").innerHTML = `<span class="badge-tag success-tag"><i class="fa-solid fa-check"></i> Approved</span>`;
}

function rejectTrip(btn) {
  if (confirm("Reject this trip submission?")) {
    const row = btn.closest("tr");
    row.remove();
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

// --- AUTH MODALS ---
function showAuthModal(tab = "login") {
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
      name: "System Admin",
      email: email || "admin@tripbuddy.com",
      role: "admin",
      isLoggedIn: true
    };
    alert("Welcome back, System Admin! Logged in as Administrator. Admin Portal unlocked!");
  } else {
    state.currentUser = {
      name: "Alex Thorne",
      email: email || "alex.thorne@example.com",
      role: "user",
      isLoggedIn: true
    };
    alert("Welcome back, Alex Thorne! Logged in successfully.");
  }

  updateAuthUI();
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  closeAuthModal();
  alert("Account Created Successfully! Welcome to TripBuddy.");
}
