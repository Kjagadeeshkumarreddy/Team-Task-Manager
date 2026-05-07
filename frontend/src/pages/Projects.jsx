import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/auth/users');
      setUsersList(res.data.filter(u => u._id !== user.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', { 
        name, 
        description, 
        members: selectedMembers 
      });
      setShowModal(false);
      setName('');
      setDescription('');
      setSelectedMembers([]);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) return;
    try {
      await axios.delete(`/api/projects/${projectId}`);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 animate-fade-in">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-slate-400">View and manage your team initiatives</p>
        </div>
        {user.role === 'Admin' && (
          <button 
            onClick={() => setShowModal(true)} 
            className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg"
          >
            + Create Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(p => (
          <Link to={`/projects/${p._id}`} key={p._id} className="no-underline group relative block">
            <div className="glass-card h-full flex flex-col border-white/5 group-hover:border-purple-500/30">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors pr-8">{p.name}</h3>
                <div className="flex items-center gap-2">
                   {user.role === 'Admin' && (
                     <button 
                       onClick={(e) => handleDeleteProject(e, p._id)}
                       className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300"
                       title="Delete Project"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                     </button>
                   )}
                   <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                   </div>
                </div>
              </div>
              <p className="text-slate-400 text-sm line-clamp-3 flex-grow mb-6">{p.description || 'No description provided.'}</p>
              
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                     {p.owner?.name?.charAt(0).toUpperCase()}
                   </div>
                   <span className="text-xs text-slate-500 font-medium">{p.owner?.name}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.732 4c-.76-1.01-1.93-1.417-3.232-1.417-1.3 0-2.47.408-3.232 1.417m11.132 10c1.3 0 2.47-.408 3.232-1.417m-11.132 1.417c.76 1.01 1.93 1.417 3.232 1.417 1.3 0 2.47-.408 3.232-1.417"></path></svg>
                  <span className="text-xs">{p.members?.length || 0}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card">
            <p className="text-slate-500">No projects found. Create one to get started!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-fade-in my-8">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Project</h3>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Project Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-control" 
                  placeholder="E.g. Website Redesign"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <textarea 
                  className="form-control min-h-[100px]" 
                  placeholder="Briefly describe the project goals..."
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">Assign Team Members</label>
                <div className="max-h-48 overflow-y-auto bg-black/20 rounded-xl p-4 border border-white/5 space-y-2">
                  {usersList.map(u => (
                    <div 
                      key={u._id} 
                      onClick={() => toggleMember(u._id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedMembers.includes(u._id) ? 'bg-purple-500/20 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{u.role}</p>
                        </div>
                      </div>
                      {selectedMembers.includes(u._id) && (
                        <div className="text-purple-400">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        </div>
                      )}
                    </div>
                  ))}
                  {usersList.length === 0 && <p className="text-slate-600 text-xs text-center py-4 italic">No other users found</p>}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  className="flex-1 btn-secondary py-3 rounded-xl font-bold text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
