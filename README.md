# Student Academic Personal and Career Profiling System

An enterprise-grade, full-stack academic and mentoring web application designed for institutions and runnable in the **byteXL NIMBUS** environment. The system maintains comprehensive student personal, family, semester-wise academic, technical, self-evaluation, and career-goal profiles to empower authorized mentors and faculty in guiding student progression.

---

## 1. Project Overview & Problem Statement

Academic institutions often struggle with fragmented student records where academic grades, backlog/arrear history, programming and technical skills, personal backgrounds, and career goals reside in isolated silos. 

The **Student Academic Personal and Career Profiling System (SPS)** provides a centralized, privacy-preserving mentoring platform that allows authorized faculty to:
- Monitor semester-wise academic progression and cumulative CGPA.
- Track arrear occurrences, clearance history, and remedial support requirements.
- Identify students demonstrating continuous improvement or facing academic decline.
- Assess technical competencies, coding platforms, projects, and certifications.
- Review student self-evaluations (strengths, areas needing development, mentor expectations).
- Guide students toward structured career paths (**Placement**, **Higher Studies**, or **Entrepreneurship**).
- Enable students to securely view their own verified academic profile and career roadmap.

---

## 2. Technology Stack

- **Frontend:**
  - HTML5 (Semantic Structure)
  - CSS3 & Modern Responsive Design System
  - JavaScript (ES6+ Asynchronous Fetch, DOM manipulation)
  - Bootstrap 5.3 & Bootstrap Icons
  - Chart.js 4.4 (Interactive Visual Analytics)
- **Backend:**
  - Node.js (Runtime)
  - Express.js (RESTful API Server, Router, Static Serving)
- **Database & ODM:**
  - MongoDB
  - Mongoose 8.x (Schema validation, embedded subdocuments, virtuals, timestamps)
- **Authentication & Security:**
  - JSON Web Tokens (`jsonwebtoken`)
  - Password Hashing with Salt (`bcryptjs`)
  - Cookie Parser (`cookie-parser`) & HTTP Authorization headers
  - Role-Based Access Control (RBAC) middleware
- **Deployment Platform:**
  - byteXL NIMBUS / Node.js standard environment

---

## 3. Project Structure

```text
student-profiling-system/
├── server.js                  # Express server initialization, DB hook & route mounting
├── seed.js                    # Database seeder with realistic test data & accounts
├── package.json               # Dependencies, scripts and project metadata
├── package-lock.json
├── .env.example               # Environment template
├── .env                       # Local environment configuration
├── .gitignore                 # Git ignore rules for node_modules and secrets
├── README.md                  # Comprehensive technical documentation
│
├── config/
│   └── db.js                  # Robust MongoDB connection with memory-server fallback
│
├── models/
│   ├── User.js                # Auth credentials schema with bcrypt hashing & roles
│   └── Student.js             # Comprehensive student schema with subdocuments
│
├── middleware/
│   ├── auth.js                # JWT verification & request user injection
│   └── role.js                # Role-based authorization guard
│
├── controllers/
│   ├── authController.js      # Login, logout, and user session verification
│   ├── studentController.js   # Complete CRUD, filtering, semesters & arrears
│   └── insightController.js   # Live MongoDB aggregation & analytics calculations
│
├── routes/
│   ├── authRoutes.js          # /api/auth endpoints
│   ├── studentRoutes.js       # /api/students endpoints
│   └── insightRoutes.js       # /api/insights endpoints
│
└── public/
    ├── index.html             # Role-based login page with quick demo selectors
    ├── faculty.html           # Faculty dashboard with live stats and Chart.js
    ├── students.html          # Student directory, instant search & multi-filter
    ├── add-student.html       # Dynamic creation/update form with conditional fields
    ├── student-profile.html   # Detailed 11-section profile view & print layout
    ├── student.html           # Isolated student portal for logged-in students
    │
    ├── css/
    │   └── style.css          # Custom responsive CSS design system
    │
    └── js/
        ├── app.js             # Shared auth storage, toast alerts & utilities
        ├── auth.js            # Login client controller
        ├── faculty.js         # Faculty analytics & charts controller
        ├── students.js        # Student directory & delete confirmation controller
        ├── add-student.js     # Dynamic form manipulation & validation controller
        ├── student-profile.js # Profile view & quick semester/arrear modals
        └── student.js         # Student portal controller
```

---

## 4. Environment Variables

Create a `.env` file in the root folder with the following variables:

```env
# Server Port
PORT=3000

# MongoDB Connection String (e.g., local MongoDB or byteXL NIMBUS MongoDB)
MONGODB_URI=mongodb://localhost:27017/student_profiling_system

# JWT Secret for Signing Authentication Tokens
JWT_SECRET=super_secret_jwt_key_sps_bytexl_nimbus_2026

# Set to true if running in environment without standalone mongod daemon
USE_IN_MEMORY_DB=false
```

---

## 5. Installation & How to Run

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Seed Sample Data (Optional)
The server auto-seeds sample data on first launch if the database is empty. You can also manually run:
```bash
npm run seed
```

### Step 3: Start the Application
```bash
npm start
```
The server will start at: `http://localhost:3000`

---

## 6. Demo Accounts & Credentials

| Role | Username / Identifier | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Faculty / Mentor** | `faculty` *(or `faculty@bytexl.com`)* | `Faculty@123` | Full access to Dashboard, Student Directory, Create/Update/Delete students, Semesters, Arrears, and Analytics |
| **Student (CSE)** | `24bcs246` | `Student@123` | Access only to Santhosh Prakash's verified profile and career roadmap |
| **Student (CSE)** | `24bcs108` | `Student@123` | Access only to Ananya Sharma's profile (Higher Studies aspirant) |
| **Student (IT)** | `24bit042` | `Student@123` | Access only to Rohan Varma's profile (Entrepreneurship aspirant) |
| **Student (CSE)** | `24bcs199` | `Student@123` | Access only to Karthik Rajan's profile (Has active arrear & remedial clinic) |
| **Student (ECE)** | `24bec015` | `Student@123` | Access only to Priya Sundaram's profile (Core Automotive Placement) |

*Note: In `index.html`, one-click demo login buttons are provided for instant testing.*

---

## 7. API Endpoints Documentation

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/login`
  - Body: `{ "username": "faculty", "password": "Faculty@123" }`
  - Description: Authenticates user, signs JWT token, sets cookie and returns user role.
- `POST /api/auth/logout`
  - Description: Clears auth cookie and session.
- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Description: Returns details of currently authenticated user.

### Student Management Endpoints (`/api/students`)
- `GET /api/students`
  - Access: Faculty only
  - Query Parameters:
    - `search`: Case-insensitive regex match against student name or register number.
    - `department`: Filter by department (e.g. `CSE`, `IT`, `ECE`).
    - `section`: Filter by section (e.g. `A`, `B`).
    - `category`: Filter by `Hosteller` or `Day Scholar`.
    - `careerGoal`: Filter by `Placement`, `Higher Studies`, or `Entrepreneurship`.
    - `minCgpa`, `maxCgpa`: Filter by cumulative CGPA range.
    - `arrearStatus`: Filter by `Pending` (active arrears), `Cleared`, or `None`.
- `GET /api/students/:id`
  - Access: Faculty or the specific Student themselves.
  - Description: Returns full profile of student. If a student attempts to view another student's ID, returns `403 Forbidden`.
- `POST /api/students`
  - Access: Faculty only
  - Description: Creates a student record in MongoDB and automatically creates an associated student login account with default password `Password@123`.
- `PUT /api/students/:id`
  - Access: Faculty only
  - Description: Updates an existing student record with validation.
- `DELETE /api/students/:id`
  - Access: Faculty only
  - Description: Permanently removes student profile and associated student login account after confirmation.

### Semester & Arrear Sub-records
- `POST /api/students/:id/semesters`
  - Access: Faculty only
  - Description: Adds or updates a semester record (SGPA, CGPA, attendance, good subjects).
- `DELETE /api/students/:id/semesters/:semId`
  - Access: Faculty only
  - Description: Removes a semester record.
- `POST /api/students/:id/arrears`
  - Access: Faculty only
  - Description: Adds an arrear record (subject code, name, semester, attempts, status, remedial requirement).
- `PUT /api/students/:id/arrears/:arrId`
  - Access: Faculty only
  - Description: Updates arrear status (e.g., mark Cleared with cleared semester & grade).
- `DELETE /api/students/:id/arrears/:arrId`
  - Access: Faculty only
  - Description: Removes an arrear record.

### Class Dashboard Insights (`/api/insights`)
- `GET /api/insights`
  - Access: Faculty only
  - Description: Executes live statistical computations across all MongoDB student records:
    - Total students, Hosteller vs Day Scholar counts.
    - Class Average CGPA, Highest CGPA, Lowest CGPA.
    - Semester-wise average SGPA progression.
    - Counts of students with continuous improvement vs declining SGPA.
    - Active pending arrears count and cleared arrears count.
    - Top 5 subjects with highest arrears.
    - Students requiring remedial mentor intervention.
    - Professional gaps (students lacking certifications, projects, GitHub, LinkedIn).
    - Career goal distribution (Placement, Higher Studies, Entrepreneurship) and skill gap summaries.

---

## 8. Role-Based Authorization & Privacy Rules

1. **Role Separation:**
   - Faculty members can access the faculty dashboard, view analytics, create/edit/delete student profiles, and update semester records.
   - Students can log in using their Register Number to view **only their own** profile, semester history, and career direction.
2. **Server-Side Authorization:**
   - Both routes and controllers inspect the JWT payload.
   - Even if a student manually modifies a URL parameter (e.g., `/api/students/<other-student-id>`), the backend immediately rejects the request with HTTP `403 Forbidden`.
3. **Privacy-Preserving Dashboard:**
   - Faculty dashboard displays aggregate cohort analytics and indicators. Individual weaknesses, parental income ranges, and private student evaluations are strictly kept inside individual student records and never exposed publicly on cohort summaries.
   - Parental income is collected and stored as ranges rather than exact salary figures.

---

## 9. Dynamic Form Features

- **Hosteller vs Day Scholar:** Selecting `Hosteller` dynamically presents hostel and room fields, while selecting `Day Scholar` prompts for commute distance in kilometers.
- **Arrear History:** Selecting `Yes` renders dynamic arrear blocks with subject code, attempts, reason for difficulty, remedial support flags, and conditional clearance fields (cleared semester and grade).
- **Career Goal Paths:**
  - `Placement` dynamically reveals fields for preferred role, domain, company type (Product/Service/Core/Start-up), expected CTC, target companies, and training support.
  - `Higher Studies` reveals fields for preferred programme, specialization, country, target institutions, planned exams (GATE, GRE, IELTS, etc.), and admission year.
  - `Entrepreneurship` reveals fields for startup idea, problem addressed, solution, stage (Idea/Prototype/MVP/Revenue), team, funding, and incubation support.
- **Dynamic Semesters:** Faculty can dynamically add, edit, or remove records for Semesters 1 through 8.

---

## 10. Verification & Testing Checklist

- [x] **Authentication:** Faculty login, Student login, invalid password rejection, and session logout.
- [x] **Authorization:** Student accounts blocked from `/faculty.html`, `/students.html`, and `/api/insights`.
- [x] **Student Privacy:** Student cannot view another student's profile via direct ID lookup.
- [x] **CRUD Operations:** Create new student, retrieve profile, update profile, and delete profile with confirmation modal.
- [x] **Dynamic Subdocuments:** Dynamic semester addition, dynamic arrear recording, and marking arrears cleared.
- [x] **Search & Multi-Filter:** Searching by name and register number, filtering by department, category, career goal, and arrear status.
- [x] **Live Dashboard Analytics:** Real calculation of average CGPA, SGPA trend line, career doughnut chart, and arrear statistics.
- [x] **Validation:** Valid Indian mobile number (10 digits), valid institutional email, CGPA/SGPA limits (0 to 10), and attendance limits (0 to 100%).
