// Shared application utilities
const API_BASE = '/api';

// Token and User Management
function getToken() {
  return localStorage.getItem('sps_token');
}

function setToken(token) {
  localStorage.setItem('sps_token', token);
}

function getUser() {
  const userStr = localStorage.getItem('sps_user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem('sps_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('sps_token');
  localStorage.removeItem('sps_user');
}

// Authenticated Fetch Wrapper
async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    // Handle unauthorized (session expired or unauthenticated)
    if (response.status === 401) {
      clearAuth();
      if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
        window.location.href = '/index.html?error=session_expired';
      }
    }

    return response;
  } catch (err) {
    console.error('Fetch error:', err);
    throw err;
  }
}

// User Logout
async function handleLogout() {
  try {
    await fetchWithAuth(`${API_BASE}/auth/logout`, { method: 'POST' });
  } catch (e) {
    console.warn('Logout API failed:', e);
  } finally {
    clearAuth();
    window.location.href = '/index.html';
  }
}

// Show Toast Alerts
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const bgClass =
    type === 'success' ? 'bg-success text-white' :
    type === 'danger' || type === 'error' ? 'bg-danger text-white' :
    type === 'warning' ? 'bg-warning text-dark' : 'bg-primary text-white';

  const toastId = 'toast_' + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 mb-2 shadow" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', toastHtml);
  const element = document.getElementById(toastId);
  if (window.bootstrap) {
    const toast = new bootstrap.Toast(element, { delay: 4000 });
    toast.show();
    element.addEventListener('hidden.bs.toast', () => element.remove());
  } else {
    setTimeout(() => element.remove(), 4000);
  }
}

// Guard Page by Role
function checkAuthRole(allowedRole) {
  const user = getUser();
  const token = getToken();

  if (!token || !user) {
    window.location.href = '/index.html?error=login_required';
    return false;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'student') {
      window.location.href = '/student.html';
    } else if (user.role === 'faculty') {
      window.location.href = '/faculty.html';
    } else {
      window.location.href = '/index.html';
    }
    return false;
  }

  // Populate user badge in UI if element exists
  const userDisplayEl = document.getElementById('userDisplayName');
  if (userDisplayEl) {
    userDisplayEl.textContent = user.name || user.username;
  }

  const userRoleEl = document.getElementById('userDisplayRole');
  if (userRoleEl) {
    userRoleEl.textContent = user.role.toUpperCase();
  }

  return true;
}

// Helper: Format Date
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
