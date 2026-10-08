document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  if (!user) {
    window.location.href = '/index.html?error=login_required';
    return;
  }

  // Populate user badge in UI
  document.getElementById('userDisplayName').textContent = user.name || user.username;
  document.getElementById('userDisplayRole').textContent = user.role.toUpperCase();

  // If user is student, adjust top navbar link to go to student.html
  if (user.role === 'student') {
    const navLinks = document.getElementById('navLinksList');
    if (navLinks) {
      navLinks.innerHTML = `
        <li class="nav-item">
          <a class="nav-link active" href="/student.html"><i class="bi bi-person-circle me-1"></i>My Student Portal</a>
        </li>
      `;
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');

  if (!studentId) {
    showToast('No student ID specified.', 'danger');
    setTimeout(() => {
      window.location.href = user.role === 'faculty' ? '/students.html' : '/student.html';
    }, 1500);
    return;
  }

  // Show faculty-only UI elements if user is faculty
  if (user.role === 'faculty') {
    document.querySelectorAll('.faculty-only').forEach(el => el.classList.remove('d-none'));
    const editBtn = document.getElementById('editProfileTopBtn');
    if (editBtn) {
      editBtn.href = `/add-student.html?id=${studentId}`;
    }
  }

  // Load student profile
  await loadProfile();

  async function loadProfile() {
    try {
      const response = await fetchWithAuth(`/api/students/${studentId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        renderProfile(result.data);
      } else {
        showToast(result.message || 'Unable to load student profile.', 'danger');
        if (response.status === 403) {
          setTimeout(() => {
            window.location.href = user.role === 'student' ? '/student.html' : '/faculty.html';
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error loading student:', err);
      showToast('Error communicating with server.', 'danger');
    }
  }

  function renderProfile(s) {
    // Header Banner
    document.getElementById('profileFullName').textContent = s.name;
    document.getElementById('profileAvatar').textContent = (s.name || 'S').charAt(0).toUpperCase();
    document.getElementById('profileRegNo').textContent = s.registerNumber;
    document.getElementById('profileDeptSec').textContent = `${s.department} - Sec ${s.section}`;
    document.getElementById('profileCategoryBadge').textContent = s.category;
    document.getElementById('profileCareerGoalBadge').textContent = s.primaryCareerGoal;
    document.getElementById('profileCgpaVal').textContent = s.latestCgpa ? s.latestCgpa.toFixed(2) : 'N/A';
    document.getElementById('breadcrumbName').textContent = s.name;

    // 1. Personal Details
    document.getElementById('viewRegNo').textContent = s.registerNumber;
    document.getElementById('viewName').textContent = s.name;
    document.getElementById('viewDob').textContent = formatDate(s.dob);
    document.getElementById('viewGender').textContent = s.gender;
    document.getElementById('viewDeptSec').textContent = `${s.department} - Section ${s.section}`;
    document.getElementById('viewCategory').textContent = s.category;

    if (s.category === 'Hosteller') {
      document.getElementById('viewCategoryDetailLabel').textContent = 'Hostel & Room';
      document.getElementById('viewCategoryDetailVal').textContent = s.hostelName || 'Not specified';
    } else {
      document.getElementById('viewCategoryDetailLabel').textContent = 'Commute Distance';
      document.getElementById('viewCategoryDetailVal').textContent = `${s.dayScholarDistance || 0} km from campus`;
    }

    document.getElementById('viewInstEmail').textContent = s.institutionalEmail;
    document.getElementById('viewPersEmail').textContent = s.personalEmail;
    document.getElementById('viewMobile').textContent = s.mobile;
    document.getElementById('viewAddress').textContent = s.address;

    // Family Details
    document.getElementById('viewFatherName').textContent = s.father?.name || 'N/A';
    document.getElementById('viewFatherOcc').textContent = s.father?.occupation || 'N/A';
    document.getElementById('viewFatherInc').textContent = s.father?.incomeRange || 'Confidential';
    document.getElementById('viewFatherMob').textContent = s.father?.mobile || 'N/A';

    document.getElementById('viewMotherName').textContent = s.mother?.name || 'N/A';
    document.getElementById('viewMotherOcc').textContent = s.mother?.occupation || 'N/A';
    document.getElementById('viewMotherInc').textContent = s.mother?.incomeRange || 'Confidential';
    document.getElementById('viewMotherMob').textContent = s.mother?.mobile || 'N/A';

    document.getElementById('viewGuardian').textContent = `${s.guardian?.name || 'Parent'} (${s.guardian?.emergencyContact || 'N/A'})`;
    document.getElementById('viewFirstGrad').textContent = s.isFirstGraduate ? 'Yes' : 'No';
    document.getElementById('viewScholarship').textContent = s.scholarshipReceived ? 'Yes' : 'No';

    // 2. Semesters Table
    const semTbody = document.getElementById('viewSemesterTableBody');
    if (s.semesters && s.semesters.length > 0) {
      semTbody.innerHTML = s.semesters.map(sem => `
        <tr>
          <td><span class="badge bg-primary px-2">Semester ${sem.semesterNumber}</span></td>
          <td><span class="fw-bold">${sem.sgpa.toFixed(2)}</span></td>
          <td><span class="fw-bold text-success">${sem.cgpa.toFixed(2)}</span></td>
          <td><span>${sem.attendance}%</span></td>
          <td>
            ${sem.hasArrears
              ? `<span class="badge bg-danger-subtle text-danger">${sem.arrearCount} Arrears</span>`
              : `<span class="badge bg-success-subtle text-success">Cleared / Nil</span>`}
          </td>
          <td class="small text-secondary">${sem.goodSubjects || '-'}</td>
          <td class="small text-secondary">${sem.academicAchievements || '-'}</td>
          <td class="faculty-only ${user.role === 'faculty' ? '' : 'd-none'} text-end no-print">
            <button class="btn btn-outline-danger btn-sm py-0 px-2 delete-sem-btn" data-sem-id="${sem._id}" title="Delete Semester">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');

      // Delete semester buttons
      semTbody.querySelectorAll('.delete-sem-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Are you sure you want to remove this semester record?')) return;
          try {
            const res = await fetchWithAuth(`/api/students/${studentId}/semesters/${btn.dataset.semId}`, { method: 'DELETE' });
            const r = await res.json();
            if (res.ok && r.success) {
              showToast('Semester record deleted.', 'success');
              loadProfile();
            }
          } catch (e) {
            showToast('Error removing semester.', 'danger');
          }
        });
      });
    } else {
      semTbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No semester records uploaded yet.</td></tr>`;
    }

    // 3. Arrear Table
    const arrTbody = document.getElementById('viewArrearTableBody');
    if (s.arrears && s.arrears.length > 0) {
      arrTbody.innerHTML = s.arrears.map(arr => `
        <tr>
          <td><span class="badge bg-secondary">Sem ${arr.semester}</span></td>
          <td><span class="fw-semibold text-danger">${arr.subjectCode}</span></td>
          <td><span class="fw-medium">${arr.subjectName}</span></td>
          <td><span>${arr.attempts}</span></td>
          <td>
            ${arr.status === 'Pending'
              ? `<span class="badge badge-arrear-pending px-2 py-1"><i class="bi bi-hourglass-split me-1"></i>Pending</span>`
              : `<span class="badge badge-arrear-cleared px-2 py-1"><i class="bi bi-check-circle me-1"></i>Cleared</span>`}
          </td>
          <td class="small">
            ${arr.status === 'Cleared'
              ? `Sem ${arr.clearedSemester || '-'} (Grade: ${arr.clearedGrade || '-'})`
              : '<span class="text-muted">-</span>'}
          </td>
          <td>
            ${arr.remedialRequired === 'Yes'
              ? `<span class="badge bg-danger-subtle text-danger">Yes, Needed</span>`
              : `<span class="badge bg-light text-secondary">No</span>`}
          </td>
          <td class="small text-muted">${arr.reasonForDifficulty || '-'}</td>
          <td class="faculty-only ${user.role === 'faculty' ? '' : 'd-none'} text-end no-print">
            <button class="btn btn-outline-danger btn-sm py-0 px-2 delete-arr-btn" data-arr-id="${arr._id}" title="Delete Arrear">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');

      // Delete arrear buttons
      arrTbody.querySelectorAll('.delete-arr-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Are you sure you want to remove this arrear record?')) return;
          try {
            const res = await fetchWithAuth(`/api/students/${studentId}/arrears/${btn.dataset.arrId}`, { method: 'DELETE' });
            const r = await res.json();
            if (res.ok && r.success) {
              showToast('Arrear record removed.', 'success');
              loadProfile();
            }
          } catch (e) {
            showToast('Error removing arrear.', 'danger');
          }
        });
      });
    } else {
      arrTbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted"><i class="bi bi-check-circle text-success me-1"></i>No pending or cleared arrears found. Clean academic slate.</td></tr>`;
    }

    // 4. Technical Skills
    const progBox = document.getElementById('viewProgLangs');
    if (s.programmingLanguages && s.programmingLanguages.length > 0) {
      progBox.innerHTML = s.programmingLanguages.map(l => `<span class="skill-tag">${l}</span>`).join('');
    } else {
      progBox.innerHTML = '<span class="text-muted small">None listed</span>';
    }

    const techBox = document.getElementById('viewTechSkills');
    if (s.technicalSkills && s.technicalSkills.length > 0) {
      techBox.innerHTML = s.technicalSkills.map(t => `<span class="skill-tag">${t}</span>`).join('');
    } else {
      techBox.innerHTML = '<span class="text-muted small">None listed</span>';
    }

    document.getElementById('viewAreaOfInterest').textContent = s.areaOfInterest || 'Not specified';
    document.getElementById('viewPreferredDomain').textContent = s.preferredDomain || 'Not specified';
    document.getElementById('viewCommLevel').textContent = s.communicationSkill || 'Intermediate';
    document.getElementById('viewAptLevel').textContent = s.aptitudeSkill || 'Intermediate';

    // Professional Links
    const linksContainer = document.getElementById('viewProfileLinksContainer');
    const linksHtml = [];
    if (s.github) linksHtml.push(`<div class="col-md-3"><a href="${s.github}" target="_blank" class="btn btn-outline-dark btn-sm w-100 text-truncate"><i class="bi bi-github me-1"></i>GitHub</a></div>`);
    if (s.linkedin) linksHtml.push(`<div class="col-md-3"><a href="${s.linkedin}" target="_blank" class="btn btn-outline-primary btn-sm w-100 text-truncate"><i class="bi bi-linkedin me-1"></i>LinkedIn</a></div>`);
    if (s.hackerrank) linksHtml.push(`<div class="col-md-3"><a href="${s.hackerrank}" target="_blank" class="btn btn-outline-success btn-sm w-100 text-truncate"><i class="bi bi-code me-1"></i>HackerRank</a></div>`);
    if (s.hackerearth) linksHtml.push(`<div class="col-md-3"><a href="${s.hackerearth}" target="_blank" class="btn btn-outline-info btn-sm w-100 text-truncate"><i class="bi bi-terminal me-1"></i>HackerEarth</a></div>`);

    linksContainer.innerHTML = linksHtml.length > 0 ? linksHtml.join('') : '<div class="col-12 text-muted small">No profile links provided.</div>';

    // Projects
    const projContainer = document.getElementById('viewProjectsContainer');
    if (s.projects && s.projects.length > 0) {
      projContainer.innerHTML = s.projects.map(p => `
        <div class="col-md-6">
          <div class="card p-3 border h-100 bg-light">
            <h6 class="fw-bold mb-1 text-primary">${p.title}</h6>
            <p class="small text-secondary mb-2">${p.description}</p>
            <div class="small mb-2"><strong>Tech Stack:</strong> ${p.techStack}</div>
            ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" class="small text-decoration-none"><i class="bi bi-github me-1"></i>Repository Link</a>` : ''}
          </div>
        </div>
      `).join('');
    } else {
      projContainer.innerHTML = '<div class="col-12 text-muted small">No projects listed.</div>';
    }

    // Certifications
    const certContainer = document.getElementById('viewCertificationsContainer');
    if (s.certifications && s.certifications.length > 0) {
      certContainer.innerHTML = s.certifications.map(c => `
        <div class="col-md-6">
          <div class="card p-3 border h-100 bg-light">
            <h6 class="fw-bold mb-1">${c.name}</h6>
            <div class="small text-muted mb-1">${c.organization} &bull; ${c.issueDate}</div>
            ${c.credentialUrl ? `<a href="${c.credentialUrl}" target="_blank" class="small text-decoration-none">View Credential</a>` : ''}
          </div>
        </div>
      `).join('');
    } else {
      certContainer.innerHTML = '<div class="col-12 text-muted small">No certifications listed.</div>';
    }

    // 5. Self-Evaluation
    document.getElementById('viewAcadStrengths').textContent = s.academicStrengths || 'None specified';
    document.getElementById('viewTechStrengths').textContent = s.technicalStrengths || 'None specified';
    document.getElementById('viewCommStrengths').textContent = s.communicationStrengths || 'None specified';
    document.getElementById('viewGeneralImprovement').textContent = s.areasRequiringImprovement || 'None specified';
    document.getElementById('viewSubjectsSupport').textContent = s.subjectsRequiringSupport || 'None specified';
    document.getElementById('viewSkillsToDevelop').textContent = s.technicalSkillsToDevelop || 'None specified';
    document.getElementById('viewShortTermGoal').textContent = s.shortTermGoal || 'None specified';
    document.getElementById('viewLongTermGoal').textContent = s.longTermGoal || 'None specified';
    document.getElementById('viewMentorSupportExp').textContent = s.mentorSupportExpected || 'None specified';

    // 6. Career Goal Details
    document.getElementById('viewPrimaryGoalName').textContent = s.primaryCareerGoal;
    const goalContainer = document.getElementById('viewCareerGoalDetailsContainer');

    if (s.primaryCareerGoal === 'Placement') {
      const p = s.placement || {};
      goalContainer.innerHTML = `
        <div class="row g-3">
          <div class="col-md-4"><div class="detail-label">Preferred Job Role</div><div class="detail-value fw-bold">${p.preferredRole || 'SDE / Engineer'}</div></div>
          <div class="col-md-4"><div class="detail-label">Technical Domain</div><div class="detail-value">${p.preferredDomain || 'Core / Web'}</div></div>
          <div class="col-md-4"><div class="detail-label">Company Type</div><div class="detail-value"><span class="badge bg-primary">${p.companyType || 'Any'}</span></div></div>
          <div class="col-md-4"><div class="detail-label">Expected CTC Range</div><div class="detail-value">${p.expectedSalaryRange || 'Industry Standard'}</div></div>
          <div class="col-md-4"><div class="detail-label">Preferred Location</div><div class="detail-value">${p.preferredLocation || 'Any'}</div></div>
          <div class="col-md-4"><div class="detail-label">Target Companies</div><div class="detail-value">${p.targetCompanies || 'N/A'}</div></div>
          <div class="col-md-6"><div class="detail-label">Training Support Required</div><div class="detail-value">${p.trainingSupportRequired || 'None'}</div></div>
          <div class="col-md-6"><div class="detail-label">Skills to Improve</div><div class="detail-value">${p.skillsToImprove || 'None'}</div></div>
        </div>
      `;
    } else if (s.primaryCareerGoal === 'Higher Studies') {
      const h = s.higherStudies || {};
      goalContainer.innerHTML = `
        <div class="row g-3">
          <div class="col-md-4"><div class="detail-label">Preferred Programme</div><div class="detail-value fw-bold">${h.preferredProgramme || 'MS / M.Tech'}</div></div>
          <div class="col-md-4"><div class="detail-label">Specialization</div><div class="detail-value">${h.specialization || 'N/A'}</div></div>
          <div class="col-md-4"><div class="detail-label">Preferred Country</div><div class="detail-value">${h.preferredCountry || 'India / Overseas'}</div></div>
          <div class="col-md-4"><div class="detail-label">Target Institutions</div><div class="detail-value">${h.targetInstitutions || 'N/A'}</div></div>
          <div class="col-md-4"><div class="detail-label">Planned Examination</div><div class="detail-value"><span class="badge bg-purple text-white">${h.plannedExam || 'N/A'}</span></div></div>
          <div class="col-md-4"><div class="detail-label">Target Admission Year</div><div class="detail-value">${h.expectedAdmissionYear || 'N/A'}</div></div>
          <div class="col-12"><div class="detail-label">Guidance Required</div><div class="detail-value">${h.guidanceRequired || 'SOP / Recommendations'}</div></div>
        </div>
      `;
    } else if (s.primaryCareerGoal === 'Entrepreneurship') {
      const e = s.entrepreneurship || {};
      goalContainer.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6"><div class="detail-label">Startup Idea</div><div class="detail-value fw-bold">${e.startupIdea || 'Venture'}</div></div>
          <div class="col-md-6"><div class="detail-label">Current Stage</div><div class="detail-value"><span class="badge bg-warning text-dark">${e.currentStage || 'Idea'}</span></div></div>
          <div class="col-md-6"><div class="detail-label">Problem Addressed</div><div class="detail-value">${e.problemAddressed || 'N/A'}</div></div>
          <div class="col-md-6"><div class="detail-label">Proposed Solution</div><div class="detail-value">${e.proposedSolution || 'N/A'}</div></div>
          <div class="col-md-4"><div class="detail-label">Target Market</div><div class="detail-value">${e.targetCustomers || 'N/A'}</div></div>
          <div class="col-md-4"><div class="detail-label">Tech Stack</div><div class="detail-value">${e.technology || 'N/A'}</div></div>
          <div class="col-md-4"><div class="detail-label">Expected Launch Year</div><div class="detail-value">${e.expectedLaunchYear || 'N/A'}</div></div>
          <div class="col-md-6"><div class="detail-label">Funding Support Needed</div><div class="detail-value">${e.fundingSupport || 'None'}</div></div>
          <div class="col-md-6"><div class="detail-label">Incubation Support Needed</div><div class="detail-value">${e.incubationSupport || 'None'}</div></div>
        </div>
      `;
    }

    // 7. Mentoring Details
    document.getElementById('viewMentorName').textContent = s.mentorName || 'Assigned Faculty Mentor';
    document.getElementById('viewActionPlan').textContent = s.actionPlan || 'Standard curriculum progression';
    document.getElementById('viewMentorRemarks').textContent = s.mentorRemarks || 'No remarks entered by mentor yet.';
  }

  // Handle Quick Add Semester Modal
  const quickSemForm = document.getElementById('quickAddSemesterForm');
  if (quickSemForm) {
    quickSemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        semesterNumber: document.getElementById('quickSemNum').value,
        sgpa: document.getElementById('quickSemSgpa').value,
        cgpa: document.getElementById('quickSemCgpa').value,
        attendance: document.getElementById('quickSemAtt').value,
        goodSubjects: document.getElementById('quickSemGood').value.trim(),
        academicAchievements: document.getElementById('quickSemAchieve').value.trim()
      };

      try {
        const response = await fetchWithAuth(`/api/students/${studentId}/semesters`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const res = await response.json();
        if (response.ok && res.success) {
          showToast('Semester added successfully.', 'success');
          bootstrap.Modal.getInstance(document.getElementById('addSemesterModal')).hide();
          quickSemForm.reset();
          loadProfile();
        } else {
          showToast(res.message || 'Failed to add semester.', 'danger');
        }
      } catch (err) {
        showToast('Error adding semester.', 'danger');
      }
    });
  }

  // Handle Quick Add Arrear Modal
  const quickArrForm = document.getElementById('quickAddArrearForm');
  if (quickArrForm) {
    quickArrForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        semester: document.getElementById('quickArrSem').value,
        subjectCode: document.getElementById('quickArrCode').value.trim().toUpperCase(),
        subjectName: document.getElementById('quickArrName').value.trim(),
        attempts: document.getElementById('quickArrAttempts').value,
        status: document.getElementById('quickArrStatus').value,
        remedialRequired: document.getElementById('quickArrRemedial').value,
        reasonForDifficulty: document.getElementById('quickArrReason').value.trim()
      };

      try {
        const response = await fetchWithAuth(`/api/students/${studentId}/arrears`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const res = await response.json();
        if (response.ok && res.success) {
          showToast('Arrear record added successfully.', 'success');
          bootstrap.Modal.getInstance(document.getElementById('addArrearModal')).hide();
          quickArrForm.reset();
          loadProfile();
        } else {
          showToast(res.message || 'Failed to add arrear.', 'danger');
        }
      } catch (err) {
        showToast('Error adding arrear.', 'danger');
      }
    });
  }
});
