
async function checkAuth() {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/user`, { credentials: 'include' });
    if (response.ok) {
      const data = await response.json();
      document.getElementById('login-link').style.display = 'none';
      document.getElementById('user-info').style.display = 'inline-block';
      document.getElementById('user-greeting').textContent = `Welcome, ${data.user.username}#${data.user.discriminator}`;
    } else {
      document.getElementById('login-link').style.display = 'inline';
      document.getElementById('user-info').style.display = 'none';
      Swal.fire({
        title: 'Not Logged In',
        text: 'Please log in to view your dashboard.',
        icon: 'warning',
        confirmButtonColor: '#1e40af'
      }).then(() => {
        window.location.href = '/index.html';
      });
    }
  } catch (error) {
    console.error('Error checking auth:', error);
    Swal.fire({
      title: 'Error',
      text: 'Failed to check authentication status.',
      icon: 'error',
      confirmButtonColor: '#1e40af'
    });
  }
}

async function loadBookings() {
  try {
    const response = await fetch(`${BACKEND_URL}/bookings`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    const bookings = await response.json();

    const grid = document.getElementById('bookings-grid');
    grid.innerHTML = '';
    if (bookings.length === 0) {
      grid.innerHTML = '<p>You have no bookings yet.</p>';
      return;
    }
    bookings.forEach(booking => {
      const flight = booking.flight;
      const card = document.createElement('div');
      card.className = 'booking-card';
      card.innerHTML = `
        <h3>Flight ${flight.id}</h3>
        <p><strong>Confirmation Code:</strong> ${booking.id}</p>
        <p>${flight.from} to ${flight.to}<br>${flight.aircraft}<br>Departure: ${new Date(flight.departure).toLocaleString()}</p>
        <p><strong>Booked On:</strong> ${new Date(booking.bookedAt).toLocaleString()}</p>
      `;
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading bookings:', error);
    Swal.fire({
      title: 'Error',
      text: 'Failed to load your bookings. Please try again.',
      icon: 'error',
      confirmButtonColor: '#1e40af'
    });
  }
}

document.getElementById('login-link').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = `${BACKEND_URL}/auth/discord`;
});

document.getElementById('logout-link').addEventListener('click', async (e) => {
  e.preventDefault();
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

window.onload = () => {
  checkAuth().then(() => {
    loadBookings();
  });
};