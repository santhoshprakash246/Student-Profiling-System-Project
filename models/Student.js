const mongoose = require('mongoose');

// Semester Academic Record Sub-schema
const semesterRecordSchema = new mongoose.Schema({
  semesterNumber: {
    type: Number,
    required: [true, 'Semester number is required'],
    min: [1, 'Semester must be between 1 and 8'],
    max: [8, 'Semester must be between 1 and 8']
  },
  sgpa: {
    type: Number,
    required: [true, 'SGPA is required'],
    min: [0, 'SGPA must be >= 0'],
    max: [10, 'SGPA cannot exceed 10']
  },
  cgpa: {
    type: Number,
    required: [true, 'Cumulative CGPA is required'],
    min: [0, 'CGPA must be >= 0'],
    max: [10, 'CGPA cannot exceed 10']
  },
  attendance: {
    type: Number,
    required: [true, 'Attendance percentage is required'],
    min: [0, 'Attendance must be >= 0'],
    max: [100, 'Attendance cannot exceed 100']
  },
  hasArrears: {
    type: Boolean,
    default: false
  },
  arrearCount: {
    type: Number,
    default: 0,
    min: [0, 'Arrear count cannot be negative']
  },
  academicAchievements: {
    type: String,
    trim: true,
    default: ''
  },
  goodSubjects: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: true, timestamps: true });

// Arrear Sub-schema
const arrearRecordSchema = new mongoose.Schema({
  semester: {
    type: Number,
    required: [true, 'Arrear semester is required'],
    min: [1, 'Semester must be between 1 and 8'],
    max: [8, 'Semester must be between 1 and 8']
  },
  subjectCode: {
    type: String,
    required: [true, 'Subject code is required'],
    uppercase: true,
    trim: true
  },
  subjectName: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  attempts: {
    type: Number,
    default: 1,
    min: [1, 'Attempts must be at least 1']
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Cleared'],
      message: 'Status must be Pending or Cleared'
    },
    default: 'Pending'
  },
  clearedSemester: {
    type: Number,
    min: 1,
    max: 8
  },
  clearedGrade: {
    type: String,
    trim: true
  },
  reasonForDifficulty: {
    type: String,
    trim: true,
    default: ''
  },
  remedialRequired: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  }
}, { _id: true, timestamps: true });

// Main Student Schema
const studentSchema = new mongoose.Schema({
  // 1. Personal Details
  registerNumber: {
    type: String,
    required: [true, 'Register Number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Student Name is required'],
    trim: true
  },
  dob: {
    type: Date,
    required: [true, 'Date of Birth is required']
  },
  gender: {
    type: String,
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Gender must be Male, Female, or Other'
    },
    required: [true, 'Gender is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    uppercase: true
  },
  institutionalEmail: {
    type: String,
    required: [true, 'Institutional Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid institutional email']
  },
  personalEmail: {
    type: String,
    required: [true, 'Personal Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid personal email']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Mobile number must be a valid 10-digit number']
  },
  address: {
    type: String,
    required: [true, 'Residential address is required'],
    trim: true
  },
  category: {
    type: String,
    enum: {
      values: ['Hosteller', 'Day Scholar'],
      message: 'Student category must be Hosteller or Day Scholar'
    },
    required: [true, 'Category is required']
  },
  hostelName: {
    type: String,
    trim: true,
    default: ''
  },
  dayScholarDistance: {
    type: Number,
    min: [0, 'Distance must be non-negative'],
    default: 0
  },

  // 2. Parent & Family Details
  father: {
    name: { type: String, trim: true, default: '' },
    occupation: { type: String, trim: true, default: '' },
    incomeRange: {
      type: String,
      enum: ['Below ₹1,00,000', '₹1,00,000 - ₹3,00,000', '₹3,00,000 - ₹6,00,000', '₹6,00,000 - ₹10,00,000', 'Above ₹10,00,000', 'Not Disclosed', ''],
      default: ''
    },
    mobile: { type: String, trim: true, default: '' }
  },
  mother: {
    name: { type: String, trim: true, default: '' },
    occupation: { type: String, trim: true, default: '' },
    incomeRange: {
      type: String,
      enum: ['Below ₹1,00,000', '₹1,00,000 - ₹3,00,000', '₹3,00,000 - ₹6,00,000', '₹6,00,000 - ₹10,00,000', 'Above ₹10,00,000', 'Not Disclosed', ''],
      default: ''
    },
    mobile: { type: String, trim: true, default: '' }
  },
  guardian: {
    name: { type: String, trim: true, default: '' },
    emergencyContact: { type: String, trim: true, default: '' }
  },
  isFirstGraduate: {
    type: Boolean,
    default: false
  },
  scholarshipReceived: {
    type: Boolean,
    default: false
  },
  financialGuidanceRequired: {
    type: Boolean,
    default: false
  },

  // 3. Semester-wise Academic Details
  semesters: [semesterRecordSchema],

  // 4. Arrear Management
  arrears: [arrearRecordSchema],

  // 5. Technical and Professional Profile
  programmingLanguages: {
    type: [String],
    default: []
  },
  technicalSkills: {
    type: [String],
    default: []
  },
  areaOfInterest: {
    type: String,
    trim: true,
    default: ''
  },
  preferredDomain: {
    type: String,
    trim: true,
    default: ''
  },
  certifications: [{
    name: { type: String, trim: true },
    organization: { type: String, trim: true },
    issueDate: { type: String, trim: true },
    credentialUrl: { type: String, trim: true }
  }],
  projects: [{
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    techStack: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    liveUrl: { type: String, trim: true }
  }],
  hackathons: [{
    eventName: { type: String, trim: true },
    roleOrAward: { type: String, trim: true },
    year: { type: String, trim: true }
  }],
  codingContests: {
    type: String,
    trim: true,
    default: ''
  },
  internships: [{
    company: { type: String, trim: true },
    role: { type: String, trim: true },
    duration: { type: String, trim: true },
    description: { type: String, trim: true }
  }],
  github: {
    type: String,
    trim: true,
    default: ''
  },
  linkedin: {
    type: String,
    trim: true,
    default: ''
  },
  hackerrank: {
    type: String,
    trim: true,
    default: ''
  },
  hackerearth: {
    type: String,
    trim: true,
    default: ''
  },
  communicationSkill: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  aptitudeSkill: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },

  // 6. Strength & Improvement Analysis (Self-Evaluation)
  academicStrengths: { type: String, trim: true, default: '' },
  technicalStrengths: { type: String, trim: true, default: '' },
  communicationStrengths: { type: String, trim: true, default: '' },
  leadershipQualities: { type: String, trim: true, default: '' },
  teamworkAbilities: { type: String, trim: true, default: '' },
  areasRequiringImprovement: { type: String, trim: true, default: '' },
  subjectsRequiringSupport: { type: String, trim: true, default: '' },
  technicalSkillsToDevelop: { type: String, trim: true, default: '' },
  communicationSkillsToImprove: { type: String, trim: true, default: '' },
  aptitudeSkillsToImprove: { type: String, trim: true, default: '' },
  mentorSupportExpected: { type: String, trim: true, default: '' },
  shortTermGoal: { type: String, trim: true, default: '' },
  longTermGoal: { type: String, trim: true, default: '' },

  // 7. Final Career Goal
  primaryCareerGoal: {
    type: String,
    enum: {
      values: ['Placement', 'Higher Studies', 'Entrepreneurship'],
      message: 'Primary Career Goal must be Placement, Higher Studies, or Entrepreneurship'
    },
    required: [true, 'Primary career goal is required']
  },
  placement: {
    preferredRole: { type: String, trim: true, default: '' },
    preferredDomain: { type: String, trim: true, default: '' },
    companyType: {
      type: String,
      enum: ['Product', 'Service', 'Core', 'Start-up', ''],
      default: ''
    },
    expectedSalaryRange: { type: String, trim: true, default: '' },
    preferredLocation: { type: String, trim: true, default: '' },
    targetCompanies: { type: String, trim: true, default: '' },
    trainingSupportRequired: { type: String, trim: true, default: '' },
    skillsToImprove: { type: String, trim: true, default: '' }
  },
  higherStudies: {
    preferredProgramme: { type: String, trim: true, default: '' },
    specialization: { type: String, trim: true, default: '' },
    preferredCountry: { type: String, trim: true, default: '' },
    targetInstitutions: { type: String, trim: true, default: '' },
    plannedExam: {
      type: String,
      enum: ['GATE', 'GRE', 'IELTS', 'TOEFL', 'CAT', 'Other', ''],
      default: ''
    },
    expectedAdmissionYear: { type: Number },
    guidanceRequired: { type: String, trim: true, default: '' }
  },
  entrepreneurship: {
    startupIdea: { type: String, trim: true, default: '' },
    problemAddressed: { type: String, trim: true, default: '' },
    proposedSolution: { type: String, trim: true, default: '' },
    targetCustomers: { type: String, trim: true, default: '' },
    currentStage: {
      type: String,
      enum: ['Idea', 'Prototype', 'MVP', 'Revenue', ''],
      default: ''
    },
    teamInformation: { type: String, trim: true, default: '' },
    technology: { type: String, trim: true, default: '' },
    fundingSupport: { type: String, trim: true, default: '' },
    incubationSupport: { type: String, trim: true, default: '' },
    expectedLaunchYear: { type: Number }
  },

  // 8. Mentoring / Faculty Notes
  mentorName: {
    type: String,
    trim: true,
    default: ''
  },
  mentorRemarks: {
    type: String,
    trim: true,
    default: ''
  },
  actionPlan: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Helper virtual to calculate latest CGPA
studentSchema.virtual('latestCgpa').get(function () {
  if (this.semesters && this.semesters.length > 0) {
    const sorted = [...this.semesters].sort((a, b) => b.semesterNumber - a.semesterNumber);
    return sorted[0].cgpa;
  }
  return 0;
});

// Helper virtual to count active/pending arrears
studentSchema.virtual('pendingArrearsCount').get(function () {
  if (this.arrears && this.arrears.length > 0) {
    return this.arrears.filter(a => a.status === 'Pending').length;
  }
  return 0;
});

// Helper virtual to count cleared arrears
studentSchema.virtual('clearedArrearsCount').get(function () {
  if (this.arrears && this.arrears.length > 0) {
    return this.arrears.filter(a => a.status === 'Cleared').length;
  }
  return 0;
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
