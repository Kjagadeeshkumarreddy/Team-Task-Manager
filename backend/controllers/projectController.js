const Project = require('../models/Project');
const Task = require('../models/Task');

const createProject = async (req, res) => {
  const { name, description, members } = req.body;
  try {
    const project = new Project({
      name,
      description,
      owner: req.user.id,
      members: members || []
    });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find().populate('owner', 'name').populate('members', 'name');
    } else {
      projects = await Project.find({
        $or: [{ owner: req.user.id }, { members: req.user.id }]
      }).populate('owner', 'name').populate('members', 'name');
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProjectById = async (req, res) => {
  try {
    console.log('Fetching project by ID:', req.params.id);
    const project = await Project.findById(req.params.id).populate('owner', 'name').populate('members', 'name');
    if (!project) {
      console.log('Project not found in DB for ID:', req.params.id);
      return res.status(404).json({ message: 'Project not found' });
    }
    // Check access
    const isOwner = project.owner._id.toString() === req.user.id;
    const isMember = project.members.some(m => m._id.toString() === req.user.id);

    if (req.user.role !== 'Admin' && !isOwner && !isMember) {
      console.log('Unauthorized access attempt to project:', req.params.id, 'by user:', req.user.id);
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(project);
  } catch (err) {
    console.error('Error in getProjectById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only Admin or Owner can delete
    if (req.user.role !== 'Admin' && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Project.findByIdAndDelete(req.params.id);
    // Cascade delete tasks
    await Task.deleteMany({ project: req.params.id });

    res.json({ message: 'Project and associated tasks deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const removeMember = async (req, res) => {
  const { projectId, userId } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only Admin or Owner can remove members
    if (req.user.role !== 'Admin' && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Don't allow removing the owner
    if (project.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    project.members = project.members.filter(m => m.toString() !== userId);
    await project.save();

    // Also unassign tasks from this user in this project
    await Task.updateMany(
      { project: projectId, assignedTo: userId },
      { $unset: { assignedTo: "" } }
    );

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addMember = async (req, res) => {
  const { projectId, userId } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only Admin or Owner can add members
    if (req.user.role !== 'Admin' && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if already a member
    if (project.members.includes(userId) || project.owner.toString() === userId) {
      return res.status(400).json({ message: 'User is already a member or owner' });
    }

    project.members.push(userId);
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createProject, getProjects, getProjectById, deleteProject, removeMember, addMember };
