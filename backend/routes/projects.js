const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, deleteProject, removeMember, addMember } = require('../controllers/projectController');
const { auth, adminAuth } = require('../middleware/authMiddleware');

router.post('/', adminAuth, createProject);
router.get('/', auth, getProjects);
router.get('/:id', auth, getProjectById);
router.delete('/:id', auth, deleteProject);
router.post('/remove-member', auth, removeMember);
router.post('/add-member', auth, addMember);

module.exports = router;
