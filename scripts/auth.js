const BACKEND_URL = 'https://api.awdevsoftware.org';

async function checkAuth() {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/user`, { credentials: 'include' });
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const userInfo = document.getElementById('user-info');

    if (!loginLink || !logoutLink || !userInfo) {
      console.error('Auth elements not found in DOM');
      return;
    }

    if (response.ok) {
      const data = await response.json();
      loginLink.style.display = 'none';
      logoutLink.style.display = 'inline';
      userInfo.style.display = 'inline';
      userInfo.textContent = `Hello, ${data.user.username}#${data.user.discriminator}`;
    } else {
      loginLink.style.display = 'inline';
      logoutLink.style.display = 'none';
      userInfo.style.display = 'none';
    }
  } catch (error) {
    console.error('Error checking auth:', error);
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const userInfo = document.getElementById('user-info');
    if (loginLink && logoutLink && userInfo) {
      loginLink.style.display = 'inline';
      logoutLink.style.display = 'none';
      userInfo.style.display = 'none';
    }
  }
}

function setupLoginHandler() {
  const loginLink = document.getElementById('login-link');
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      setTimeout(() => {
        window.location.href = `${BACKEND_URL}/auth/discord`;
      }, 500);
    });
  }
}


async function setupLogoutHandler() {
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${BACKEND_URL}/auth/logout`, { credentials: 'include' });
        if (response.ok) {
          await checkAuth();
          window.location.href = '/index.html';
        }
      } catch (error) {
        console.error('Error logging out:', error);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupLoginHandler();
  setupLogoutHandler();
});