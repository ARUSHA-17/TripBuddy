const API_BASE_URL = 'https://trip-buddy-mu.vercel.app';

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Guard: if not logged in, kick back to home/login page
  if (!token || !user) {
    alert('Please log in first.');
    window.location.href = './index.html';
    return;
  }

  document.getElementById('userName').textContent = user.name;

  // Handle Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = './index.html';
  });

  // Fetch and display trips
  loadTrips(user.id);

  // Handle Create Trip Form
  const tripForm = document.getElementById('tripForm');
  tripForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const destination = document.getElementById('destination').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const notes = document.getElementById('notes').value;

    try {
      const response = await fetch(`${API_BASE_URL}/api/trips`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id, destination, startDate, endDate, notes })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Trip added successfully!');
        tripForm.reset();
        loadTrips(user.id); // Reload trip list
      } else {
        alert(data.error || 'Failed to add trip.');
      }
    } catch (err) {
      console.error('Error creating trip:', err);
    }
  });
});

async function loadTrips(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/trips/${userId}`);
    const trips = await response.json();

    const tripListDiv = document.getElementById('tripList');
    tripListDiv.innerHTML = '';

    if (trips.length === 0) {
      tripListDiv.innerHTML = '<p>No trips planned yet. Add one above!</p>';
      return;
    }

    trips.forEach(trip => {
      const tripCard = document.createElement('div');
      tripCard.className = 'trip-card';
      tripCard.style.border = '1px solid #ccc';
      tripCard.style.padding = '10px';
      tripCard.style.margin = '10px 0';
      tripCard.innerHTML = `
        <h3>📍 ${trip.destination}</h3>
        <p><strong>From:</strong> ${trip.startDate.split('T')[0]} <strong>To:</strong> ${trip.endDate.split('T')[0]}</p>
        <p><strong>Notes:</strong> ${trip.notes || 'None'}</p>
        <button onclick="deleteTrip('${trip._id}')">Delete Trip</button>
      `;
      tripListDiv.appendChild(tripCard);
    });
  } catch (err) {
    console.error('Error loading trips:', err);
  }
}

async function deleteTrip(tripId) {
  if (!confirm('Are you sure you want to delete this trip?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      location.reload(); // Refresh to update list
    } else {
      alert('Failed to delete trip.');
    }
  } catch (err) {
    console.error('Error deleting trip:', err);
  }
}
