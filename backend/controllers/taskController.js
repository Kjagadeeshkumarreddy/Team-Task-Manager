const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (req, res) => {
  const { title, description, status, dueDate, project, assignedTo } = req.body;
  try {
    // Validate project access
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });
    
    if (req.user.role !== 'Admin' && proj.owner.toString() !== req.user.id && !proj.members.some(m => m.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to add tasks to this project' });
    }

    const task = new Task({ title, description, status, dueDate, project, assignedTo });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    console.log('Fetching tasks for project ID:', req.params.projectId);
    const proj = await Project.findById(req.params.projectId);
    if (!proj) {
      console.log('Project not found for tasks request:', req.params.projectId);
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const isOwner = proj.owner.toString() === req.user.id;
    const isMember = proj.members.some(m => m.toString() === req.user.id);

    if (req.user.role !== 'Admin' && !isOwner && !isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo', 'name');
    res.json(tasks);
  } catch (err) {
    console.error('Error in getTasksByProject:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const proj = await Project.findById(task.project);
    
    // Check if updating status
    if (req.body.status) {
      // STRICT: ONLY Member role can update status
      if (req.user.role !== 'Member') {
        return res.status(403).json({ message: 'Only Members can update task status' });
      }
      // Member must be in project
      if (!proj.members.some(m => m.toString() === req.user.id)) {
        return res.status(403).json({ message: 'Not authorized: You are not a member of this project' });
      }
      
      // If a member is trying to update OTHER fields besides status, block them
      if (Object.keys(req.body).length > 1) {
        return res.status(403).json({ message: 'Members can only update the status field' });
      }
    } else {
      // Updating other fields: must be Admin or Owner
      if (req.user.role !== 'Admin' && proj.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update task details' });
      }
    }

    task = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { returnDocument: 'after' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const proj = await Project.findById(task.project);
    if (req.user.role !== 'Admin' && proj.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createTask, getTasksByProject, updateTask, deleteTask };
