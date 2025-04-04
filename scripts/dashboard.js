
async function checkAuth() {
  console.log('Checking authentication status...');
  try {
    const response = await fetch(`${BACKEND_URL}/auth/user`, { credentials: 'include', headers: { 'Accept': 'application/json' } });
    console.log('Auth response status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('User data:', data);
      document.getElementById('login-link').style.display = 'none';
      document.getElementById('user-dropdown').style.display = 'inline-block';
      document.getElementById('user-info').textContent = `${data.user.username}#${data.user.discriminator}`;
      document.getElementById('user-profile').style.display = 'flex';
      document.getElementById('user-avatar').src = data.user.avatar ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png` : 'https://via.placeholder.com/100';
      document.getElementById('user-greeting').textContent = `Hello, ${data.user.username}#${data.user.discriminator}!`;
      return data;
    } else {
      console.log('User not authenticated');
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
    console.error('Error checking auth:', error);
    document.getElementById('login-link').style.display = 'inline';
    document.getElementById('user-dropdown').style.display = 'none';
    return null;
  }
}

async function loadBookings() {
  const grid = document.getElementById('checkin-flights-grid');
  const noFlightsMessage = document.getElementById('no-flights');
  const loadingFlights = document.getElementById('loading-flights');
  
  console.log('Loading bookings...');
  loadingFlights.style.display = 'block'; // Show loading spinner
  grid.innerHTML = ''; // Clear previous content
  noFlightsMessage.style.display = 'none';

  try {
    const response = await fetch(`${BACKEND_URL}/bookings`, { credentials: 'include' });
    console.log('Bookings response status:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }
    const bookings = await response.json();
    console.log('Bookings data:', bookings);

    // Filter check-in ready flights
    const checkinReadyBookings = bookings.filter(booking => {
      const departureTime = new Date(booking.flight.departure);
      const now = new Date();
      const timeDiff = departureTime - now;
      return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000 && !booking.boardingPosition;
    });
    console.log('Check-in ready bookings:', checkinReadyBookings);

    if (checkinReadyBookings.length === 0) {
      noFlightsMessage.style.display = 'block';
    } else {
      checkinReadyBookings.forEach(booking => {
        const flight = booking.flight;
        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
          <h3 class="font-swabold">Flight #${flight.id}</h3>
          <p><strong>From:</strong> ${flight.from}</p>
          <p><strong>To:</strong> ${flight.to}</p>
          <p><strong>Departure:</strong> ${new Date(flight.departure).toLocaleString()}</p>
          <p><strong>Aircraft:</strong> ${flight.aircraft}</p>
          <a href="/checkin.html?confirmationNumber=${booking.confirmationNumber}" class="select-button">Check In Now</a>
        `;
        grid.appendChild(card);
      });
    }
  } catch (error) {
    console.error('Error loading bookings:', error);
    noFlightsMessage.textContent = 'Error loading flights. Please try again later.';
    noFlightsMessage.style.display = 'block';
  } finally {
    loadingFlights.style.display = 'none'; // Hide loading spinner
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