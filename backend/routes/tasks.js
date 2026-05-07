const express = require('express');
const router = express.Router();
const { createTask, getTasksByProject, updateTask, deleteTask } = require('../controllers/taskController');
const { auth } = require('../middleware/authMiddleware');

router.post('/', auth, createTask);
router.get('/project/:projectId', auth, getTasksByProject);
router.patch('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
