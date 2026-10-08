document.addEventListener('DOMContentLoaded', async () => {
  // Check role authorization
  if (!checkAuthRole('faculty')) return;

  let sgpaChartInstance = null;
  let careerChartInstance = null;

  try {
    const response = await fetchWithAuth('/api/insights');
    const result = await response.json();

    if (response.ok && result.success) {
      renderDashboard(result.data);
    } else {
      showToast(result.message || 'Failed to load insights', 'danger');
    }
  } catch (err) {
    console.error('Error fetching insights:', err);
    showToast('Network error while loading dashboard insights.', 'danger');
  }

  function renderDashboard(data) {
    // 1. Metric Counts
    document.getElementById('totalStudentsCount').textContent = data.totalStudents || 0;
    document.getElementById('hostellerCount').textContent = data.hostellerCount || 0;
    document.getElementById('dayScholarCount').textContent = data.dayScholarCount || 0;

    document.getElementById('avgCgpaValue').textContent = data.currentAvgCgpa ? data.currentAvgCgpa.toFixed(2) : '0.00';
    document.getElementById('highestCgpaValue').textContent = data.highestCgpa ? data.highestCgpa.toFixed(2) : '-';
    document.getElementById('lowestCgpaValue').textContent = data.lowestCgpa ? data.lowestCgpa.toFixed(2) : '-';

    document.getElementById('activeArrearsStudents').textContent = data.studentsWithActiveArrears || 0;
    document.getElementById('pendingArrearsTotal').textContent = data.totalPendingArrears || 0;
    document.getElementById('clearedArrearsTotal').textContent = data.totalClearedArrears || 0;

    document.getElementById('improvingCount').textContent = data.studentsImprovingCount || 0;
    document.getElementById('decliningCount').textContent = data.studentsDecliningCount || 0;
    document.getElementById('mentorInterventionCount').textContent = data.mentorInterventionNeededCount || 0;

    // 2. Missing Profile Gaps
    if (data.missingProfiles) {
      document.getElementById('noCertificationsCount').textContent = data.missingProfiles.noCertifications || 0;
      document.getElementById('noProjectsCount').textContent = data.missingProfiles.noProjects || 0;
      document.getElementById('noGithubCount').textContent = data.missingProfiles.noGithub || 0;
      document.getElementById('noLinkedinCount').textContent = data.missingProfiles.noLinkedin || 0;
    }
    document.getElementById('remedialSupportCount').textContent = data.remedialSupportNeededCount || 0;

    // 3. Career Goals Totals
    const cg = data.careerGoalDistribution || {};
    document.getElementById('placementTotal').textContent = cg.placement || 0;
    document.getElementById('higherStudiesTotal').textContent = cg.higherStudies || 0;
    document.getElementById('entrepreneurshipTotal').textContent = cg.entrepreneurship || 0;

    // 4. Render SGPA Trend Chart
    const semKeys = Object.keys(data.semesterAvgSgpa || {});
    const semValues = Object.values(data.semesterAvgSgpa || {});

    const ctxSgpa = document.getElementById('semesterSgpaChart').getContext('2d');
    if (sgpaChartInstance) sgpaChartInstance.destroy();

    sgpaChartInstance = new Chart(ctxSgpa, {
      type: 'line',
      data: {
        labels: semKeys.length > 0 ? semKeys : ['Sem 1', 'Sem 2', 'Sem 3'],
        datasets: [{
          label: 'Class Average SGPA',
          data: semValues.length > 0 ? semValues : [0, 0, 0],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 5,
          pointBackgroundColor: '#1d4ed8'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 10,
            ticks: { stepSize: 1 }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

    // 5. Render Career Goal Doughnut Chart
    const ctxCareer = document.getElementById('careerGoalChart').getContext('2d');
    if (careerChartInstance) careerChartInstance.destroy();

    careerChartInstance = new Chart(ctxCareer, {
      type: 'doughnut',
      data: {
        labels: ['Placement', 'Higher Studies', 'Entrepreneurship'],
        datasets: [{
          data: [cg.placement || 0, cg.higherStudies || 0, cg.entrepreneurship || 0],
          backgroundColor: ['#3b82f6', '#a855f7', '#f59e0b'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12 } }
        }
      }
    });

    // 6. Top Arrear Subjects Table
    const arrearTbody = document.getElementById('topArrearSubjectsTable');
    if (data.topArrearSubjects && data.topArrearSubjects.length > 0) {
      arrearTbody.innerHTML = data.topArrearSubjects.map(item => `
        <tr>
          <td><span class="fw-semibold">${item.subject}</span></td>
          <td class="text-center"><span class="badge bg-danger rounded-pill px-2">${item.count}</span></td>
        </tr>
      `).join('');
    } else {
      arrearTbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted py-3">No active or recorded arrears found.</td></tr>`;
    }

    // 7. Common Strengths
    const strengthsContainer = document.getElementById('commonStrengthsContainer');
    if (data.commonStrengths && data.commonStrengths.length > 0) {
      strengthsContainer.innerHTML = data.commonStrengths.map(s => `
        <span class="skill-tag">${s.name} <span class="badge bg-primary-subtle text-primary rounded-pill">${s.count}</span></span>
      `).join('');
    } else {
      strengthsContainer.innerHTML = '<span class="text-muted small">No technical skills recorded yet.</span>';
    }

    // 8. Common Improvement Areas
    const improvementsContainer = document.getElementById('commonImprovementsContainer');
    if (data.commonImprovementAreas && data.commonImprovementAreas.length > 0) {
      improvementsContainer.innerHTML = data.commonImprovementAreas.map(i => `
        <span class="badge bg-secondary-subtle text-secondary me-1 mb-1 p-2">${i.name} (${i.count})</span>
      `).join('');
    } else {
      improvementsContainer.innerHTML = '<span class="text-muted small">No specific improvement areas flagged.</span>';
    }

    // 9. Career Goal Gaps Lists
    const pGaps = document.getElementById('placementGapsList');
    if (data.careerSkillGaps && data.careerSkillGaps.placementSamples && data.careerSkillGaps.placementSamples.length > 0) {
      pGaps.innerHTML = data.careerSkillGaps.placementSamples.map(gap => `<li>${gap}</li>`).join('');
    } else {
      pGaps.innerHTML = '<li class="text-muted">None reported</li>';
    }

    const hsGaps = document.getElementById('higherStudiesGapsList');
    if (data.careerSkillGaps && data.careerSkillGaps.higherStudiesSamples && data.careerSkillGaps.higherStudiesSamples.length > 0) {
      hsGaps.innerHTML = data.careerSkillGaps.higherStudiesSamples.map(gap => `<li>${gap}</li>`).join('');
    } else {
      hsGaps.innerHTML = '<li class="text-muted">None reported</li>';
    }

    const entGaps = document.getElementById('entrepreneurshipGapsList');
    if (data.careerSkillGaps && data.careerSkillGaps.entrepreneurshipSamples && data.careerSkillGaps.entrepreneurshipSamples.length > 0) {
      entGaps.innerHTML = data.careerSkillGaps.entrepreneurshipSamples.map(gap => `<li>${gap}</li>`).join('');
    } else {
      entGaps.innerHTML = '<li class="text-muted">None reported</li>';
    }
  }
});
