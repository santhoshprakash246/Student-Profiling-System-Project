require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');

async function seedData(isAuto = false) {
  try {
    if (!isAuto) {
      console.log('[Seed] Connecting to database...');
      await connectDB();
      console.log('[Seed] Clearing existing collections...');
      await User.deleteMany({});
      await Student.deleteMany({});
    }

    // 1. Create Faculty Users
    const faculty = new User({
      username: 'faculty@bytexl.com',
      password: 'Faculty@123',
      role: 'faculty',
      name: 'Dr. K. Arul Murugan',
      active: true
    });
    await faculty.save();

    const faculty2 = new User({
      username: 'faculty',
      password: 'Faculty@123',
      role: 'faculty',
      name: 'Dr. K. Arul Murugan',
      active: true
    });
    await faculty2.save();

    console.log('[Seed] Faculty users ready: faculty / Faculty@123');

    // 2. Realistic Students
    const sampleStudents = [
      {
        registerNumber: '24BCS246',
        name: 'Santhosh Prakash',
        dob: new Date('2004-06-14'),
        gender: 'Male',
        department: 'CSE',
        section: 'B',
        institutionalEmail: 'santhosh.24bcs246@bytexl.edu.in',
        personalEmail: 'santhosh.prakash.tech@gmail.com',
        mobile: '9840123456',
        address: 'No. 42, Green Valley Enclave, Gandhipuram, Coimbatore - 641012',
        category: 'Hosteller',
        hostelName: 'Kaveri Hostel, Room 304',
        dayScholarDistance: 0,
        father: {
          name: 'Prakash R',
          occupation: 'Senior Mechanical Engineer',
          incomeRange: '₹6,00,000 - ₹10,00,000',
          mobile: '9840198765'
        },
        mother: {
          name: 'Lakshmi P',
          occupation: 'High School Teacher',
          incomeRange: '₹3,00,000 - ₹6,00,000',
          mobile: '9840198766'
        },
        guardian: {
          name: 'Prakash R',
          emergencyContact: '9840198765'
        },
        isFirstGraduate: false,
        scholarshipReceived: true,
        financialGuidanceRequired: false,
        semesters: [
          {
            semesterNumber: 1,
            sgpa: 8.65,
            cgpa: 8.65,
            attendance: 94,
            hasArrears: false,
            arrearCount: 0,
            academicAchievements: 'Department top 5% in C Programming and Calculus',
            goodSubjects: 'Problem Solving and Python, Engineering Mathematics I'
          },
          {
            semesterNumber: 2,
            sgpa: 8.80,
            cgpa: 8.73,
            attendance: 92,
            hasArrears: false,
            arrearCount: 0,
            academicAchievements: 'Perfect score in Data Structures Laboratory',
            goodSubjects: 'Object Oriented Programming in C++, Digital Principles'
          },
          {
            semesterNumber: 3,
            sgpa: 9.10,
            cgpa: 8.85,
            attendance: 96,
            hasArrears: false,
            arrearCount: 0,
            academicAchievements: 'Dean Honor Roll for outstanding semester SGPA > 9.0',
            goodSubjects: 'Design and Analysis of Algorithms, Database Management Systems'
          }
        ],
        arrears: [],
        programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'C++', 'Java'],
        technicalSkills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Docker', 'RESTful APIs', 'Git'],
        areaOfInterest: 'Full Stack Web Development & Distributed Systems',
        preferredDomain: 'Cloud Computing & Enterprise Software',
        certifications: [
          {
            name: 'AWS Certified Cloud Practitioner',
            organization: 'Amazon Web Services',
            issueDate: '2024-11',
            credentialUrl: 'https://aws.amazon.com/verify/mock-cert'
          },
          {
            name: 'Meta Full-Stack Developer Professional Certificate',
            organization: 'Coursera / Meta',
            issueDate: '2025-01',
            credentialUrl: 'https://coursera.org/verify/meta-mock'
          }
        ],
        projects: [
          {
            title: 'EduSphere Campus Collab Platform',
            description: 'A real-time student collaboration and resource sharing web application with MERN stack.',
            techStack: 'Node.js, Express, React, Socket.io, MongoDB',
            githubUrl: 'https://github.com/santhoshp/edusphere',
            liveUrl: 'https://edusphere-demo.bytebox.dev'
          },
          {
            title: 'Smart Waste Segregation IoT Dashboard',
            description: 'IoT telemetry portal visualizing municipal bin capacity and automated fleet routing.',
            techStack: 'Python, Flask, MQTT, Chart.js',
            githubUrl: 'https://github.com/santhoshp/iot-waste-segregator',
            liveUrl: ''
          }
        ],
        hackathons: [
          {
            eventName: 'Smart India Hackathon (College Level)',
            roleOrAward: 'First Runner Up - Web Track',
            year: '2024'
          }
        ],
        codingContests: 'Solved 350+ problems across LeetCode (Rating 1680) and CodeChef (3 Star)',
        internships: [
          {
            company: 'TechNovation Labs',
            role: 'Full Stack Engineering Intern',
            duration: '2 Months (May - Jul 2024)',
            description: 'Assisted in developing REST API microservices and React dashboards for inventory management.'
          }
        ],
        github: 'https://github.com/santhosh-prakash',
        linkedin: 'https://linkedin.com/in/santhosh-prakash-dev',
        hackerrank: 'https://hackerrank.com/santhosh_24bcs',
        hackerearth: 'https://hackerearth.com/@santhoshp',
        communicationSkill: 'Advanced',
        aptitudeSkill: 'Advanced',
        academicStrengths: 'Strong conceptual clarity in algorithmic problem solving and database design.',
        technicalStrengths: 'Full stack development, clean modular code, fast debugging, API design.',
        communicationStrengths: 'Confident technical presentation, clear documentation, active listening.',
        leadershipQualities: 'Led 4-member hackathon team to win prize; organizing tech club events.',
        teamworkAbilities: 'Collaborates effectively using Git workflows and agile sprint practices.',
        areasRequiringImprovement: 'Advanced System Design and High-Performance concurrency optimization.',
        subjectsRequiringSupport: 'None at present.',
        technicalSkillsToDevelop: 'Kubernetes, Go (Golang), Apache Kafka, GraphQL',
        communicationSkillsToImprove: 'Public executive speaking during large-scale conferences',
        aptitudeSkillsToImprove: 'Permutation & Combination speed drills for Tier-1 company screening rounds',
        mentorSupportExpected: 'Guidance on Tier-1 Product Company mock interviews and system design feedback.',
        shortTermGoal: 'Crack a Product Company pre-placement internship offer with >= 15 LPA package.',
        longTermGoal: 'Become a Principal Solutions Architect at a premier global technology firm.',
        primaryCareerGoal: 'Placement',
        placement: {
          preferredRole: 'Full Stack Software Engineer / SDE-1',
          preferredDomain: 'Cloud Native Application Development',
          companyType: 'Product',
          expectedSalaryRange: '₹14,00,000 - ₹20,00,000',
          preferredLocation: 'Bengaluru / Hyderabad / Chennai',
          targetCompanies: 'Amazon, Atlassian, Zoho, Cisco, Microsoft',
          trainingSupportRequired: 'System design workshops and high-level behavioral interview mocks.',
          skillsToImprove: 'Distributed caching, low-level design patterns, system scalability.'
        },
        mentorName: 'Dr. K. Arul Murugan',
        mentorRemarks: 'High achiever with consistent SGPA progression. Ready for high-tier product company placement drives.',
        actionPlan: 'Assign to advanced competitive coding cohort and nominate for campus research lab.'
      },
      {
        registerNumber: '24BCS108',
        name: 'Ananya Sharma',
        dob: new Date('2004-09-22'),
        gender: 'Female',
        department: 'CSE',
        section: 'A',
        institutionalEmail: 'ananya.24bcs108@bytexl.edu.in',
        personalEmail: 'ananya.sharma.cs@gmail.com',
        mobile: '9876543210',
        address: 'Flat 402, Pearl Heights, Avinashi Road, Coimbatore - 641004',
        category: 'Day Scholar',
        hostelName: '',
        dayScholarDistance: 7.5,
        father: {
          name: 'Mahesh Sharma',
          occupation: 'Bank Branch Manager',
          incomeRange: '₹6,00,000 - ₹10,00,000',
          mobile: '9876501234'
        },
        mother: {
          name: 'Sunita Sharma',
          occupation: 'College Lecturer',
          incomeRange: '₹3,00,000 - ₹6,00,000',
          mobile: '9876505678'
        },
        guardian: {
          name: 'Mahesh Sharma',
          emergencyContact: '9876501234'
        },
        isFirstGraduate: false,
        scholarshipReceived: false,
        financialGuidanceRequired: false,
        semesters: [
          {
            semesterNumber: 1,
            sgpa: 8.90,
            cgpa: 8.90,
            attendance: 95,
            hasArrears: false,
            arrearCount: 0,
            academicAchievements: 'Highest marks in Discrete Mathematics',
            goodSubjects: 'Discrete Mathematics, Physics for Information Science'
          },
          {
            semesterNumber: 2,
            sgpa: 9.20,
            cgpa: 9.05,
            attendance: 97,
            hasArrears: false,
            arrearCount: 0,
            academicAchievements: 'Rank 1 in Computer Science Department Semester 2',
            goodSubjects: 'Data Structures, Computer Organization and Architecture'
          }
        ],
        arrears: [],
        programmingLanguages: ['Python', 'C++', 'R', 'SQL'],
        technicalSkills: ['Machine Learning', 'PyTorch', 'Scikit-Learn', 'Pandas', 'Computer Vision'],
        areaOfInterest: 'Artificial Intelligence & Natural Language Processing',
        preferredDomain: 'Deep Learning & Computational Neuroscience',
        certifications: [
          {
            name: 'Deep Learning Specialization by Andrew Ng',
            organization: 'DeepLearning.AI / Coursera',
            issueDate: '2024-08',
            credentialUrl: 'https://coursera.org/verify/dl-mock'
          }
        ],
        projects: [
          {
            title: 'Medical Image Classification using Transformers',
            description: 'Vision Transformer (ViT) implementation for early detection of lung pneumonia on chest X-rays.',
            techStack: 'Python, PyTorch, HuggingFace, Streamlit',
            githubUrl: 'https://github.com/ananya-sharma/vit-med-imaging',
            liveUrl: ''
          }
        ],
        hackathons: [],
        codingContests: 'LeetCode 200+ problems, active on Kaggle (Notebooks Bronze)',
        internships: [],
        github: 'https://github.com/ananya-sharma',
        linkedin: 'https://linkedin.com/in/ananya-sharma-ai',
        hackerrank: 'https://hackerrank.com/ananya_cs',
        hackerearth: '',
        communicationSkill: 'Advanced',
        aptitudeSkill: 'Advanced',
        academicStrengths: 'Exceptional mathematical rigor and theoretical computer science fundamentals.',
        technicalStrengths: 'Statistical modeling, AI algorithm implementation, Python scientific stack.',
        communicationStrengths: 'Clear academic writing, scientific paper presentation.',
        leadershipQualities: 'Student Secretary of IEEE Computer Society Student Chapter.',
        teamworkAbilities: 'Very supportive peer collaborator.',
        areasRequiringImprovement: 'Hardware accelerated model deployment and TensorRT quantization.',
        subjectsRequiringSupport: 'None.',
        technicalSkillsToDevelop: 'CUDA Programming, MLOps pipeline automation, LLM Fine-tuning',
        communicationSkillsToImprove: 'None',
        aptitudeSkillsToImprove: 'Verbal reasoning for GRE test prep',
        mentorSupportExpected: 'Guidance regarding Letters of Recommendation (LoR) and selecting research advisors.',
        shortTermGoal: 'Publish a peer-reviewed research paper and score 325+ in GRE.',
        longTermGoal: 'Complete MS / PhD in Computer Science at a premier university (CMU / Stanford / IISc).',
        primaryCareerGoal: 'Higher Studies',
        higherStudies: {
          preferredProgramme: 'MS in Computer Science (Artificial Intelligence)',
          specialization: 'Deep Learning and Vision',
          preferredCountry: 'United States / Germany / Singapore',
          targetInstitutions: 'CMU, Georgia Tech, TU Munich, NUS Singapore',
          plannedExam: 'GRE',
          expectedAdmissionYear: 2026,
          guidanceRequired: 'SOP review, research scholarship applications, and professor outreach.'
        },
        mentorName: 'Dr. K. Arul Murugan',
        mentorRemarks: 'Top-tier academic acumen. Recommended for undergraduate research fellowship.',
        actionPlan: 'Facilitate research paper co-authorship with departmental faculty lab.'
      },
      {
        registerNumber: '24BIT042',
        name: 'Rohan Varma',
        dob: new Date('2004-11-05'),
        gender: 'Male',
        department: 'IT',
        section: 'A',
        institutionalEmail: 'rohan.24bit042@bytexl.edu.in',
        personalEmail: 'rohan.varma.builder@gmail.com',
        mobile: '9789012345',
        address: '15, Anna Nagar Western Extension, Tiruppur - 641602',
        category: 'Day Scholar',
        hostelName: '',
        dayScholarDistance: 38,
        father: {
          name: 'Rajendra Varma',
          occupation: 'Textile Manufacturing Business',
          incomeRange: 'Above ₹10,00,000',
          mobile: '9789098765'
        },
        mother: {
          name: 'Meena Varma',
          occupation: 'Homemaker',
          incomeRange: 'Not Disclosed',
          mobile: '9789098766'
        },
        guardian: {
          name: 'Rajendra Varma',
          emergencyContact: '9789098765'
        },
        isFirstGraduate: false,
        scholarshipReceived: false,
        financialGuidanceRequired: false,
        semesters: [
          {
            semesterNumber: 1,
            sgpa: 7.80,
            cgpa: 7.80,
            attendance: 88,
            hasArrears: false,
            arrearCount: 0,
            academicAchievements: 'Campus Ideathon Best Commercial Pitch Award',
            goodSubjects: 'Web Technology, Python Essentials'
          },
          {
            semesterNumber: 2,
            sgpa: 8.10,
            cgpa: 7.95,
            attendance: 90,
            hasArrears: false,
            arrearCount: 0,
            academicAchievements: 'Built prototype for local textile order tracker',
            goodSubjects: 'Database Management Systems, Software Engineering'
          }
        ],
        arrears: [],
        programmingLanguages: ['JavaScript', 'Python', 'Dart'],
        technicalSkills: ['Flutter', 'Next.js', 'Firebase', 'Supabase', 'Figma UI/UX', 'Product Analytics'],
        areaOfInterest: 'Mobile App Ecosystems & B2B SaaS',
        preferredDomain: 'E-commerce Automation & Supply Chain Tech',
        certifications: [
          {
            name: 'Product Management Fundamentals',
            organization: 'Product School',
            issueDate: '2024-05',
            credentialUrl: ''
          }
        ],
        projects: [
          {
            title: 'TexFlow - B2B Apparel Order Dispatch Tracker',
            description: 'Cross-platform mobile application automating fabric batch dispatch notifications for MSMEs.',
            techStack: 'Flutter, Node.js, PostgreSQL, WhatsApp Cloud API',
            githubUrl: 'https://github.com/rohan-varma/texflow-core',
            liveUrl: 'https://texflow.app'
          }
        ],
        hackathons: [
          {
            eventName: 'E-Cell Venture Pitch 2024',
            roleOrAward: 'Winner - Best Feasible Business Model',
            year: '2024'
          }
        ],
        codingContests: 'Focused on product development and prototyping',
        internships: [],
        github: 'https://github.com/rohan-varma',
        linkedin: 'https://linkedin.com/in/rohan-varma-founder',
        hackerrank: '',
        hackerearth: '',
        communicationSkill: 'Advanced',
        aptitudeSkill: 'Intermediate',
        academicStrengths: 'Practical application of software engineering to solve industry business problems.',
        technicalStrengths: 'Fast MVP delivery, mobile development, intuitive UI/UX design.',
        communicationStrengths: 'Outstanding investor elevator pitch, persuasion, negotiation.',
        leadershipQualities: 'Founder spirit, leads team of 3 developers, resource coordinator.',
        teamworkAbilities: 'Motivational team leader.',
        areasRequiringImprovement: 'Rigorous theoretical data structures and formal algorithm analysis.',
        subjectsRequiringSupport: 'Design and Analysis of Algorithms',
        technicalSkillsToDevelop: 'DevOps, CI/CD, Microservice architecture',
        communicationSkillsToImprove: 'Formal corporate contractual documentation',
        aptitudeSkillsToImprove: 'Financial modeling and unit economics calculations',
        mentorSupportExpected: 'College Incubation Centre access, seed grant endorsement, patent assistance.',
        shortTermGoal: 'Launch beta version of TexFlow to 10 local manufacturing clients.',
        longTermGoal: 'Build a profitable B2B SaaS company generating $1M ARR.',
        primaryCareerGoal: 'Entrepreneurship',
        entrepreneurship: {
          startupIdea: 'TexFlow - Cloud ERP & Dispatch Tracking for Apparel SMEs',
          problemAddressed: 'Unorganized manual phone calls and ledger delays in textile supply chain logistics.',
          proposedSolution: 'Mobile-first ERP with QR tracking and WhatsApp status alerts for fabric mill dispatchers.',
          targetCustomers: 'Garment manufacturing MSMEs in Tiruppur and Surat.',
          currentStage: 'MVP',
          teamInformation: '3 members (1 UI/Product lead, 2 Developers)',
          technology: 'Flutter, Node.js, PostgreSQL, Cloudflare',
          fundingSupport: 'Seeking ₹5,00,000 college innovation seed funding grant.',
          incubationSupport: 'Needs dedicated workstation and mentor advisory at College Technology Incubator.',
          expectedLaunchYear: 2025
        },
        mentorName: 'Dr. K. Arul Murugan',
        mentorRemarks: 'Strong entrepreneurial drive. Academic attendance needs monitoring due to startup commitments.',
        actionPlan: 'Connect with College TBI (Technology Business Incubator) for seed grant proposal.'
      },
      {
        registerNumber: '24BCS199',
        name: 'Karthik Rajan',
        dob: new Date('2004-03-18'),
        gender: 'Male',
        department: 'CSE',
        section: 'B',
        institutionalEmail: 'karthik.24bcs199@bytexl.edu.in',
        personalEmail: 'karthik.rajan99@yahoo.com',
        mobile: '9123456780',
        address: 'Plot 8, Teachers Colony, Pollachi - 642001',
        category: 'Hosteller',
        hostelName: 'Bhavani Hostel, Room 112',
        dayScholarDistance: 0,
        father: {
          name: 'Rajan S',
          occupation: 'Farmer',
          incomeRange: 'Below ₹1,00,000',
          mobile: '9123451111'
        },
        mother: {
          name: 'Parvathi R',
          occupation: 'Agricultural Worker',
          incomeRange: 'Below ₹1,00,000',
          mobile: '9123452222'
        },
        guardian: {
          name: 'Rajan S',
          emergencyContact: '9123451111'
        },
        isFirstGraduate: true,
        scholarshipReceived: true,
        financialGuidanceRequired: true,
        semesters: [
          {
            semesterNumber: 1,
            sgpa: 7.10,
            cgpa: 7.10,
            attendance: 84,
            hasArrears: false,
            arrearCount: 0,
            academicAchievements: '',
            goodSubjects: 'English for Communication, Environmental Science'
          },
          {
            semesterNumber: 2,
            sgpa: 6.20,
            cgpa: 6.65,
            attendance: 76,
            hasArrears: true,
            arrearCount: 1,
            academicAchievements: '',
            goodSubjects: 'Programming in C'
          }
        ],
        arrears: [
          {
            semester: 2,
            subjectCode: 'CS3351',
            subjectName: 'Data Structures and Algorithms',
            attempts: 1,
            status: 'Pending',
            reasonForDifficulty: 'Fell ill with dengue during semester examinations; struggled with tree traversals and dynamic programming.',
            remedialRequired: 'Yes'
          }
        ],
        programmingLanguages: ['C', 'Java'],
        technicalSkills: ['HTML', 'CSS', 'Basic SQL'],
        areaOfInterest: 'Information Technology Support & Quality Assurance',
        preferredDomain: 'Software Testing & Automation',
        certifications: [],
        projects: [],
        hackathons: [],
        codingContests: '',
        internships: [],
        github: '',
        linkedin: '',
        hackerrank: 'https://hackerrank.com/karthik_rajan99',
        hackerearth: '',
        communicationSkill: 'Beginner',
        aptitudeSkill: 'Intermediate',
        academicStrengths: 'Hardworking, punctual, dedicated listener in remedial sessions.',
        technicalStrengths: 'Basic programming syntax, database querying.',
        communicationStrengths: 'Respectful, honest about doubts and learning pace.',
        leadershipQualities: 'Supports hostel mess committee.',
        teamworkAbilities: 'Cooperates well with laboratory batch partners.',
        areasRequiringImprovement: 'Data Structures concepts (Trees, Graphs, DP), English conversational fluency.',
        subjectsRequiringSupport: 'CS3351 - Data Structures, Discrete Mathematics',
        technicalSkillsToDevelop: 'Object Oriented Java, Selenium, SQL, Git basics',
        communicationSkillsToImprove: 'Overcoming stage fear and hesitation in answering questions in English',
        aptitudeSkillsToImprove: 'Time management in speed quantitative tests',
        mentorSupportExpected: 'Special remedial tutorial sessions for CS3351 and peer study partner allocation.',
        shortTermGoal: 'Clear CS3351 arrear in the upcoming Nov/Dec supplementary exam with Grade B+ or higher.',
        longTermGoal: 'Secure a QA / Software Support Engineer placement in an established IT Services firm.',
        primaryCareerGoal: 'Placement',
        placement: {
          preferredRole: 'Junior QA Engineer / Application Support Associate',
          preferredDomain: 'IT Services & Testing',
          companyType: 'Service',
          expectedSalaryRange: '₹3,50,000 - ₹5,00,000',
          preferredLocation: 'Coimbatore / Chennai',
          targetCompanies: 'TCS, Infosys, Wipro, Cognizant, Hexaware',
          trainingSupportRequired: 'Data structures bridge classes, English communication lab, aptitude training.',
          skillsToImprove: 'DSA problem solving, mock technical interviews, resume building.'
        },
        mentorName: 'Dr. K. Arul Murugan',
        mentorRemarks: 'High priority student for remedial intervention. Declining SGPA in Sem 2 due to health; active CS3351 arrear.',
        actionPlan: 'Assign peer mentor (Santhosh Prakash), enroll in Saturday remedial clinic, track weekly attendance.'
      },
      {
        registerNumber: '24BEC015',
        name: 'Priya Sundaram',
        dob: new Date('2004-08-10'),
        gender: 'Female',
        department: 'ECE',
        section: 'A',
        institutionalEmail: 'priya.24bec015@bytexl.edu.in',
        personalEmail: 'priya.sundaram.ece@gmail.com',
        mobile: '9443210987',
        address: '22, Crosscut Road, Gandhipuram, Coimbatore - 641012',
        category: 'Day Scholar',
        hostelName: '',
        dayScholarDistance: 4.2,
        father: {
          name: 'Sundaram K',
          occupation: 'State Government Employee',
          incomeRange: '₹3,00,000 - ₹6,00,000',
          mobile: '9443299991'
        },
        mother: {
          name: 'Revathi S',
          occupation: 'Postal Department Staff',
          incomeRange: '₹3,00,000 - ₹6,00,000',
          mobile: '9443299992'
        },
        guardian: {
          name: 'Sundaram K',
          emergencyContact: '9443299991'
        },
        isFirstGraduate: false,
        scholarshipReceived: false,
        financialGuidanceRequired: false,
        semesters: [
          {
            semesterNumber: 1,
            sgpa: 8.20,
            cgpa: 8.20,
            attendance: 92,
            hasArrears: false,
            arrearCount: 0,
            academicAchievements: 'Distinction in Electronic Devices',
            goodSubjects: 'Electric Circuits, Semiconductor Devices'
          },
          {
            semesterNumber: 2,
            sgpa: 8.45,
            cgpa: 8.32,
            attendance: 94,
            hasArrears: false,
            arrearCount: 0,
            academicAchievements: 'Embedded Robotics First Prize in College Symposium',
            goodSubjects: 'Digital Logic Circuits, Signals and Systems'
          }
        ],
        arrears: [],
        programmingLanguages: ['Embedded C', 'Python', 'Verilog'],
        technicalSkills: ['STM32', 'Arduino', 'MATLAB', 'Keil uVision', 'PCB Design (KiCad)'],
        areaOfInterest: 'Embedded Systems & Internet of Things',
        preferredDomain: 'Automotive Electronics & Core Hardware',
        certifications: [
          {
            name: 'Embedded Systems Design with ARM Cortex-M',
            organization: 'NPTEL / IIT Madras',
            issueDate: '2024-10',
            credentialUrl: 'https://nptel.ac.in/mock'
          }
        ],
        projects: [
          {
            title: 'CAN-Bus Telemetry for Electric Two-Wheelers',
            description: 'Automotive CAN communication bridge transmitting battery temperature and voltage metrics to cloud.',
            techStack: 'STM32 Nucleo, CAN Transceiver, ESP32, MQTT',
            githubUrl: 'https://github.com/priya-sundaram/can-telemetry',
            liveUrl: ''
          }
        ],
        hackathons: [
          {
            eventName: 'Hardware Hackathon 2024',
            roleOrAward: 'Best Innovation in Mobility',
            year: '2024'
          }
        ],
        codingContests: 'Solved 100+ basic C algorithms',
        internships: [
          {
            company: 'Pricol Electronics Ltd',
            role: 'Hardware Testing Intern',
            duration: '1 Month',
            description: 'Executed test harnesses for digital instrument cluster boards.'
          }
        ],
        github: 'https://github.com/priya-sundaram',
        linkedin: 'https://linkedin.com/in/priya-sundaram-ece',
        hackerrank: '',
        hackerearth: '',
        communicationSkill: 'Intermediate',
        aptitudeSkill: 'Advanced',
        academicStrengths: 'Strong analytical skills in analog and digital electronics.',
        technicalStrengths: 'Embedded microcontroller interfacing, circuit debugging, schematic capture.',
        communicationStrengths: 'Organized and articulate in laboratory reviews.',
        leadershipQualities: 'Vice President of Electronics Hobby Club.',
        teamworkAbilities: 'Hands-on project team lead.',
        areasRequiringImprovement: 'High-speed signal integrity and RTOS kernel internals.',
        subjectsRequiringSupport: 'None.',
        technicalSkillsToDevelop: 'FreeRTOS, Embedded Linux, Automotive Ethernet',
        communicationSkillsToImprove: 'Public presentation before industry corporate panels',
        aptitudeSkillsToImprove: 'Core technical written test questions',
        mentorSupportExpected: 'Core company campus drive connections and referral guidance.',
        shortTermGoal: 'Secure Core Engineering placement in Automotive Electronics.',
        longTermGoal: 'Senior Embedded Firmware Architect in EV Mobility.',
        primaryCareerGoal: 'Placement',
        placement: {
          preferredRole: 'Embedded Software Engineer / Firmware Developer',
          preferredDomain: 'Automotive Embedded Systems',
          companyType: 'Core',
          expectedSalaryRange: '₹8,00,000 - ₹12,00,000',
          preferredLocation: 'Bengaluru / Pune / Coimbatore',
          targetCompanies: 'Robert Bosch, Continental, Texas Instruments, Qualcomm, Tata Elxsi',
          trainingSupportRequired: 'Advanced RTOS and Automotive protocol test prep.',
          skillsToImprove: 'FreeRTOS synchronization primitives, I2C/SPI bus timing analysis.'
        },
        mentorName: 'Dr. K. Arul Murugan',
        mentorRemarks: 'Very promising core engineering student. Excellent lab aptitude.',
        actionPlan: 'Facilitate specialized training for Bosch and Texas Instruments core recruitment.'
      }
    ];

    for (const studentData of sampleStudents) {
      const student = await Student.create(studentData);
      console.log(`[Seed] Created student profile: ${student.name} (${student.registerNumber})`);

      // Create matching student user
      const user = new User({
        username: student.registerNumber.toLowerCase(),
        password: 'Student@123',
        role: 'student',
        name: student.name,
        registerNumber: student.registerNumber,
        active: true
      });
      await user.save();
      console.log(`[Seed] Created student login: ${user.username} / Student@123`);
    }

    console.log('[Seed] Seeding completed successfully!');
    if (!isAuto) process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    if (!isAuto) process.exit(1);
  }
}

if (require.main === module) {
  seedData(false);
}

module.exports = { seedData };
