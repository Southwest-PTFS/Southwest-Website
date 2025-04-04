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
      return data;
    } else {
      console.log('User not authenticated, status:', response.status);
      document.getElementById('login-link').style.display = 'inline';
      document.getElementById('user-dropdown').style.display = 'none';
      Swal.fire({
        title: 'Not Logged In',
        text: 'Please log in to check in.',
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

// Function to get query parameter
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Enable/disable check-in button based on checkbox
const agreeCheckbox = document.getElementById('agree-regulations');
const checkinButton = document.getElementById('checkin-button');

agreeCheckbox.addEventListener('change', () => {
  checkinButton.disabled = !agreeCheckbox.checked;
  console.log('Checkbox changed, button disabled:', checkinButton.disabled);
});

// Show loading animation
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

// Handle check-in
document.getElementById('checkin-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const confirmationNumber = document.getElementById('confirmation').value;

  showLoading();
  try {
    const response = await fetch(`${BACKEND_URL}/checkin/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmationNumber }),
      credentials: 'include'
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const img = document.getElementById('boarding-pass-image');
      img.src = url;
      document.getElementById('download-link').href = url;
      document.getElementById('boarding-pass').style.display = 'block';
      hideLoading();
      Swal.fire({
        title: 'Check-In Successful!',
        text: 'Your boarding pass is ready.',
        icon: 'success',
        confirmButtonColor: '#1e40af'
      });
    } else {
      const data = await response.json();
      hideLoading();
      Swal.fire({
        title: 'Error',
        text: data.error,
        icon: 'error',
        confirmButtonColor: '#1e40af'
      });
    }
  } catch (error) {
    console.error('Error checking in:', error);
    hideLoading();
    Swal.fire({
      title: 'Error',
      text: 'Failed to check in. Please try again.',
      icon: 'error',
      confirmButtonColor: '#1e40af'
    });
  }
});

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
    // Populate confirmation number from query parameter
    const confirmationNumber = getQueryParam('confirmationNumber');
    console.log('Confirmation number from URL:', confirmationNumber);
    if (confirmationNumber) {
      const confirmationInput = document.getElementById('confirmation');
      confirmationInput.value = confirmationNumber;
      console.log('Set confirmation input value to:', confirmationInput.value);
    }
  }
});