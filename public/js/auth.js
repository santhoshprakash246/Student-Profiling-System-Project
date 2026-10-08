document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorAlert = document.getElementById('loginErrorAlert');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');

  // Check if session expired or logout message in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('error') === 'session_expired') {
    showError('Your session has expired. Please log in again.');
  } else if (urlParams.get('error') === 'login_required') {
    showError('Please log in to access this portal.');
  }

  // Pre-fill demo accounts
  const demoFacultyBtn = document.getElementById('demoFacultyBtn');
  const demoStudentBtn = document.getElementById('demoStudentBtn');

  if (demoFacultyBtn) {
    demoFacultyBtn.addEventListener('click', () => {
      document.getElementById('usernameInput').value = 'faculty';
      document.getElementById('passwordInput').value = 'Faculty@123';
      clearError();
    });
  }

  if (demoStudentBtn) {
    demoStudentBtn.addEventListener('click', () => {
      document.getElementById('usernameInput').value = '24bcs246';
      document.getElementById('passwordInput').value = 'Student@123';
      clearError();
    });
  }

  // Handle Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearError();

      const username = document.getElementById('usernameInput').value.trim();
      const password = document.getElementById('passwordInput').value;

      if (!username || !password) {
        showError('Please enter both username/register number and password.');
        return;
      }

      loginSubmitBtn.disabled = true;
      loginSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Logging in...';

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Store token and user
          setToken(data.token);
          setUser(data.user);

          // Route according to role
          if (data.user.role === 'faculty') {
            window.location.href = '/faculty.html';
          } else if (data.user.role === 'student') {
            window.location.href = '/student.html';
          } else {
            window.location.href = '/faculty.html';
          }
        } else {
          showError(data.message || 'Invalid login credentials. Please try again.');
        }
      } catch (err) {
        console.error('Login submit error:', err);
        showError('Unable to connect to the server. Please check if the server is running.');
      } finally {
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Sign In';
      }
    });
  }

  function showError(msg) {
    if (errorAlert) {
      errorAlert.textContent = msg;
      errorAlert.classList.remove('d-none');
    }
  }

  function clearError() {
    if (errorAlert) {
      errorAlert.textContent = '';
      errorAlert.classList.add('d-none');
    }
  }
});
