const Student = require('../models/Student');
const User = require('../models/User');

// GET /api/students - Retrieve all student profiles (Faculty only)
exports.getAllStudents = async (req, res) => {
  try {
    const {
      search,
      department,
      section,
      category,
      careerGoal,
      minCgpa,
      maxCgpa,
      arrearStatus
    } = req.query;

    const query = {};

    // Search by Name or Register Number
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { registerNumber: { $regex: term, $options: 'i' } }
      ];
    }

    // Filter by Department
    if (department && department.trim() !== '') {
      query.department = department.trim();
    }

    // Filter by Section
    if (section && section.trim() !== '') {
      query.section = section.trim().toUpperCase();
    }

    // Filter by Category (Hosteller / Day Scholar)
    if (category && category.trim() !== '') {
      query.category = category.trim();
    }

    // Filter by Career Goal
    if (careerGoal && careerGoal.trim() !== '') {
      query.primaryCareerGoal = careerGoal.trim();
    }

    let students = await Student.find(query).sort({ registerNumber: 1 });

    // In-memory filter for CGPA range and arrearStatus based on virtuals/embedded arrays
    if (minCgpa || maxCgpa) {
      const min = minCgpa ? parseFloat(minCgpa) : 0;
      const max = maxCgpa ? parseFloat(maxCgpa) : 10;
      students = students.filter(s => {
        const cgpa = s.latestCgpa || 0;
        return cgpa >= min && cgpa <= max;
      });
    }

    if (arrearStatus && arrearStatus.trim() !== '') {
      if (arrearStatus === 'Pending' || arrearStatus === 'Yes') {
        students = students.filter(s => s.pendingArrearsCount > 0);
      } else if (arrearStatus === 'Cleared') {
        students = students.filter(s => s.clearedArrearsCount > 0 && s.pendingArrearsCount === 0);
      } else if (arrearStatus === 'None' || arrearStatus === 'No') {
        students = students.filter(s => (!s.arrears || s.arrears.length === 0));
      }
    }

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    console.error('Error in getAllStudents:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students: ' + err.message
    });
  }
};

// GET /api/students/:id - Retrieve one student profile
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    // Role-based privacy check:
    // If student user, ensure they can only access their own profile
    if (req.user.role === 'student') {
      if (req.user.registerNumber !== student.registerNumber) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own profile.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Student ID format.'
      });
    }
    console.error('Error in getStudentById:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching student profile.'
    });
  }
};

// POST /api/students - Create a new student profile (Faculty only)
exports.createStudent = async (req, res) => {
  try {
    const studentData = req.body;

    // Check if register number is provided
    if (!studentData.registerNumber) {
      return res.status(400).json({
        success: false,
        message: 'Register Number is required.'
      });
    }

    const regNo = studentData.registerNumber.trim().toUpperCase();
    studentData.registerNumber = regNo;

    // Check duplicate
    const existing = await Student.findOne({ registerNumber: regNo });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Student with Register Number "${regNo}" already exists.`
      });
    }

    // Validate conditional Category fields
    if (studentData.category === 'Hosteller' && (!studentData.hostelName || studentData.hostelName.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Hostel Name is required for Hostellers.'
      });
    }
    if (studentData.category === 'Day Scholar' && (studentData.dayScholarDistance === undefined || studentData.dayScholarDistance === null || studentData.dayScholarDistance === '')) {
      return res.status(400).json({
        success: false,
        message: 'Distance from college is required for Day Scholars.'
      });
    }

    // Validate Career Goal
    if (!['Placement', 'Higher Studies', 'Entrepreneurship'].includes(studentData.primaryCareerGoal)) {
      return res.status(400).json({
        success: false,
        message: 'Primary Career Goal must be Placement, Higher Studies, or Entrepreneurship.'
      });
    }

    const newStudent = await Student.create(studentData);

    // Auto-create User account for Student login if it doesn't already exist
    const existingUser = await User.findOne({
      $or: [
        { username: regNo.toLowerCase() },
        { registerNumber: regNo }
      ]
    });

    if (!existingUser) {
      await User.create({
        username: regNo.toLowerCase(),
        password: 'Password@123', // Default student password
        role: 'student',
        name: newStudent.name,
        registerNumber: regNo,
        active: true
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Student profile created successfully.',
      data: newStudent
    });
  } catch (err) {
    console.error('Error in createStudent:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create student: ' + err.message
    });
  }
};

// PUT /api/students/:id - Update student profile (Faculty only)
exports.updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const updates = req.body;

    // Check registerNumber uniqueness if changed
    if (updates.registerNumber && updates.registerNumber.trim().toUpperCase() !== student.registerNumber) {
      const targetRegNo = updates.registerNumber.trim().toUpperCase();
      const duplicate = await Student.findOne({ registerNumber: targetRegNo });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Another student with Register Number "${targetRegNo}" already exists.`
        });
      }
      updates.registerNumber = targetRegNo;
    }

    // Apply updates
    Object.assign(student, updates);
    const updatedStudent = await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully.',
      data: updatedStudent
    });
  } catch (err) {
    console.error('Error in updateStudent:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to update student: ' + err.message
    });
  }
};

// DELETE /api/students/:id - Delete student profile (Faculty only)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const regNo = student.registerNumber;
    await Student.findByIdAndDelete(req.params.id);

    // Also remove or deactivate associated student user
    await User.findOneAndDelete({ registerNumber: regNo });

    return res.status(200).json({
      success: true,
      message: `Student profile for ${student.name} (${regNo}) deleted successfully.`
    });
  } catch (err) {
    console.error('Error in deleteStudent:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete student: ' + err.message
    });
  }
};

// POST /api/students/:id/semesters - Add a semester record
exports.addSemester = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const {
      semesterNumber,
      sgpa,
      cgpa,
      attendance,
      hasArrears,
      arrearCount,
      academicAchievements,
      goodSubjects
    } = req.body;

    if (!semesterNumber || sgpa === undefined || cgpa === undefined || attendance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Semester Number, SGPA, CGPA, and Attendance are required.'
      });
    }

    // Check if semester already exists
    const existingIndex = student.semesters.findIndex(s => s.semesterNumber === Number(semesterNumber));
    if (existingIndex !== -1) {
      // Update existing semester
      student.semesters[existingIndex] = {
        semesterNumber: Number(semesterNumber),
        sgpa: Number(sgpa),
        cgpa: Number(cgpa),
        attendance: Number(attendance),
        hasArrears: Boolean(hasArrears),
        arrearCount: Number(arrearCount) || 0,
        academicAchievements: academicAchievements || '',
        goodSubjects: goodSubjects || ''
      };
    } else {
      student.semesters.push({
        semesterNumber: Number(semesterNumber),
        sgpa: Number(sgpa),
        cgpa: Number(cgpa),
        attendance: Number(attendance),
        hasArrears: Boolean(hasArrears),
        arrearCount: Number(arrearCount) || 0,
        academicAchievements: academicAchievements || '',
        goodSubjects: goodSubjects || ''
      });
    }

    // Sort by semesterNumber
    student.semesters.sort((a, b) => a.semesterNumber - b.semesterNumber);

    await student.save();

    return res.status(201).json({
      success: true,
      message: `Semester ${semesterNumber} record saved successfully.`,
      data: student.semesters
    });
  } catch (err) {
    console.error('Error in addSemester:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add semester record: ' + err.message
    });
  }
};

// DELETE /api/students/:id/semesters/:semId - Delete a semester record
exports.deleteSemester = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    student.semesters = student.semesters.filter(s => s._id.toString() !== req.params.semId);
    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Semester record removed.',
      data: student.semesters
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error removing semester: ' + err.message
    });
  }
};

// POST /api/students/:id/arrears - Add an arrear record
exports.addArrear = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const {
      semester,
      subjectCode,
      subjectName,
      attempts,
      status,
      clearedSemester,
      clearedGrade,
      reasonForDifficulty,
      remedialRequired
    } = req.body;

    if (!semester || !subjectCode || !subjectName) {
      return res.status(400).json({
        success: false,
        message: 'Semester, Subject Code, and Subject Name are required.'
      });
    }

    const newArrear = {
      semester: Number(semester),
      subjectCode: subjectCode.trim().toUpperCase(),
      subjectName: subjectName.trim(),
      attempts: Number(attempts) || 1,
      status: status || 'Pending',
      clearedSemester: clearedSemester ? Number(clearedSemester) : undefined,
      clearedGrade: clearedGrade ? clearedGrade.trim() : undefined,
      reasonForDifficulty: reasonForDifficulty || '',
      remedialRequired: remedialRequired || 'No'
    };

    student.arrears.push(newArrear);
    await student.save();

    return res.status(201).json({
      success: true,
      message: 'Arrear record added successfully.',
      data: student.arrears
    });
  } catch (err) {
    console.error('Error in addArrear:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add arrear record: ' + err.message
    });
  }
};

// DELETE /api/students/:id/arrears/:arrId - Delete an arrear record
exports.deleteArrear = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    student.arrears = student.arrears.filter(a => a._id.toString() !== req.params.arrId);
    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Arrear record removed.',
      data: student.arrears
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error removing arrear: ' + err.message
    });
  }
};

// PUT /api/students/:id/arrears/:arrId - Update an arrear record (e.g. mark Cleared)
exports.updateArrear = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    const arrear = student.arrears.id(req.params.arrId);
    if (!arrear) {
      return res.status(404).json({
        success: false,
        message: 'Arrear record not found.'
      });
    }

    Object.assign(arrear, req.body);
    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Arrear record updated successfully.',
      data: student.arrears
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error updating arrear: ' + err.message
    });
  }
};
