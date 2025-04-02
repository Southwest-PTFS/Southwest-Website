async function checkAuth() {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/user`, { credentials: 'include' });
    if (response.ok) {
      const data = await response.json();
      document.getElementById('login-link').style.display = 'none';
      document.getElementById('logout-link').style.display = 'inline';
      document.getElementById('user-info').style.display = 'inline';
      document.getElementById('user-info').textContent = `Welcome, ${data.user.username}#${data.user.discriminator}`;
    } else {
      document.getElementById('login-link').style.display = 'inline';
      document.getElementById('logout-link').style.display = 'none';
      document.getElementById('user-info').style.display = 'none';
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

async function loadFlights(filters = {}) {
  try {
    const response = await fetch(`${BACKEND_URL}/flights`);
    let flights = await response.json();

    if (filters.from) flights = flights.filter(f => f.from.includes(filters.from.toUpperCase()));
    if (filters.to) flights = flights.filter(f => f.to.includes(filters.to.toUpperCase()));
    if (filters.date) flights = flights.filter(f => new Date(f.departure).toISOString().split('T')[0] === filters.date);

    const grid = document.getElementById('flights-grid');
    grid.innerHTML = '';
    flights.forEach(flight => {
      const card = document.createElement('div');
      card.className = 'flight-card';
      card.innerHTML = `
        <h3>${flight.id}</h3>
        <p>${flight.from} to ${flight.to}<br>${flight.aircraft}<br>Departure: ${new Date(flight.departure).toLocaleString()}<br>Seats: ${flight.seats - flight.booked}/${flight.seats}</p>
        <button class="select-button" onclick="showBookingModal('${flight.id}', '${flight.from}', '${flight.to}', '${flight.aircraft}', '${flight.departure}')">Select</button>
      `;
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading flights:', error);
  }
}

function showBookingModal(flightId, from, to, aircraft, departure) {
  const modal = document.getElementById('booking-modal');
  const details = document.getElementById('booking-details');
  details.innerHTML = `
    <p><strong>Flight:</strong> ${flightId}</p>
    <p><strong>From:</strong> ${from}</p>
    <p><strong>To:</strong> ${to}</p>
    <p><strong>Aircraft:</strong> ${aircraft}</p>
    <p><strong>Departure:</strong> ${new Date(departure).toLocaleString()}</p>
  `;
  modal.style.display = 'block';

  document.getElementById('confirm-booking').onclick = () => bookFlight(flightId);
  document.querySelector('.close-button').onclick = () => modal.style.display = 'none';
}

async function bookFlight(flightId) {
  try {
    const response = await fetch(`${BACKEND_URL}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flightId }),
      credentials: 'include'
    });
    const data = await response.json();
    if (response.ok) {
      alert(`Flight ${flightId} booked successfully! Booking ID: ${data.booking.id}`);
      document.getElementById('booking-modal').style.display = 'none';
      loadFlights();
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Error booking flight:', error);
    alert('Failed to book flight. Are you logged in?');
  }
}

document.getElementById('flight-search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const filters = {
    from: document.getElementById('from').value,
    to: document.getElementById('to').value,
    date: document.getElementById('date').value
  };
  loadFlights(filters);
});

document.getElementById('login-link').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = `${BACKEND_URL}/auth/discord`;
});

document.getElementById('logout-link').addEventListener('click', async (e) => {
  e.preventDefault();
  try {
    const response = await fetch(`${BACKEND_URL}/auth/logout`, { credentials: 'include' });
    if (response.ok) {
      alert('Logged out successfully');
      checkAuth();
      loadFlights();
    }
  } catch (error) {
    console.error('Error logging out:', error);
  }
});

window.onload = () => {
  checkAuth();
  loadFlights();
};