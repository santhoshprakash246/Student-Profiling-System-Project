const http = require('http');

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const reqOptions = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: { ...defaultHeaders, ...(options.headers || {}) }
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING SPS SYSTEM VERIFICATION SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/api/health');
    assert(health.status === 200 && health.body.status === 'online', 'Health check endpoint online');

    // 2. Unauthenticated access check
    const unauth = await request('/api/students');
    assert(unauth.status === 401, 'Unauthenticated request correctly returns 401');

    // 3. Faculty Login (Invalid)
    const badLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'faculty', password: 'WrongPassword' }
    });
    assert(badLogin.status === 401 && badLogin.body.success === false, 'Invalid password rejected');

    // 4. Faculty Login (Valid)
    const facLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'faculty', password: 'Faculty@123' }
    });
    assert(facLogin.status === 200 && facLogin.body.success === true && facLogin.body.token, 'Faculty login succeeds with JWT');
    const facultyToken = facLogin.body.token;

    // 5. Student Login (Valid)
    const stuLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { username: '24bcs246', password: 'Student@123' }
    });
    assert(stuLogin.status === 200 && stuLogin.body.success === true && stuLogin.body.user.role === 'student', 'Student login succeeds');
    const studentToken = stuLogin.body.token;
    const santhoshStudentId = stuLogin.body.user.studentId;

    // 6. Role Protection: Student accessing Faculty Insights
    const stuInsight = await request('/api/insights', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(stuInsight.status === 403, 'Student blocked from faculty dashboard insights (403)');

    // 7. Role Protection: Faculty accessing Insights
    const facInsight = await request('/api/insights', {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    assert(facInsight.status === 200 && facInsight.body.data.totalStudents >= 5, 'Faculty retrieves class insights');
    console.log(`       -> Total Students in DB: ${facInsight.body.data.totalStudents}`);
    console.log(`       -> Current Class Average CGPA: ${facInsight.body.data.currentAvgCgpa}`);
    console.log(`       -> Students with Active Arrears: ${facInsight.body.data.studentsWithActiveArrears}`);

    // 8. Retrieve Students with Filters
    const listAll = await request('/api/students', {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    assert(listAll.status === 200 && listAll.body.count >= 5, 'Faculty retrieves student directory');

    // Filter by department CSE
    const filterDept = await request('/api/students?department=CSE', {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    assert(filterDept.status === 200 && filterDept.body.data.every(s => s.department === 'CSE'), 'Department filter works');

    // Filter by search
    const searchRes = await request('/api/students?search=Santhosh', {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    assert(searchRes.status === 200 && searchRes.body.count === 1 && searchRes.body.data[0].registerNumber === '24BCS246', 'Search by Name works');

    // 9. Student Privacy: Student reading own profile vs reading another student
    const readSelf = await request(`/api/students/${santhoshStudentId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(readSelf.status === 200 && readSelf.body.data.registerNumber === '24BCS246', 'Student can read own profile');

    // Find another student ID (e.g. Ananya Sharma 24BCS108)
    const ananya = listAll.body.data.find(s => s.registerNumber === '24BCS108');
    if (ananya) {
      const readOther = await request(`/api/students/${ananya._id}`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      assert(readOther.status === 403, "Student BLOCKED from reading another student's profile (403 Forbidden)");
    }

    // 10. Student CRUD: Create new student
    const testRegNo = '24BCS888';
    const newStudentData = {
      registerNumber: testRegNo,
      name: 'Manoj Kumar',
      dob: '2004-05-10',
      gender: 'Male',
      department: 'CSE',
      section: 'C',
      institutionalEmail: 'manoj.24bcs888@bytexl.edu.in',
      personalEmail: 'manoj.kumar@gmail.com',
      mobile: '9894123456',
      address: '12 Gandhi Road, Salem',
      category: 'Hosteller',
      hostelName: 'Amaravathi Hostel, Room 202',
      primaryCareerGoal: 'Placement',
      placement: {
        preferredRole: 'DevOps Engineer',
        preferredDomain: 'Cloud',
        companyType: 'Product',
        expectedSalaryRange: '₹10,00,000 - ₹15,00,000'
      }
    };

    const createRes = await request('/api/students', {
      method: 'POST',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: newStudentData
    });
    assert(createRes.status === 201 && createRes.body.data.registerNumber === testRegNo, 'Faculty successfully creates new student');
    const createdId = createRes.body.data ? createRes.body.data._id : null;

    // Check duplicate register number rejection
    const dupRes = await request('/api/students', {
      method: 'POST',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: newStudentData
    });
    assert(dupRes.status === 400, 'Duplicate register number correctly rejected with 400');

    // 11. Add Semester Record
    if (createdId) {
      const semRes = await request(`/api/students/${createdId}/semesters`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${facultyToken}` },
        body: {
          semesterNumber: 1,
          sgpa: 8.4,
          cgpa: 8.4,
          attendance: 91,
          academicAchievements: 'Class distinction in Python',
          goodSubjects: 'Problem Solving in Python'
        }
      });
      assert(semRes.status === 201 && semRes.body.data.length === 1, 'Faculty adds Semester 1 record');

      // 12. Add Arrear Record
      const arrRes = await request(`/api/students/${createdId}/arrears`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${facultyToken}` },
        body: {
          semester: 1,
          subjectCode: 'MA3151',
          subjectName: 'Matrices and Calculus',
          attempts: 1,
          status: 'Pending',
          reasonForDifficulty: 'Calculus concepts difficult',
          remedialRequired: 'Yes'
        }
      });
      assert(arrRes.status === 201 && arrRes.body.data.length === 1, 'Faculty adds Arrear record');

      // 13. Update Student Profile
      const updateRes = await request(`/api/students/${createdId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${facultyToken}` },
        body: {
          areaOfInterest: 'Cloud Architecture and Kubernetes'
        }
      });
      assert(updateRes.status === 200 && updateRes.body.data.areaOfInterest === 'Cloud Architecture and Kubernetes', 'Faculty updates student profile');

      // 14. Delete Student Profile
      const delRes = await request(`/api/students/${createdId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${facultyToken}` }
      });
      assert(delRes.status === 200 && delRes.body.success === true, 'Faculty deletes student profile');

      // Verify student is gone
      const verifyDel = await request(`/api/students/${createdId}`, {
        headers: { Authorization: `Bearer ${facultyToken}` }
      });
      assert(verifyDel.status === 404, 'Deleted student returns 404');
    }

    console.log('\n=======================================');
    console.log(`TOTAL TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('=======================================');

    if (failed === 0) {
      console.log('ALL API TESTS PASSED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
