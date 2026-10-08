const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Get all students (Faculty only)
router.get('/', authenticateToken, requireRole('faculty'), studentController.getAllStudents);

// Get single student profile (Faculty or the student themselves)
router.get('/:id', authenticateToken, studentController.getStudentById);

// Create student profile (Faculty only)
router.post('/', authenticateToken, requireRole('faculty'), studentController.createStudent);

// Update student profile (Faculty only)
router.put('/:id', authenticateToken, requireRole('faculty'), studentController.updateStudent);

// Delete student profile (Faculty only)
router.delete('/:id', authenticateToken, requireRole('faculty'), studentController.deleteStudent);

// Semester Management
router.post('/:id/semesters', authenticateToken, requireRole('faculty'), studentController.addSemester);
router.delete('/:id/semesters/:semId', authenticateToken, requireRole('faculty'), studentController.deleteSemester);

// Arrear Management
router.post('/:id/arrears', authenticateToken, requireRole('faculty'), studentController.addArrear);
router.put('/:id/arrears/:arrId', authenticateToken, requireRole('faculty'), studentController.updateArrear);
router.delete('/:id/arrears/:arrId', authenticateToken, requireRole('faculty'), studentController.deleteArrear);

module.exports = router;
