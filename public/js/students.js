document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuthRole('faculty')) return;

  const tableBody = document.getElementById('studentTableBody');
  const countBadge = document.getElementById('studentCountBadge');
  const filterForm = document.getElementById('filterForm');
  const resetBtn = document.getElementById('resetFilterBtn');

  let studentToDelete = null;
  const deleteModalEl = document.getElementById('deleteConfirmModal');
  const deleteModal = new bootstrap.Modal(deleteModalEl);
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  // Load students on page load
  loadStudents();

  // Search / Filter form submit
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loadStudents();
  });

  // Reset filters
  resetBtn.addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('departmentFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('careerGoalFilter').value = '';
    document.getElementById('arrearFilter').value = '';
    loadStudents();
  });

  // Debounced instant search
  let debounceTimer;
  document.getElementById('searchInput').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadStudents();
    }, 400);
  });

  // Fetch and display students
  async function loadStudents() {
    const search = document.getElementById('searchInput').value.trim();
    const department = document.getElementById('departmentFilter').value;
    const category = document.getElementById('categoryFilter').value;
    const careerGoal = document.getElementById('careerGoalFilter').value;
    const arrearStatus = document.getElementById('arrearFilter').value;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department) params.append('department', department);
    if (category) params.append('category', category);
    if (careerGoal) params.append('careerGoal', careerGoal);
    if (arrearStatus) params.append('arrearStatus', arrearStatus);

    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4 text-muted">
          <div class="spinner-border spinner-border-sm text-primary me-2"></div>Fetching records...
        </td>
      </tr>
    `;

    try {
      const response = await fetchWithAuth(`/api/students?${params.toString()}`);
      const result = await response.json();

      if (response.ok && result.success) {
        renderTable(result.data);
      } else {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">${result.message || 'Error loading records'}</td></tr>`;
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">Failed to communicate with server.</td></tr>`;
    }
  }

  function renderTable(students) {
    countBadge.textContent = students.length;

    if (!students || students.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">
            <i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
            No student profiles matched the criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = students.map(student => {
      // Category badge
      const catBadge = student.category === 'Hosteller'
        ? `<span class="badge bg-primary-subtle text-primary border border-primary-subtle"><i class="bi bi-building me-1"></i>Hosteller</span>`
        : `<span class="badge bg-info-subtle text-info-emphasis border border-info-subtle"><i class="bi bi-bicycle me-1"></i>Day Scholar</span>`;

      // Career Goal badge
      let goalBadge = '';
      if (student.primaryCareerGoal === 'Placement') {
        goalBadge = `<span class="badge badge-placement px-2 py-1"><i class="bi bi-briefcase me-1"></i>Placement</span>`;
      } else if (student.primaryCareerGoal === 'Higher Studies') {
        goalBadge = `<span class="badge badge-higher-studies px-2 py-1"><i class="bi bi-mortarboard me-1"></i>Higher Studies</span>`;
      } else if (student.primaryCareerGoal === 'Entrepreneurship') {
        goalBadge = `<span class="badge badge-entrepreneurship px-2 py-1"><i class="bi bi-rocket-takeoff me-1"></i>Startup</span>`;
      }

      // Arrear badge
      let arrearBadge = '';
      const pendingCount = student.pendingArrearsCount || 0;
      const clearedCount = student.clearedArrearsCount || 0;

      if (pendingCount > 0) {
        arrearBadge = `<span class="badge badge-arrear-pending px-2 py-1"><i class="bi bi-exclamation-circle me-1"></i>${pendingCount} Pending</span>`;
      } else if (clearedCount > 0) {
        arrearBadge = `<span class="badge badge-arrear-cleared px-2 py-1"><i class="bi bi-check-circle me-1"></i>${clearedCount} Cleared</span>`;
      } else {
        arrearBadge = `<span class="badge bg-light text-secondary border px-2 py-1">Nil</span>`;
      }

      // Latest CGPA badge
      const cgpa = student.latestCgpa ? student.latestCgpa.toFixed(2) : 'N/A';
      const cgpaClass = student.latestCgpa >= 8.5 ? 'text-success fw-bold' : (student.latestCgpa >= 7.0 ? 'text-primary fw-semibold' : 'text-warning-emphasis fw-semibold');

      return `
        <tr>
          <td>
            <a href="/student-profile.html?id=${student._id}" class="fw-bold text-decoration-none text-primary">
              ${student.registerNumber}
            </a>
          </td>
          <td>
            <div class="fw-semibold">${student.name}</div>
            <div class="small text-muted">${student.institutionalEmail}</div>
          </td>
          <td>
            <span class="badge bg-secondary-subtle text-secondary">${student.department} - ${student.section}</span>
          </td>
          <td>${catBadge}</td>
          <td><span class="${cgpaClass}">${cgpa}</span></td>
          <td>${goalBadge}</td>
          <td>${arrearBadge}</td>
          <td class="text-end">
            <div class="btn-group btn-group-sm">
              <a href="/student-profile.html?id=${student._id}" class="btn btn-outline-primary" title="View Full Profile">
                <i class="bi bi-eye"></i>
              </a>
              <a href="/add-student.html?id=${student._id}" class="btn btn-outline-secondary" title="Edit Profile">
                <i class="bi bi-pencil"></i>
              </a>
              <button class="btn btn-outline-danger delete-btn" data-id="${student._id}" data-name="${student.name}" data-reg="${student.registerNumber}" title="Delete Profile">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach delete listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        studentToDelete = {
          id: btn.dataset.id,
          name: btn.dataset.name,
          reg: btn.dataset.reg
        };
        document.getElementById('deleteStudentName').textContent = studentToDelete.name;
        document.getElementById('deleteStudentRegNo').textContent = studentToDelete.reg;
        deleteModal.show();
      });
    });
  }

  // Handle delete confirmation
  confirmDeleteBtn.addEventListener('click', async () => {
    if (!studentToDelete) return;

    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Deleting...';

    try {
      const response = await fetchWithAuth(`/api/students/${studentToDelete.id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast(result.message || 'Student profile deleted.', 'success');
        deleteModal.hide();
        loadStudents();
      } else {
        showToast(result.message || 'Failed to delete student.', 'danger');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Error communicating with server.', 'danger');
    } finally {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.innerHTML = '<i class="bi bi-trash-fill me-1"></i>Yes, Delete Profile';
      studentToDelete = null;
    }
  });
});
