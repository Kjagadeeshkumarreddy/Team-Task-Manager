const Task = require('../models/Task');
const Project = require('../models/Project');

const getDashboardStats = async (req, res) => {
  try {
    let projectIds = [];
    if (req.user.role === 'Admin') {
      const projects = await Project.find();
      projectIds = projects.map(p => p._id);
    } else {
      const projects = await Project.find({
        $or: [{ owner: req.user.id }, { members: req.user.id }]
      });
      projectIds = projects.map(p => p._id);
    }

    // If no projects found, return zeroed stats immediately
    if (projectIds.length === 0) {
      return res.json({
        totalTasks: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
        overdue: 0
      });
    }

    const tasks = await Task.find({ project: { $in: projectIds } });

    const stats = {
      totalTasks: tasks.length,
      todo: tasks.filter(t => t.status === 'Todo').length,
      inProgress: tasks.filter(t => t.status === 'InProgress').length,
      done: tasks.filter(t => t.status === 'Done').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length
    };

    res.json(stats);
  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getDashboardStats };
