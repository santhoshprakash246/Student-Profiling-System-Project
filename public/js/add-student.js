document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuthRole('faculty')) return;

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');

  const form = document.getElementById('studentForm');
  const alertBox = document.getElementById('formAlertBox');
  const saveBtn = document.getElementById('saveStudentBtn');
  const semesterContainer = document.getElementById('semesterRowsContainer');
  const arrearContainer = document.getElementById('arrearRowsContainer');

  // Dynamic Category conditional toggle
  const categorySelect = document.getElementById('category');
  const hostelFieldContainer = document.getElementById('hostelFieldContainer');
  const dayScholarFieldContainer = document.getElementById('dayScholarFieldContainer');

  categorySelect.addEventListener('change', () => {
    if (categorySelect.value === 'Hosteller') {
      hostelFieldContainer.classList.remove('d-none');
      dayScholarFieldContainer.classList.add('d-none');
    } else {
      hostelFieldContainer.classList.add('d-none');
      dayScholarFieldContainer.classList.remove('d-none');
    }
  });

  // Dynamic Career Goal conditional toggle
  const goalRadios = document.querySelectorAll('input[name="careerGoalRadio"]');
  const placementContainer = document.getElementById('placementContainer');
  const higherStudiesContainer = document.getElementById('higherStudiesContainer');
  const entrepreneurshipContainer = document.getElementById('entrepreneurshipContainer');

  goalRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const selected = radio.value;
      placementContainer.classList.toggle('d-none', selected !== 'Placement');
      higherStudiesContainer.classList.toggle('d-none', selected !== 'Higher Studies');
      entrepreneurshipContainer.classList.toggle('d-none', selected !== 'Entrepreneurship');
    });
  });

  // Dynamic Arrear Radio toggle
  const arrearRadios = document.querySelectorAll('input[name="arrearStatusRadio"]');
  arrearRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'Yes') {
        arrearContainer.classList.remove('d-none');
        if (arrearContainer.children.length === 0) {
          addArrearRow();
        }
      } else {
        arrearContainer.classList.add('d-none');
      }
    });
  });

  // Add Dynamic Semester Row
  document.getElementById('addSemesterRowBtn').addEventListener('click', () => {
    const currentCount = semesterContainer.children.length;
    addSemesterRow({ semesterNumber: currentCount + 1, sgpa: '', cgpa: '', attendance: '' });
  });

  // Add Dynamic Arrear Row
  document.getElementById('addArrearRowBtn').addEventListener('click', () => {
    document.getElementById('arrearStatusYes').checked = true;
    arrearContainer.classList.remove('d-none');
    addArrearRow();
  });

  function addSemesterRow(data = {}) {
    const semIndex = semesterContainer.children.length + 1;
    const rowId = 'sem_row_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);

    const semHtml = `
      <div class="card p-3 mb-3 border bg-light position-relative" id="${rowId}">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-bold text-primary small"><i class="bi bi-calendar3 me-1"></i>Semester Record</span>
          <button type="button" class="btn btn-outline-danger btn-sm py-0 px-2 remove-sem-btn" title="Remove Semester">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="row g-2">
          <div class="col-md-2">
            <label class="form-label small">Semester</label>
            <select class="form-select form-select-sm sem-number" required>
              ${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}" ${data.semesterNumber == n ? 'selected' : ''}>Sem ${n}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small">SGPA (0 - 10)</label>
            <input type="number" class="form-control form-control-sm sem-sgpa" step="0.01" min="0" max="10" placeholder="e.g. 8.5" value="${data.sgpa ?? ''}" required>
          </div>
          <div class="col-md-2">
            <label class="form-label small">CGPA (0 - 10)</label>
            <input type="number" class="form-control form-control-sm sem-cgpa" step="0.01" min="0" max="10" placeholder="e.g. 8.5" value="${data.cgpa ?? ''}" required>
          </div>
          <div class="col-md-2">
            <label class="form-label small">Attendance %</label>
            <input type="number" class="form-control form-control-sm sem-attendance" min="0" max="100" placeholder="e.g. 92" value="${data.attendance ?? ''}" required>
          </div>
          <div class="col-md-4">
            <label class="form-label small">Academic Achievements</label>
            <input type="text" class="form-control form-control-sm sem-achievements" placeholder="e.g. Department topper in Maths" value="${data.academicAchievements ?? ''}">
          </div>
          <div class="col-12">
            <label class="form-label small">Subjects in which student performed well</label>
            <input type="text" class="form-control form-control-sm sem-goodsubjects" placeholder="e.g. Data Structures, Web Technology" value="${data.goodSubjects ?? ''}">
          </div>
        </div>
      </div>
    `;

    semesterContainer.insertAdjacentHTML('beforeend', semHtml);

    const el = document.getElementById(rowId);
    el.querySelector('.remove-sem-btn').addEventListener('click', () => el.remove());
  }

  function addArrearRow(data = {}) {
    const rowId = 'arr_row_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);

    const arrHtml = `
      <div class="card p-3 mb-3 border border-danger-subtle bg-white position-relative shadow-sm" id="${rowId}">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-bold text-danger small"><i class="bi bi-file-earmark-x me-1"></i>Arrear Subject Record</span>
          <button type="button" class="btn btn-outline-danger btn-sm py-0 px-2 remove-arr-btn" title="Remove Arrear Record">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="row g-2">
          <div class="col-md-2">
            <label class="form-label small">Occurred Sem</label>
            <select class="form-select form-select-sm arr-sem">
              ${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}" ${data.semester == n ? 'selected' : ''}>Sem ${n}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small">Subject Code</label>
            <input type="text" class="form-control form-control-sm arr-code" placeholder="e.g. CS3351" value="${data.subjectCode ?? ''}" required uppercase>
          </div>
          <div class="col-md-4">
            <label class="form-label small">Subject Name</label>
            <input type="text" class="form-control form-control-sm arr-name" placeholder="e.g. Data Structures" value="${data.subjectName ?? ''}" required>
          </div>
          <div class="col-md-2">
            <label class="form-label small">Attempts</label>
            <input type="number" class="form-control form-control-sm arr-attempts" min="1" value="${data.attempts ?? 1}">
          </div>
          <div class="col-md-2">
            <label class="form-label small">Status</label>
            <select class="form-select form-select-sm arr-status">
              <option value="Pending" ${data.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Cleared" ${data.status === 'Cleared' ? 'selected' : ''}>Cleared</option>
            </select>
          </div>

          <!-- Cleared fields row -->
          <div class="col-md-3 arr-cleared-block ${data.status === 'Cleared' ? '' : 'd-none'}">
            <label class="form-label small">Cleared in Sem</label>
            <select class="form-select form-select-sm arr-cleared-sem">
              <option value="">Select Sem</option>
              ${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}" ${data.clearedSemester == n ? 'selected' : ''}>Sem ${n}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-2 arr-cleared-block ${data.status === 'Cleared' ? '' : 'd-none'}">
            <label class="form-label small">Cleared Grade</label>
            <input type="text" class="form-control form-control-sm arr-cleared-grade" placeholder="e.g. B+" value="${data.clearedGrade ?? ''}">
          </div>
          <div class="col-md-4">
            <label class="form-label small">Reason for Difficulty</label>
            <input type="text" class="form-control form-control-sm arr-reason" placeholder="e.g. Health issue, complex algorithms" value="${data.reasonForDifficulty ?? ''}">
          </div>
          <div class="col-md-3">
            <label class="form-label small">Remedial Support Required?</label>
            <select class="form-select form-select-sm arr-remedial">
              <option value="No" ${data.remedialRequired === 'No' ? 'selected' : ''}>No</option>
              <option value="Yes" ${data.remedialRequired === 'Yes' ? 'selected' : ''}>Yes</option>
            </select>
          </div>
        </div>
      </div>
    `;

    arrearContainer.insertAdjacentHTML('beforeend', arrHtml);

    const el = document.getElementById(rowId);
    el.querySelector('.remove-arr-btn').addEventListener('click', () => {
      el.remove();
      if (arrearContainer.children.length === 0) {
        document.getElementById('arrearStatusNo').checked = true;
        arrearContainer.classList.add('d-none');
      }
    });

    const statusSelect = el.querySelector('.arr-status');
    const clearedBlocks = el.querySelectorAll('.arr-cleared-block');
    statusSelect.addEventListener('change', () => {
      const isCleared = statusSelect.value === 'Cleared';
      clearedBlocks.forEach(b => b.classList.toggle('d-none', !isCleared));
    });
  }

  // Pre-load data if in Edit Mode
  if (editId) {
    document.getElementById('formHeaderTitle').textContent = 'Update Student Profile';
    document.getElementById('formBreadcrumb').textContent = 'Update Student';
    document.getElementById('regNo').readOnly = true; // Protect register number primary key

    try {
      const response = await fetchWithAuth(`/api/students/${editId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        populateForm(result.data);
      } else {
        showAlert('Failed to load student data: ' + result.message, 'danger');
      }
    } catch (err) {
      console.error('Error fetching student:', err);
      showAlert('Unable to load student record from server.', 'danger');
    }
  }

  function populateForm(s) {
    document.getElementById('regNo').value = s.registerNumber || '';
    document.getElementById('studentName').value = s.name || '';
    if (s.dob) {
      document.getElementById('dob').value = new Date(s.dob).toISOString().split('T')[0];
    }
    document.getElementById('gender').value = s.gender || '';
    document.getElementById('department').value = s.department || '';
    document.getElementById('section').value = s.section || '';
    document.getElementById('category').value = s.category || 'Hosteller';
    categorySelect.dispatchEvent(new Event('change'));

    document.getElementById('hostelName').value = s.hostelName || '';
    document.getElementById('dayScholarDistance').value = s.dayScholarDistance || '';

    document.getElementById('institutionalEmail').value = s.institutionalEmail || '';
    document.getElementById('personalEmail').value = s.personalEmail || '';
    document.getElementById('mobile').value = s.mobile || '';
    document.getElementById('address').value = s.address || '';

    // Family
    if (s.father) {
      document.getElementById('fatherName').value = s.father.name || '';
      document.getElementById('fatherOccupation').value = s.father.occupation || '';
      document.getElementById('fatherIncome').value = s.father.incomeRange || '';
      document.getElementById('fatherMobile').value = s.father.mobile || '';
    }
    if (s.mother) {
      document.getElementById('motherName').value = s.mother.name || '';
      document.getElementById('motherOccupation').value = s.mother.occupation || '';
      document.getElementById('motherIncome').value = s.mother.incomeRange || '';
      document.getElementById('motherMobile').value = s.mother.mobile || '';
    }
    if (s.guardian) {
      document.getElementById('guardianName').value = s.guardian.name || '';
      document.getElementById('guardianContact').value = s.guardian.emergencyContact || '';
    }
    document.getElementById('isFirstGraduate').checked = !!s.isFirstGraduate;
    document.getElementById('scholarshipReceived').checked = !!s.scholarshipReceived;
    document.getElementById('financialGuidanceRequired').checked = !!s.financialGuidanceRequired;

    // Semesters
    semesterContainer.innerHTML = '';
    if (s.semesters && s.semesters.length > 0) {
      s.semesters.forEach(sem => addSemesterRow(sem));
    }

    // Arrears
    arrearContainer.innerHTML = '';
    if (s.arrears && s.arrears.length > 0) {
      document.getElementById('arrearStatusYes').checked = true;
      arrearContainer.classList.remove('d-none');
      s.arrears.forEach(arr => addArrearRow(arr));
    } else {
      document.getElementById('arrearStatusNo').checked = true;
      arrearContainer.classList.add('d-none');
    }

    // Technical
    document.getElementById('programmingLanguages').value = (s.programmingLanguages || []).join(', ');
    document.getElementById('technicalSkills').value = (s.technicalSkills || []).join(', ');
    document.getElementById('areaOfInterest').value = s.areaOfInterest || '';
    document.getElementById('preferredDomain').value = s.preferredDomain || '';
    document.getElementById('communicationSkill').value = s.communicationSkill || 'Intermediate';
    document.getElementById('aptitudeSkill').value = s.aptitudeSkill || 'Intermediate';
    document.getElementById('codingContests').value = s.codingContests || '';
    document.getElementById('githubUrl').value = s.github || '';
    document.getElementById('linkedinUrl').value = s.linkedin || '';
    document.getElementById('hackerrankUrl').value = s.hackerrank || '';
    document.getElementById('hackerearthUrl').value = s.hackerearth || '';

    // Self-evaluation
    document.getElementById('academicStrengths').value = s.academicStrengths || '';
    document.getElementById('technicalStrengths').value = s.technicalStrengths || '';
    document.getElementById('communicationStrengths').value = s.communicationStrengths || '';
    document.getElementById('areasRequiringImprovement').value = s.areasRequiringImprovement || '';
    document.getElementById('subjectsRequiringSupport').value = s.subjectsRequiringSupport || '';
    document.getElementById('technicalSkillsToDevelop').value = s.technicalSkillsToDevelop || '';
    document.getElementById('mentorSupportExpected').value = s.mentorSupportExpected || '';
    document.getElementById('shortTermGoal').value = s.shortTermGoal || '';
    document.getElementById('longTermGoal').value = s.longTermGoal || '';

    // Career Goal
    const goal = s.primaryCareerGoal || 'Placement';
    const radio = document.querySelector(`input[name="careerGoalRadio"][value="${goal}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change'));
    }

    if (s.placement) {
      document.getElementById('placementRole').value = s.placement.preferredRole || '';
      document.getElementById('placementDomain').value = s.placement.preferredDomain || '';
      document.getElementById('placementCompanyType').value = s.placement.companyType || '';
      document.getElementById('placementSalary').value = s.placement.expectedSalaryRange || '';
      document.getElementById('placementLocation').value = s.placement.preferredLocation || '';
      document.getElementById('placementTargetCompanies').value = s.placement.targetCompanies || '';
      document.getElementById('placementTrainingSupport').value = s.placement.trainingSupportRequired || '';
      document.getElementById('placementSkillsToImprove').value = s.placement.skillsToImprove || '';
    }

    if (s.higherStudies) {
      document.getElementById('higherProg').value = s.higherStudies.preferredProgramme || '';
      document.getElementById('higherSpec').value = s.higherStudies.specialization || '';
      document.getElementById('higherCountry').value = s.higherStudies.preferredCountry || '';
      document.getElementById('higherInstitutions').value = s.higherStudies.targetInstitutions || '';
      document.getElementById('higherExam').value = s.higherStudies.plannedExam || '';
      document.getElementById('higherYear').value = s.higherStudies.expectedAdmissionYear || '';
      document.getElementById('higherGuidance').value = s.higherStudies.guidanceRequired || '';
    }

    if (s.entrepreneurship) {
      document.getElementById('entIdea').value = s.entrepreneurship.startupIdea || '';
      document.getElementById('entStage').value = s.entrepreneurship.currentStage || '';
      document.getElementById('entProblem').value = s.entrepreneurship.problemAddressed || '';
      document.getElementById('entSolution').value = s.entrepreneurship.proposedSolution || '';
      document.getElementById('entCustomers').value = s.entrepreneurship.targetCustomers || '';
      document.getElementById('entTeam').value = s.entrepreneurship.teamInformation || '';
      document.getElementById('entTech').value = s.entrepreneurship.technology || '';
      document.getElementById('entFunding').value = s.entrepreneurship.fundingSupport || '';
      document.getElementById('entIncubation').value = s.entrepreneurship.incubationSupport || '';
      document.getElementById('entLaunchYear').value = s.entrepreneurship.expectedLaunchYear || '';
    }

    // Mentor notes
    document.getElementById('mentorName').value = s.mentorName || '';
    document.getElementById('mentorRemarks').value = s.mentorRemarks || '';
    document.getElementById('actionPlan').value = s.actionPlan || '';
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    // Client-side Validations
    const regNo = document.getElementById('regNo').value.trim().toUpperCase();
    const name = document.getElementById('studentName').value.trim();
    const dob = document.getElementById('dob').value;
    const gender = document.getElementById('gender').value;
    const department = document.getElementById('department').value;
    const section = document.getElementById('section').value.trim().toUpperCase();
    const category = document.getElementById('category').value;
    const institutionalEmail = document.getElementById('institutionalEmail').value.trim();
    const personalEmail = document.getElementById('personalEmail').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!regNo || !name || !dob || !gender || !department || !section || !institutionalEmail || !personalEmail || !mobile || !address) {
      showAlert('Please fill in all required personal detail fields.', 'danger');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      showAlert('Mobile number must be a valid 10-digit number.', 'danger');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Category conditional validation
    let hostelName = '';
    let dayScholarDistance = 0;
    if (category === 'Hosteller') {
      hostelName = document.getElementById('hostelName').value.trim();
      if (!hostelName) {
        showAlert('Hostel Name is required for Hostellers.', 'danger');
        return;
      }
    } else {
      const dist = document.getElementById('dayScholarDistance').value;
      if (dist === '' || isNaN(dist) || parseFloat(dist) < 0) {
        showAlert('Valid Distance from college is required for Day Scholars.', 'danger');
        return;
      }
      dayScholarDistance = parseFloat(dist);
    }

    // Extract dynamic semesters
    const semesterCards = semesterContainer.querySelectorAll('.card');
    const semesters = [];
    for (const card of semesterCards) {
      const semNum = parseInt(card.querySelector('.sem-number').value);
      const sgpa = parseFloat(card.querySelector('.sem-sgpa').value);
      const cgpa = parseFloat(card.querySelector('.sem-cgpa').value);
      const att = parseFloat(card.querySelector('.sem-attendance').value);
      const achievements = card.querySelector('.sem-achievements').value.trim();
      const goodSubjects = card.querySelector('.sem-goodsubjects').value.trim();

      if (isNaN(sgpa) || sgpa < 0 || sgpa > 10) {
        showAlert(`Invalid SGPA for Semester ${semNum}. Must be between 0 and 10.`, 'danger');
        return;
      }
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        showAlert(`Invalid CGPA for Semester ${semNum}. Must be between 0 and 10.`, 'danger');
        return;
      }
      if (isNaN(att) || att < 0 || att > 100) {
        showAlert(`Invalid Attendance for Semester ${semNum}. Must be between 0 and 100.`, 'danger');
        return;
      }

      semesters.push({
        semesterNumber: semNum,
        sgpa,
        cgpa,
        attendance: att,
        academicAchievements: achievements,
        goodSubjects
      });
    }

    // Extract dynamic arrears
    const arrearCards = arrearContainer.querySelectorAll('.card');
    const arrears = [];
    const hasArrearsSelected = document.getElementById('arrearStatusYes').checked;

    if (hasArrearsSelected && arrearCards.length > 0) {
      for (const card of arrearCards) {
        const sem = parseInt(card.querySelector('.arr-sem').value);
        const code = card.querySelector('.arr-code').value.trim().toUpperCase();
        const subName = card.querySelector('.arr-name').value.trim();
        const attempts = parseInt(card.querySelector('.arr-attempts').value) || 1;
        const status = card.querySelector('.arr-status').value;
        const reason = card.querySelector('.arr-reason').value.trim();
        const remedial = card.querySelector('.arr-remedial').value;

        if (!code || !subName) {
          showAlert('Subject Code and Subject Name are required for all arrear records.', 'danger');
          return;
        }

        const arrearObj = {
          semester: sem,
          subjectCode: code,
          subjectName: subName,
          attempts,
          status,
          reasonForDifficulty: reason,
          remedialRequired: remedial
        };

        if (status === 'Cleared') {
          const clSem = card.querySelector('.arr-cleared-sem').value;
          const clGrade = card.querySelector('.arr-cleared-grade').value.trim();
          if (clSem) arrearObj.clearedSemester = parseInt(clSem);
          if (clGrade) arrearObj.clearedGrade = clGrade;
        }

        arrears.push(arrearObj);
      }
    }

    // Extract Technical Skills
    const progLangs = document.getElementById('programmingLanguages').value
      .split(',').map(s => s.trim()).filter(Boolean);
    const techSkills = document.getElementById('technicalSkills').value
      .split(',').map(s => s.trim()).filter(Boolean);

    // Selected Career Goal
    const primaryCareerGoal = document.querySelector('input[name="careerGoalRadio"]:checked').value;

    const payload = {
      registerNumber: regNo,
      name,
      dob,
      gender,
      department,
      section,
      category,
      hostelName,
      dayScholarDistance,
      institutionalEmail,
      personalEmail,
      mobile,
      address,

      father: {
        name: document.getElementById('fatherName').value.trim(),
        occupation: document.getElementById('fatherOccupation').value.trim(),
        incomeRange: document.getElementById('fatherIncome').value,
        mobile: document.getElementById('fatherMobile').value.trim()
      },
      mother: {
        name: document.getElementById('motherName').value.trim(),
        occupation: document.getElementById('motherOccupation').value.trim(),
        incomeRange: document.getElementById('motherIncome').value,
        mobile: document.getElementById('motherMobile').value.trim()
      },
      guardian: {
        name: document.getElementById('guardianName').value.trim(),
        emergencyContact: document.getElementById('guardianContact').value.trim()
      },
      isFirstGraduate: document.getElementById('isFirstGraduate').checked,
      scholarshipReceived: document.getElementById('scholarshipReceived').checked,
      financialGuidanceRequired: document.getElementById('financialGuidanceRequired').checked,

      semesters,
      arrears,

      programmingLanguages: progLangs,
      technicalSkills: techSkills,
      areaOfInterest: document.getElementById('areaOfInterest').value.trim(),
      preferredDomain: document.getElementById('preferredDomain').value.trim(),
      communicationSkill: document.getElementById('communicationSkill').value,
      aptitudeSkill: document.getElementById('aptitudeSkill').value,
      codingContests: document.getElementById('codingContests').value.trim(),
      github: document.getElementById('githubUrl').value.trim(),
      linkedin: document.getElementById('linkedinUrl').value.trim(),
      hackerrank: document.getElementById('hackerrankUrl').value.trim(),
      hackerearth: document.getElementById('hackerearthUrl').value.trim(),

      academicStrengths: document.getElementById('academicStrengths').value.trim(),
      technicalStrengths: document.getElementById('technicalStrengths').value.trim(),
      communicationStrengths: document.getElementById('communicationStrengths').value.trim(),
      areasRequiringImprovement: document.getElementById('areasRequiringImprovement').value.trim(),
      subjectsRequiringSupport: document.getElementById('subjectsRequiringSupport').value.trim(),
      technicalSkillsToDevelop: document.getElementById('technicalSkillsToDevelop').value.trim(),
      mentorSupportExpected: document.getElementById('mentorSupportExpected').value.trim(),
      shortTermGoal: document.getElementById('shortTermGoal').value.trim(),
      longTermGoal: document.getElementById('longTermGoal').value.trim(),

      primaryCareerGoal,
      placement: {
        preferredRole: document.getElementById('placementRole').value.trim(),
        preferredDomain: document.getElementById('placementDomain').value.trim(),
        companyType: document.getElementById('placementCompanyType').value,
        expectedSalaryRange: document.getElementById('placementSalary').value.trim(),
        preferredLocation: document.getElementById('placementLocation').value.trim(),
        targetCompanies: document.getElementById('placementTargetCompanies').value.trim(),
        trainingSupportRequired: document.getElementById('placementTrainingSupport').value.trim(),
        skillsToImprove: document.getElementById('placementSkillsToImprove').value.trim()
      },
      higherStudies: {
        preferredProgramme: document.getElementById('higherProg').value.trim(),
        specialization: document.getElementById('higherSpec').value.trim(),
        preferredCountry: document.getElementById('higherCountry').value.trim(),
        targetInstitutions: document.getElementById('higherInstitutions').value.trim(),
        plannedExam: document.getElementById('higherExam').value,
        expectedAdmissionYear: parseInt(document.getElementById('higherYear').value) || undefined,
        guidanceRequired: document.getElementById('higherGuidance').value.trim()
      },
      entrepreneurship: {
        startupIdea: document.getElementById('entIdea').value.trim(),
        currentStage: document.getElementById('entStage').value,
        problemAddressed: document.getElementById('entProblem').value.trim(),
        proposedSolution: document.getElementById('entSolution').value.trim(),
        targetCustomers: document.getElementById('entCustomers').value.trim(),
        teamInformation: document.getElementById('entTeam').value.trim(),
        technology: document.getElementById('entTech').value.trim(),
        fundingSupport: document.getElementById('entFunding').value.trim(),
        incubationSupport: document.getElementById('entIncubation').value.trim(),
        expectedLaunchYear: parseInt(document.getElementById('entLaunchYear').value) || undefined
      },

      mentorName: document.getElementById('mentorName').value.trim(),
      mentorRemarks: document.getElementById('mentorRemarks').value.trim(),
      actionPlan: document.getElementById('actionPlan').value.trim()
    };

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';

    try {
      const endpoint = editId ? `/api/students/${editId}` : '/api/students';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast(result.message || 'Profile saved successfully!', 'success');
        const targetId = editId || (result.data ? result.data._id : '');
        setTimeout(() => {
          if (targetId) {
            window.location.href = `/student-profile.html?id=${targetId}`;
          } else {
            window.location.href = '/students.html';
          }
        }, 800);
      } else {
        showAlert(result.message || 'Error saving student profile.', 'danger');
      }
    } catch (err) {
      console.error('Submit error:', err);
      showAlert('Network error while saving profile.', 'danger');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i>Save Student Profile';
    }
  });

  function showAlert(msg, type = 'danger') {
    alertBox.textContent = msg;
    alertBox.className = `alert alert-${type} py-2 small mb-3`;
    alertBox.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function hideAlert() {
    alertBox.classList.add('d-none');
  }
});
