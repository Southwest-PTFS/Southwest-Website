

  const BACKEND_URL = 'https://api.awdevsoftware.org'; // Adjust if running locally

  async function checkAuth() {
    console.log('Checking authentication status...');
    try {
      const response = await fetch(`${BACKEND_URL}/auth/user`, {
        credentials: 'include', // Ensure cookies/session are sent
        headers: { 'Accept': 'application/json' }
      });
      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('User data:', data);
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('user-dropdown').style.display = 'inline-block';
        document.getElementById('user-info').textContent = `${data.user.username}#${data.user.discriminator}`;
      } else {
        console.log('User not authenticated, showing login link');
        document.getElementById('login-link').style.display = 'inline';
        document.getElementById('user-dropdown').style.display = 'none';
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Fallback to showing login link on error
      document.getElementById('login-link').style.display = 'inline';
      document.getElementById('user-dropdown').style.display = 'none';
    }
  }

  document.getElementById('login-link').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Login link clicked, redirecting to Discord auth');
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
      } else {
        throw new Error('Logout failed');
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

  // Ensure DOM is fully loaded before checking auth
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initiating auth check');
    // Add a slight delay to ensure UI is visible initially
    setTimeout(checkAuth, 500); // 500ms delay for debugging visibility
  });
