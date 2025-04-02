
// Enable/disable check-in button based on checkbox
const agreeCheckbox = document.getElementById('agree-regulations');
const checkinButton = document.getElementById('checkin-button');

agreeCheckbox.addEventListener('change', () => {
  checkinButton.disabled = !agreeCheckbox.checked;
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