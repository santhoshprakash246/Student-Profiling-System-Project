document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuthRole('student')) return;

  const user = getUser();
  let studentProfileId = user.studentId;

  // If studentId wasn't stored in local storage, fetch from /api/auth/me
  if (!studentProfileId) {
    try {
      const meRes = await fetchWithAuth('/api/auth/me');
      const meData = await meRes.json();
      if (meRes.ok && meData.user && meData.user.studentId) {
        studentProfileId = meData.user.studentId;
        user.studentId = studentProfileId;
        setUser(user);
      }
    } catch (e) {
      console.warn('Failed to retrieve me data:', e);
    }
  }

  if (!studentProfileId) {
    showToast('Your student academic profile is being initialized. Contact faculty if this persists.', 'warning');
    return;
  }

  // Load student's own profile
  try {
    const response = await fetchWithAuth(`/api/students/${studentProfileId}`);
    const result = await response.json();

    if (response.ok && result.success) {
      renderStudentPortal(result.data);
    } else {
      showToast(result.message || 'Unable to retrieve your student profile.', 'danger');
    }
  } catch (err) {
    console.error('Error fetching student profile:', err);
    showToast('Error communicating with server.', 'danger');
  }

  function renderStudentPortal(s) {
    // Banner
    document.getElementById('studentFullName').textContent = s.name;
    document.getElementById('studentAvatar').textContent = (s.name || 'S').charAt(0).toUpperCase();
    document.getElementById('studentRegNo').textContent = s.registerNumber;
    document.getElementById('studentDeptSec').textContent = `${s.department} - Section ${s.section}`;
    document.getElementById('studentCategory').textContent = s.category;
    document.getElementById('studentCareerGoalBadge').textContent = s.primaryCareerGoal;
    document.getElementById('studentCgpaVal').textContent = s.latestCgpa ? s.latestCgpa.toFixed(2) : 'N/A';

    // Summary Metric Cards
    const completedCount = s.semesters ? s.semesters.length : 0;
    document.getElementById('statCompletedSemesters').textContent = completedCount;

    let totalAtt = 0;
    if (completedCount > 0) {
      s.semesters.forEach(sem => totalAtt += sem.attendance);
      document.getElementById('statAvgAttendance').textContent = `${(totalAtt / completedCount).toFixed(0)}%`;
    } else {
      document.getElementById('statAvgAttendance').textContent = 'N/A';
    }

    document.getElementById('statPendingArrears').textContent = s.pendingArrearsCount || 0;
    document.getElementById('statPrimaryGoal').textContent = s.primaryCareerGoal;

    // 1. Semesters Table
    const semTbody = document.getElementById('studentSemestersBody');
    if (s.semesters && s.semesters.length > 0) {
      semTbody.innerHTML = s.semesters.map(sem => `
        <tr>
          <td><span class="badge bg-primary px-2">Semester ${sem.semesterNumber}</span></td>
          <td><span class="fw-bold">${sem.sgpa.toFixed(2)}</span></td>
          <td><span class="fw-bold text-success">${sem.cgpa.toFixed(2)}</span></td>
          <td><span>${sem.attendance}%</span></td>
          <td class="small text-secondary">${sem.goodSubjects || '-'}</td>
          <td class="small text-secondary">${sem.academicAchievements || '-'}</td>
        </tr>
      `).join('');
    } else {
      semTbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">No semester records available yet.</td></tr>`;
    }

    // 2. Arrears Table
    const arrTbody = document.getElementById('studentArrearsBody');
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
          <td class="small">${arr.status === 'Cleared' ? `Sem ${arr.clearedSemester || '-'}` : '-'}</td>
          <td>
            ${arr.remedialRequired === 'Yes'
              ? `<span class="badge bg-danger-subtle text-danger">Yes, Clinic Assigned</span>`
              : `<span class="badge bg-light text-secondary">No</span>`}
          </td>
          <td class="small text-muted">${arr.reasonForDifficulty || '-'}</td>
        </tr>
      `).join('');
    } else {
      arrTbody.innerHTML = `<tr><td colspan="8" class="text-center py-3 text-muted"><i class="bi bi-check-circle text-success me-1"></i>No pending arrears. Keep up the good work!</td></tr>`;
    }

    // 3. Technical Skills
    const progBox = document.getElementById('studentProgLangs');
    if (s.programmingLanguages && s.programmingLanguages.length > 0) {
      progBox.innerHTML = s.programmingLanguages.map(l => `<span class="skill-tag">${l}</span>`).join('');
    } else {
      progBox.innerHTML = '<span class="text-muted small">None listed</span>';
    }

    const techBox = document.getElementById('studentTechSkills');
    if (s.technicalSkills && s.technicalSkills.length > 0) {
      techBox.innerHTML = s.technicalSkills.map(t => `<span class="skill-tag">${t}</span>`).join('');
    } else {
      techBox.innerHTML = '<span class="text-muted small">None listed</span>';
    }

    document.getElementById('studentCommLevel').textContent = s.communicationSkill || 'Intermediate';
    document.getElementById('studentAptLevel').textContent = s.aptitudeSkill || 'Intermediate';
    document.getElementById('studentCodingContests').textContent = s.codingContests || 'No contest rankings recorded.';

    // Profile Links
    const linksContainer = document.getElementById('studentProfileLinks');
    const links = [];
    if (s.github) links.push(`<div class="col-6"><a href="${s.github}" target="_blank" class="btn btn-outline-dark btn-sm w-100 text-truncate"><i class="bi bi-github me-1"></i>GitHub</a></div>`);
    if (s.linkedin) links.push(`<div class="col-6"><a href="${s.linkedin}" target="_blank" class="btn btn-outline-primary btn-sm w-100 text-truncate"><i class="bi bi-linkedin me-1"></i>LinkedIn</a></div>`);
    if (s.hackerrank) links.push(`<div class="col-6"><a href="${s.hackerrank}" target="_blank" class="btn btn-outline-success btn-sm w-100 text-truncate"><i class="bi bi-code me-1"></i>HackerRank</a></div>`);
    if (s.hackerearth) links.push(`<div class="col-6"><a href="${s.hackerearth}" target="_blank" class="btn btn-outline-info btn-sm w-100 text-truncate"><i class="bi bi-terminal me-1"></i>HackerEarth</a></div>`);

    linksContainer.innerHTML = links.length > 0 ? links.join('') : '<div class="col-12 text-muted small">No links added.</div>';

    // Projects
    const projContainer = document.getElementById('studentProjectsList');
    if (s.projects && s.projects.length > 0) {
      projContainer.innerHTML = s.projects.map(p => `
        <div class="col-md-6">
          <div class="card p-3 border bg-light h-100">
            <h6 class="fw-bold mb-1 text-primary">${p.title}</h6>
            <p class="small text-secondary mb-2">${p.description}</p>
            <div class="small mb-2"><strong>Tech Stack:</strong> ${p.techStack}</div>
            ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" class="small text-decoration-none"><i class="bi bi-github me-1"></i>Code Repository</a>` : ''}
          </div>
        </div>
      `).join('');
    } else {
      projContainer.innerHTML = '<div class="col-12 text-muted small">No projects added yet.</div>';
    }

    // 4. Career Details
    const careerBox = document.getElementById('studentCareerDetails');
    if (s.primaryCareerGoal === 'Placement') {
      const p = s.placement || {};
      careerBox.innerHTML = `
        <div class="p-3 bg-light rounded border">
          <h6 class="fw-bold text-primary mb-3"><i class="bi bi-briefcase me-1"></i>Placement Track Preferences</h6>
          <div class="row g-3">
            <div class="col-md-4"><div class="detail-label">Preferred Job Role</div><div class="detail-value fw-bold">${p.preferredRole || 'Software Engineer'}</div></div>
            <div class="col-md-4"><div class="detail-label">Domain</div><div class="detail-value">${p.preferredDomain || 'Core / Web'}</div></div>
            <div class="col-md-4"><div class="detail-label">Company Type</div><div class="detail-value"><span class="badge bg-primary">${p.companyType || 'Any'}</span></div></div>
            <div class="col-md-4"><div class="detail-label">Expected CTC</div><div class="detail-value">${p.expectedSalaryRange || 'Industry Standard'}</div></div>
            <div class="col-md-4"><div class="detail-label">Target Companies</div><div class="detail-value">${p.targetCompanies || 'N/A'}</div></div>
            <div class="col-md-4"><div class="detail-label">Preferred Location</div><div class="detail-value">${p.preferredLocation || 'Any'}</div></div>
            <div class="col-md-6"><div class="detail-label">Training Support Needed</div><div class="detail-value">${p.trainingSupportRequired || 'None'}</div></div>
            <div class="col-md-6"><div class="detail-label">Skills to Improve</div><div class="detail-value">${p.skillsToImprove || 'None'}</div></div>
          </div>
        </div>
      `;
    } else if (s.primaryCareerGoal === 'Higher Studies') {
      const h = s.higherStudies || {};
      careerBox.innerHTML = `
        <div class="p-3 bg-light rounded border">
          <h6 class="fw-bold text-purple mb-3"><i class="bi bi-mortarboard me-1"></i>Higher Studies Track Preferences</h6>
          <div class="row g-3">
            <div class="col-md-4"><div class="detail-label">Target Programme</div><div class="detail-value fw-bold">${h.preferredProgramme || 'MS / M.Tech'}</div></div>
            <div class="col-md-4"><div class="detail-label">Specialization</div><div class="detail-value">${h.specialization || 'N/A'}</div></div>
            <div class="col-md-4"><div class="detail-label">Preferred Country</div><div class="detail-value">${h.preferredCountry || 'India / Overseas'}</div></div>
            <div class="col-md-4"><div class="detail-label">Target Institutions</div><div class="detail-value">${h.targetInstitutions || 'N/A'}</div></div>
            <div class="col-md-4"><div class="detail-label">Planned Examination</div><div class="detail-value"><span class="badge bg-purple text-white">${h.plannedExam || 'N/A'}</span></div></div>
            <div class="col-md-4"><div class="detail-label">Expected Admission Year</div><div class="detail-value">${h.expectedAdmissionYear || 'N/A'}</div></div>
            <div class="col-12"><div class="detail-label">Guidance Support Needed</div><div class="detail-value">${h.guidanceRequired || 'SOP / Recommendations'}</div></div>
          </div>
        </div>
      `;
    } else if (s.primaryCareerGoal === 'Entrepreneurship') {
      const e = s.entrepreneurship || {};
      careerBox.innerHTML = `
        <div class="p-3 bg-light rounded border">
          <h6 class="fw-bold text-warning mb-3"><i class="bi bi-rocket-takeoff me-1"></i>Entrepreneurship Track Preferences</h6>
          <div class="row g-3">
            <div class="col-md-6"><div class="detail-label">Startup Venture</div><div class="detail-value fw-bold">${e.startupIdea || 'Venture'}</div></div>
            <div class="col-md-6"><div class="detail-label">Stage</div><div class="detail-value"><span class="badge bg-warning text-dark">${e.currentStage || 'Idea'}</span></div></div>
            <div class="col-md-6"><div class="detail-label">Problem Solved</div><div class="detail-value">${e.problemAddressed || 'N/A'}</div></div>
            <div class="col-md-6"><div class="detail-label">Proposed Solution</div><div class="detail-value">${e.proposedSolution || 'N/A'}</div></div>
            <div class="col-md-6"><div class="detail-label">Funding Support Needed</div><div class="detail-value">${e.fundingSupport || 'None'}</div></div>
            <div class="col-md-6"><div class="detail-label">Incubation Needed</div><div class="detail-value">${e.incubationSupport || 'None'}</div></div>
          </div>
        </div>
      `;
    }

    // 5. Self Evaluation
    document.getElementById('studentAcadStrengths').textContent = s.academicStrengths || 'None recorded';
    document.getElementById('studentTechStrengths').textContent = s.technicalStrengths || 'None recorded';
    document.getElementById('studentCommStrengths').textContent = s.communicationStrengths || 'None recorded';
    document.getElementById('studentImprovementAreas').textContent = s.areasRequiringImprovement || 'None recorded';
    document.getElementById('studentSubjectsSupport').textContent = s.subjectsRequiringSupport || 'None recorded';
    document.getElementById('studentSkillsToDevelop').textContent = s.technicalSkillsToDevelop || 'None recorded';

    // Mentor notes
    document.getElementById('studentMentorName').textContent = s.mentorName || 'Assigned Faculty Mentor';
    document.getElementById('studentMentorRemarks').textContent = s.mentorRemarks || 'No confidential remarks available.';
  }
});
