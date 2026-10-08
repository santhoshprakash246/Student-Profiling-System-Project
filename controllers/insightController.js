const Student = require('../models/Student');

// GET /api/insights - Retrieve class-level dashboard insights (Faculty only)
exports.getInsights = async (req, res) => {
  try {
    const students = await Student.find({});
    const totalStudents = students.length;

    if (totalStudents === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalStudents: 0,
          hostellerCount: 0,
          dayScholarCount: 0,
          currentAvgCgpa: 0,
          highestCgpa: 0,
          lowestCgpa: 0,
          semesterAvgSgpa: {},
          studentsImprovingCount: 0,
          studentsDecliningCount: 0,
          studentsWithActiveArrears: 0,
          totalPendingArrears: 0,
          totalClearedArrears: 0,
          topArrearSubjects: [],
          remedialSupportNeededCount: 0,
          missingProfiles: {
            noCertifications: 0,
            noProjects: 0,
            noGithub: 0,
            noLinkedin: 0
          },
          careerGoalDistribution: {
            placement: 0,
            higherStudies: 0,
            entrepreneurship: 0
          },
          commonStrengths: [],
          commonImprovementAreas: [],
          careerSkillGaps: {},
          mentorInterventionNeededCount: 0
        }
      });
    }

    // 1. Hosteller vs Day Scholar
    const hostellerCount = students.filter(s => s.category === 'Hosteller').length;
    const dayScholarCount = students.filter(s => s.category === 'Day Scholar').length;

    // 2. CGPA Metrics
    let cgpaSum = 0;
    let highestCgpa = 0;
    let lowestCgpa = 10;
    let cgpaCount = 0;

    students.forEach(s => {
      const cgpa = s.latestCgpa;
      if (cgpa > 0) {
        cgpaSum += cgpa;
        cgpaCount++;
        if (cgpa > highestCgpa) highestCgpa = cgpa;
        if (cgpa < lowestCgpa) lowestCgpa = cgpa;
      }
    });

    const currentAvgCgpa = cgpaCount > 0 ? Number((cgpaSum / cgpaCount).toFixed(2)) : 0;
    if (lowestCgpa === 10 && cgpaCount === 0) lowestCgpa = 0;

    // 3. Semester-wise Average SGPA
    const semSgpaSums = {};
    const semSgpaCounts = {};

    for (let sem = 1; sem <= 8; sem++) {
      semSgpaSums[sem] = 0;
      semSgpaCounts[sem] = 0;
    }

    students.forEach(s => {
      if (s.semesters && s.semesters.length > 0) {
        s.semesters.forEach(rec => {
          if (rec.semesterNumber >= 1 && rec.semesterNumber <= 8) {
            semSgpaSums[rec.semesterNumber] += rec.sgpa;
            semSgpaCounts[rec.semesterNumber]++;
          }
        });
      }
    });

    const semesterAvgSgpa = {};
    for (let sem = 1; sem <= 8; sem++) {
      if (semSgpaCounts[sem] > 0) {
        semesterAvgSgpa[`Sem ${sem}`] = Number((semSgpaSums[sem] / semSgpaCounts[sem]).toFixed(2));
      }
    }

    // 4. Academic Improvement and Decline Trends
    let studentsImprovingCount = 0;
    let studentsDecliningCount = 0;

    students.forEach(s => {
      if (s.semesters && s.semesters.length >= 2) {
        const sorted = [...s.semesters].sort((a, b) => a.semesterNumber - b.semesterNumber);
        const latest = sorted[sorted.length - 1].sgpa;
        const prev = sorted[sorted.length - 2].sgpa;
        if (latest > prev) {
          studentsImprovingCount++;
        } else if (latest < prev) {
          studentsDecliningCount++;
        }
      }
    });

    // 5. Arrear Statistics
    let studentsWithActiveArrears = 0;
    let totalPendingArrears = 0;
    let totalClearedArrears = 0;
    let remedialSupportNeededCount = 0;
    const subjectArrearCounts = {};

    students.forEach(s => {
      let hasPending = false;
      let needsRemedial = false;

      if (s.arrears && s.arrears.length > 0) {
        s.arrears.forEach(arr => {
          if (arr.status === 'Pending') {
            totalPendingArrears++;
            hasPending = true;
            if (arr.remedialRequired === 'Yes') {
              needsRemedial = true;
            }
          } else if (arr.status === 'Cleared') {
            totalClearedArrears++;
          }

          const key = `${arr.subjectCode} - ${arr.subjectName}`;
          subjectArrearCounts[key] = (subjectArrearCounts[key] || 0) + 1;
        });
      }

      if (hasPending) {
        studentsWithActiveArrears++;
      }
      if (needsRemedial) {
        remedialSupportNeededCount++;
      }
    });

    // Top subjects with arrears
    const topArrearSubjects = Object.entries(subjectArrearCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 6. Professional & Technical Preparedness Gaps
    let noCertifications = 0;
    let noProjects = 0;
    let noGithub = 0;
    let noLinkedin = 0;

    students.forEach(s => {
      if (!s.certifications || s.certifications.length === 0) noCertifications++;
      if (!s.projects || s.projects.length === 0) noProjects++;
      if (!s.github || s.github.trim() === '') noGithub++;
      if (!s.linkedin || s.linkedin.trim() === '') noLinkedin++;
    });

    // 7. Career Goal Distribution
    const placementCount = students.filter(s => s.primaryCareerGoal === 'Placement').length;
    const higherStudiesCount = students.filter(s => s.primaryCareerGoal === 'Higher Studies').length;
    const entrepreneurshipCount = students.filter(s => s.primaryCareerGoal === 'Entrepreneurship').length;

    // 8. Career Goal-wise Skill Gaps
    const placementSkillsToImprove = [];
    const higherStudiesGuidance = [];
    const entrepreneurshipSupport = [];

    students.forEach(s => {
      if (s.primaryCareerGoal === 'Placement' && s.placement && s.placement.skillsToImprove) {
        placementSkillsToImprove.push(s.placement.skillsToImprove);
      }
      if (s.primaryCareerGoal === 'Higher Studies' && s.higherStudies && s.higherStudies.guidanceRequired) {
        higherStudiesGuidance.push(s.higherStudies.guidanceRequired);
      }
      if (s.primaryCareerGoal === 'Entrepreneurship' && s.entrepreneurship && (s.entrepreneurship.fundingSupport || s.entrepreneurship.incubationSupport)) {
        entrepreneurshipSupport.push(`${s.entrepreneurship.fundingSupport || ''} ${s.entrepreneurship.incubationSupport || ''}`.trim());
      }
    });

    // 9. Common Strengths and Improvement Areas (Aggregated keywords)
    const strengthCountMap = {};
    const improvementCountMap = {};

    students.forEach(s => {
      if (s.technicalSkills && s.technicalSkills.length > 0) {
        s.technicalSkills.forEach(skill => {
          const clean = skill.trim();
          if (clean) strengthCountMap[clean] = (strengthCountMap[clean] || 0) + 1;
        });
      }
      if (s.technicalSkillsToDevelop) {
        const skills = s.technicalSkillsToDevelop.split(/[,;\n]/).map(t => t.trim()).filter(Boolean);
        skills.forEach(skill => {
          improvementCountMap[skill] = (improvementCountMap[skill] || 0) + 1;
        });
      }
    });

    const commonStrengths = Object.entries(strengthCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const commonImprovementAreas = Object.entries(improvementCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 10. Students Requiring Mentor Intervention
    // Criteria: CGPA < 6.5, active pending arrears, or declining SGPA trend
    let mentorInterventionCount = 0;
    students.forEach(s => {
      const cgpa = s.latestCgpa || 0;
      const hasPendingArrear = s.pendingArrearsCount > 0;
      let declining = false;
      if (s.semesters && s.semesters.length >= 2) {
        const sorted = [...s.semesters].sort((a, b) => a.semesterNumber - b.semesterNumber);
        if (sorted[sorted.length - 1].sgpa < sorted[sorted.length - 2].sgpa) {
          declining = true;
        }
      }

      if ((cgpa > 0 && cgpa < 6.5) || hasPendingArrear || declining) {
        mentorInterventionCount++;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        hostellerCount,
        dayScholarCount,
        currentAvgCgpa,
        highestCgpa,
        lowestCgpa,
        semesterAvgSgpa,
        studentsImprovingCount,
        studentsDecliningCount,
        studentsWithActiveArrears,
        totalPendingArrears,
        totalClearedArrears,
        topArrearSubjects,
        remedialSupportNeededCount,
        missingProfiles: {
          noCertifications,
          noProjects,
          noGithub,
          noLinkedin
        },
        careerGoalDistribution: {
          placement: placementCount,
          higherStudies: higherStudiesCount,
          entrepreneurship: entrepreneurshipCount
        },
        commonStrengths,
        commonImprovementAreas,
        careerSkillGaps: {
          placementSamples: placementSkillsToImprove.slice(0, 4),
          higherStudiesSamples: higherStudiesGuidance.slice(0, 4),
          entrepreneurshipSamples: entrepreneurshipSupport.slice(0, 4)
        },
        mentorInterventionNeededCount: mentorInterventionCount
      }
    });
  } catch (err) {
    console.error('Error generating dashboard insights:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute dashboard insights: ' + err.message
    });
  }
};
