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
      document.getElementById('user-profile').style.display = 'flex';
      document.getElementById('user-avatar').src = data.user.avatar 
        ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png?size=100` 
        : 'https://via.placeholder.com/100';
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
  const checkinGrid = document.getElementById('checkin-flights-grid');
  const noCheckinFlightsMessage = document.getElementById('no-flights');
  const loadingCheckinFlights = document.getElementById('loading-flights');
  const manageGrid = document.getElementById('manage-flights-grid');
  const noManageFlightsMessage = document.getElementById('no-manage-flights');
  const loadingManageFlights = document.getElementById('loading-manage-flights');

  if (!checkinGrid || !noCheckinFlightsMessage || !loadingCheckinFlights || 
      !manageGrid || !noManageFlightsMessage || !loadingManageFlights) {
    console.error('Required elements for loadBookings not found');
    return;
  }

  console.log('Fetching bookings from:', `${BACKEND_URL}/bookings`);
  loadingCheckinFlights.style.display = 'block';
  loadingManageFlights.style.display = 'block';
  checkinGrid.innerHTML = '';
  manageGrid.innerHTML = '';
  noCheckinFlightsMessage.style.display = 'none';
  noManageFlightsMessage.style.display = 'none';

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

    // Check-in ready bookings (future flights, not checked in)
    const checkinReadyBookings = bookings.filter(booking => {
      const departureTime = new Date(booking.flight.departure);
      const now = new Date();
      const timeDiff = departureTime - now;
      console.log(`Booking ${booking.id}: Departure ${departureTime}, Time diff: ${timeDiff / (1000 * 60 * 60)} hours, Has boardingPosition: ${!!booking.boardingPosition}`);
      return timeDiff > 0 && !booking.boardingPosition;
    });
    console.log('Check-in ready bookings:', checkinReadyBookings);

    if (checkinReadyBookings.length === 0) {
      console.log('No check-in ready bookings');
      noCheckinFlightsMessage.style.display = 'block';
    } else {
      console.log(`Rendering ${checkinReadyBookings.length} check-in ready bookings`);
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
        console.log(`Appending check-in booking card ${index + 1}:`, card.outerHTML);
        checkinGrid.appendChild(card);
      });
      console.log('Check-in bookings grid after render:', checkinGrid.innerHTML);
    }

    // All bookings for management
    console.log('Processing bookings for management section');
    if (bookings.length === 0) {
      console.log('No bookings to manage');
      noManageFlightsMessage.style.display = 'block';
    } else {
      console.log(`Rendering ${bookings.length} bookings for management`);
      bookings.forEach((booking, index) => {
        const flight = booking.flight || { id: 'N/A', from: 'Unknown', to: 'Unknown', departure: 'N/A', aircraft: 'N/A' };
        const departureTime = new Date(flight.departure);
        const now = new Date();
        const timeDiff = departureTime - now;
        const canCancel = timeDiff > 0;

        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
          <h3 class="font-swabold">Flight #${flight.id}</h3>
          <p><strong>From:</strong> ${flight.from}</p>
          <p><strong>To:</strong> ${flight.to}</p>
          <p><strong>Departure:</strong> ${new Date(flight.departure).toLocaleString()}</p>
          <p><strong>Aircraft:</strong> ${flight.aircraft}</p>
          <p><strong>Confirmation:</strong> ${booking.confirmationNumber}</p>
          ${canCancel ? `<button class="cancel-button" data-booking-id="${booking.id}">Cancel Booking</button>` : '<p class="no-data">Flight has departed</p>'}
        `;
        console.log(`Appending manage booking card ${index + 1}:`, card.outerHTML);
        manageGrid.appendChild(card);
      });
      console.log('Manage bookings grid after render:', manageGrid.innerHTML);

      // Attach cancel event listeners
      document.querySelectorAll('.cancel-button').forEach(button => {
        button.addEventListener('click', async (e) => {
          const bookingId = e.target.getAttribute('data-booking-id');
          Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to cancel this booking? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e40af',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!'
          }).then(async (result) => {
            if (result.isConfirmed) {
              try {
                const response = await fetch(`${BACKEND_URL}/bookings/cancel`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ bookingId }),
                  credentials: 'include'
                });
                if (response.ok) {
                  Swal.fire({
                    title: 'Booking Canceled',
                    text: 'Your booking has been canceled successfully.',
                    icon: 'success',
                    confirmButtonColor: '#1e40af'
                  }).then(() => {
                    loadBookings(); // Refresh the bookings
                  });
                } else {
                  const data = await response.json();
                  Swal.fire({
                    title: 'Error',
                    text: data.error || 'Failed to cancel booking.',
                    icon: 'error',
                    confirmButtonColor: '#1e40af'
                  });
                }
              } catch (error) {
                console.error('Error canceling booking:', error);
                Swal.fire({
                  title: 'Error',
                  text: 'Failed to cancel booking. Please try again.',
                  icon: 'error',
                  confirmButtonColor: '#1e40af'
                });
              }
            }
          });
        });
      });
    }
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    noCheckinFlightsMessage.textContent = `Error loading flights: ${error.message}. Please try again later.`;
    noCheckinFlightsMessage.style.display = 'block';
    noManageFlightsMessage.textContent = `Error loading bookings: ${error.message}. Please try again later.`;
    noManageFlightsMessage.style.display = 'block';
  } finally {
    loadingCheckinFlights.style.display = 'none';
    loadingManageFlights.style.display = 'none';
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

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, checking auth');
  const userData = await checkAuth();
  if (userData) {
    console.log('User authenticated, loading dashboard data');
    await Promise.all([loadBookings(), loadRewardsPoints()]);

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
  }
});