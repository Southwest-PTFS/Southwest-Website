async function checkAuth() {
  console.log('Checking authentication status...');
  try {
    const response = await fetch(`${BACKEND_URL}/auth/user`, { 
      credentials: 'include', 
      headers: { 'Accept': 'application/json' }
    });
    console.log('Auth response status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('User data:', data);
      document.getElementById('login-link').style.display = 'none';
      document.getElementById('user-dropdown').style.display = 'inline-block';
      document.getElementById('user-info').textContent = `${data.user.username}#${data.user.discriminator}`;
      document.getElementById('user-greeting').textContent = `Hello, ${data.user.username}#${data.user.discriminator}!`;
      return data;
    } else {
      console.log('User not authenticated, status:', response.status);
      document.getElementById('login-link').style.display = 'inline';
      document.getElementById('user-dropdown').style.display = 'none';
      Swal.fire({
        title: 'Not Logged In',
        text: 'Please log in to view your dashboard.',
        icon: 'warning',
        confirmButtonColor: '#1e40af'
      }).then(() => {
        window.location.href = '/index.html';
      });
      return null;
    }
  } catch (error) {
    console.error('Error checking auth:', error.message);
    document.getElementById('login-link').style.display = 'inline';
    document.getElementById('user-dropdown').style.display = 'none';
    return null;
  }
}

async function loadBookings() {
  const grid = document.getElementById('checkin-flights-grid');
  const noFlightsMessage = document.getElementById('no-flights');
  const loadingFlights = document.getElementById('loading-flights');
  
  console.log('Fetching bookings from:', `${BACKEND_URL}/bookings`);
  loadingFlights.style.display = 'block';
  grid.innerHTML = '';
  noFlightsMessage.style.display = 'none';

  try {
    const bookingsResponse = await fetch(`${BACKEND_URL}/bookings`, { 
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    console.log('Bookings fetch status:', bookingsResponse.status);
    if (!bookingsResponse.ok) {
      throw new Error(`Bookings fetch failed with status ${bookingsResponse.status}`);
    }
    const bookings = await bookingsResponse.json();
    console.log('Raw bookings response:', bookings);

    const flightsResponse = await fetch(`${BACKEND_URL}/flights`, { 
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    console.log('Flights fetch status:', flightsResponse.status);
    if (!flightsResponse.ok) {
      throw new Error(`Flights fetch failed with status ${flightsResponse.status}`);
    }
    const flights = await flightsResponse.json();
    console.log('Raw flights response:', flights);

    const enrichedBookings = bookings.map(booking => {
      const flight = flights.find(f => f.id === booking.flightId) || {};
      return { ...booking, flight };
    });
    console.log('Enriched bookings:', enrichedBookings);

    const checkinReadyBookings = enrichedBookings.filter(booking => {
      const departureTime = new Date(booking.flight.departure);
      const now = new Date();
      const timeDiff = departureTime - now;
      return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000 && !booking.boardingPosition;
    });
    console.log('Check-in ready bookings:', checkinReadyBookings);

    if (checkinReadyBookings.length === 0) {
      console.log('No check-in ready bookings');
      noFlightsMessage.style.display = 'block';
    } else {
      console.log(`Rendering ${checkinReadyBookings.length} bookings`);
      checkinReadyBookings.forEach((booking, index) => {
        const flight = booking.flight || { id: 'N/A', from: 'Unknown', to: 'Unknown', departure: 'N/A', aircraft: 'N/A' };
        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
          <h3 class="font-swabold">Flight #${flight.id}</h3>
          <p><strong>From:</strong> ${flight.from}</p>
          <p><strong>To:</strong> ${flight.to}</p>
          <p><strong>Departure:</strong> ${new Date(flight.departure).toLocaleString()}</p>
          <p><strong>Aircraft:</strong> ${flight.aircraft}</p>
          <p><strong>Confirmation:</strong> ${booking.confirmationNumber}</p>
          <a href="/checkin.html?confirmationNumber=${booking.confirmationNumber}" class="select-button">Check In Now</a>
        `;
        console.log(`Appending booking card ${index + 1}:`, card.outerHTML);
        grid.appendChild(card);
      });
      console.log('Bookings grid after render:', grid.innerHTML);
    }
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    noFlightsMessage.textContent = `Error loading flights: ${error.message}. Please try again later.`;
    noFlightsMessage.style.display = 'block';
  } finally {
    loadingFlights.style.display = 'none';
  }
}

async function loadRewardsPoints() {
  try {
    const response = await fetch(`${BACKEND_URL}/rewards`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch rewards points');
    }
    const data = await response.json();
    document.getElementById('rewards-points').textContent = data.points.toLocaleString();
  } catch (error) {
    console.error('Error loading rewards points:', error);
    document.getElementById('rewards-points').textContent = '0';
  }
}

document.getElementById('login-link').addEventListener('click', (e) => {
  e.preventDefault();
  console.log('Login link clicked');
  window.location.href = `${BACKEND_URL}/auth/discord`;
});

document.getElementById('logout-link').addEventListener('click', async (e) => {
  e.preventDefault();
  console.log('Logout link clicked');
  try {
    const response = await fetch(`${BACKEND_URL}/auth/logout`, { credentials: 'include' });
    if (response.ok) {
      Swal.fire({
        title: 'Logged Out',
        text: 'You have been logged out successfully.',
        icon: 'success',
        confirmButtonColor: '#1e40af'
      }).then(() => {
        window.location.href = '/index.html';
      });
    }
  } catch (error) {
    console.error('Error logging out:', error);
    Swal.fire({
      title: 'Error',
      text: 'Failed to log out. Please try again.',
      icon: 'error',
      confirmButtonColor: '#1e40af'
    });
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, checking auth');
  const userData = await checkAuth();
  if (userData) {
    console.log('User authenticated, loading dashboard data');
    await Promise.all([loadBookings(), loadRewardsPoints()]);
  }
});