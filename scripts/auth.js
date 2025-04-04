const BACKEND_URL = 'https://api.awdevsoftware.org'; // Adjust if running locally

  async function checkAuth() {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/user`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('user-dropdown').style.display = 'inline-block';
        document.getElementById('user-info').textContent = `${data.user.username}#${data.user.discriminator}`;
      } else {
        document.getElementById('login-link').style.display = 'inline';
        document.getElementById('user-dropdown').style.display = 'none';
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      document.getElementById('login-link').style.display = 'inline';
      document.getElementById('user-dropdown').style.display = 'none';
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

  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
  });