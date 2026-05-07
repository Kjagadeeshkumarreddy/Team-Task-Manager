import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'Todo', dueDate: '', assignedTo: '' });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, tasksRes] = await Promise.all([
        axios.get(`/api/projects/${id}`),
        axios.get(`/api/tasks/project/${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load project details. It may have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get('/api/auth/users');
      setAllUsers(res.data);
      setShowAddMember(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', { ...taskForm, project: id });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', status: 'Todo', dueDate: '', assignedTo: '' });
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`/api/tasks/${taskId}`, { status: newStatus });
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) return;
    try {
      await axios.post('/api/projects/remove-member', { projectId: id, userId });
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error removing member');
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await axios.post('/api/projects/add-member', { projectId: id, userId });
      setShowAddMember(false);
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  const handleAssignToMember = (memberId) => {
    setTaskForm({ ...taskForm, assignedTo: memberId });
    setShowMemberModal(false);
    setShowTaskModal(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-xl text-purple-400 font-medium">Loading project details...</div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="glass-card max-w-lg mx-auto p-10 border-red-500/20">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Project Error</h2>
        <p className="text-slate-400 mb-8">{error}</p>
        <Link to="/projects" className="btn-primary px-8 py-3 rounded-xl no-underline inline-block font-bold">
          Back to Projects
        </Link>
      </div>
    </div>
  );

  const isAdmin = user.role === 'Admin';
  const isOwner = project.owner?._id === user.id;
  const isMemberOfProject = project.members?.some(m => (m._id || m).toString() === user.id);
  
  const canUpdateStatus = user.role === 'Member' && isMemberOfProject;
  const canDelete = isAdmin || isOwner;
  const canManageMembers = isAdmin || isOwner;

  const usersAvailableToAdd = allUsers.filter(u => 
    !project.members.some(m => m._id === u._id) && 
    project.owner?._id !== u._id
  );

  return (
    <div className="container mx-auto px-4 py-10 animate-fade-in">
      <Link to="/projects" className="inline-flex items-center text-slate-400 hover:text-white mb-6 no-underline transition-colors">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Projects
      </Link>

      <div className="glass-panel p-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
          <p className="text-slate-400 max-w-2xl">{project.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <button 
              onClick={() => setShowMemberModal(true)}
              className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-purple-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.732 4c-.76-1.01-1.93-1.417-3.232-1.417-1.3 0-2.47.408-3.232 1.417m11.132 10c1.3 0 2.47-.408 3.232-1.417m-11.132 1.417c.76 1.01 1.93 1.417 3.232 1.417 1.3 0 2.47-.408 3.232-1.417"></path></svg>
              {project.members?.length || 0} Team Members
            </button>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Project Lead: {project.owner?.name}</span>
          </div>
        </div>
        {(isAdmin || isOwner) && (
          <button 
            onClick={() => setShowTaskModal(true)} 
            className="btn-primary px-6 py-3 rounded-xl font-bold text-sm shadow-lg whitespace-nowrap"
          >
            + Add New Task
          </button>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
           <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
           Project Tasks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(t => (
            <div key={t._id} className="glass-card flex flex-col h-full border-white/5 hover:border-white/10 transition-colors">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-grow">
                    <h4 className="text-lg font-bold text-white line-clamp-1">{t.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {canDelete && (
                      <button 
                        onClick={() => handleDeleteTask(t._id)}
                        className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete Task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    )}
                    {t.assignedTo && (
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" title={`Assigned to ${t.assignedTo.name}`}>
                        {t.assignedTo.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-slate-400 text-sm line-clamp-2">{t.description}</p>
              </div>
              
              <div className="mt-auto pt-4 flex flex-col gap-4">
                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2 py-1 rounded-md font-bold tracking-wider uppercase ${
                    t.status === 'Todo' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                    t.status === 'InProgress' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {t.status === 'InProgress' ? 'In Progress' : t.status}
                  </span>
                  {t.dueDate && (
                    <span className="text-slate-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {canUpdateStatus && (
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block ml-1">Change Status</label>
                    <select 
                      className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-purple-500 transition-colors"
                      value={t.status}
                      onChange={(e) => handleUpdateStatus(t._id, e.target.value)}
                    >
                      <option value="Todo" className="bg-slate-900">To Do</option>
                      <option value="InProgress" className="bg-slate-900">In Progress</option>
                      <option value="Done" className="bg-slate-900">Done</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="col-span-full py-12 text-center glass-card border-dashed border-2">
              <p className="text-slate-500 italic">No tasks created for this project yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (isAdmin || isOwner) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in my-8">
            <h3 className="text-2xl font-bold text-white mb-6">New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Task Title</label>
                <input 
                  type="text" 
                  required 
                  className="form-control" 
                  placeholder="What needs to be done?"
                  value={taskForm.title} 
                  onChange={e => setTaskForm({...taskForm, title: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <textarea 
                  className="form-control min-h-[100px]" 
                  placeholder="Provide some details about the task..."
                  value={taskForm.description} 
                  onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Due Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={taskForm.dueDate} 
                  onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} 
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Assign To</label>
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-purple-500 transition-colors"
                  value={taskForm.assignedTo} 
                  onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})}
                >
                  <option value="" className="bg-slate-900">Unassigned</option>
                  {project.members?.map(m => (
                    <option key={m._id} value={m._id} className="bg-slate-900">{m.name}</option>
                  ))}
                  <option value={project.owner?._id} className="bg-slate-900">{project.owner?.name} (Owner)</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  className="flex-1 btn-secondary py-3 rounded-xl font-bold text-sm"
                  onClick={() => {
                    setShowTaskModal(false);
                    setTaskForm({ title: '', description: '', status: 'Todo', dueDate: '', assignedTo: '' });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Management Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-fade-in my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Project Team</h3>
              <button onClick={() => {setShowMemberModal(false); setShowAddMember(false);}} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {/* Owner Entry */}
              <div className="glass-card flex items-center justify-between p-4 border-purple-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white">
                    {project.owner?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{project.owner?.name}</h4>
                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Project Owner</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   {(isAdmin || isOwner) && (
                     <button 
                       onClick={() => handleAssignToMember(project.owner?._id)}
                       className="px-3 py-1.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded-lg hover:bg-purple-500 hover:text-white transition-all"
                     >
                       ASSIGN TASK
                     </button>
                   )}
                </div>
              </div>

              {/* Members Entries */}
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4">
                {project.members?.map(m => (
                  <div key={m._id} className="glass-card flex items-center justify-between p-4 border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{m.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Member</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       {(isAdmin || isOwner) && (
                         <>
                           <button 
                             onClick={() => handleAssignToMember(m._id)}
                             className="px-3 py-1.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded-lg hover:bg-purple-500 hover:text-white transition-all"
                           >
                             ASSIGN TASK
                           </button>
                           <button 
                             onClick={() => handleRemoveMember(m._id)}
                             className="px-3 py-1.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all"
                           >
                             REMOVE
                           </button>
                         </>
                       )}
                    </div>
                  </div>
                ))}
                {project.members?.length === 0 && (
                  <p className="text-center text-slate-600 italic py-4">No team members assigned yet.</p>
                )}
              </div>
            </div>

            {/* Add Member Section */}
            {(isAdmin || isOwner) && (
              <div className="pt-6 border-t border-white/5">
                {!showAddMember ? (
                  <button 
                    onClick={fetchAllUsers}
                    className="w-full py-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl font-bold text-sm hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Add New Team Member
                  </button>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Select User to Add</h4>
                      <button onClick={() => setShowAddMember(false)} className="text-xs text-slate-500 hover:text-white">Cancel</button>
                    </div>
                    <div className="max-h-40 overflow-y-auto bg-black/20 rounded-xl p-2 border border-white/5 space-y-1">
                      {usersAvailableToAdd.map(u => (
                        <div 
                          key={u._id} 
                          className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                          onClick={() => handleAddMember(u._id)}
                        >
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                               {u.name.charAt(0).toUpperCase()}
                             </div>
                             <div>
                               <p className="text-sm text-white font-medium">{u.name}</p>
                               <p className="text-[10px] text-slate-500 uppercase">{u.role}</p>
                             </div>
                          </div>
                          <div className="text-purple-400">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          </div>
                        </div>
                      ))}
                      {usersAvailableToAdd.length === 0 && (
                        <p className="text-xs text-slate-600 text-center py-4 italic">No more users available to add</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-8 pt-4">
               <button 
                 onClick={() => {setShowMemberModal(false); setShowAddMember(false);}}
                 className="w-full btn-secondary py-3 rounded-xl font-bold text-sm"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
