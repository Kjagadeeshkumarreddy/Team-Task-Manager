import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-xl text-purple-400 font-medium">Loading statistics...</div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Your team's performance at a glance</p>
        </div>
        <Link to="/projects" className="btn-primary px-6 py-3 rounded-xl no-underline font-bold text-sm tracking-wide">
          Manage Projects
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          </div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Total Tasks</h3>
          <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">{stats.totalTasks}</p>
        </div>

        <div className="glass-card relative overflow-hidden group border-amber-500/10">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Pending</h3>
          <p className="text-5xl font-bold text-amber-500">{stats.todo}</p>
        </div>

        <div className="glass-card relative overflow-hidden group border-indigo-500/10">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Active</h3>
          <p className="text-5xl font-bold text-indigo-400">{stats.inProgress}</p>
        </div>

        <div className="glass-card relative overflow-hidden group border-emerald-500/10">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Completed</h3>
          <p className="text-5xl font-bold text-emerald-500">{stats.done}</p>
        </div>
      </div>

      <div className="w-full">
        <div className={`glass-card border-l-4 ${stats.overdue > 0 ? 'border-l-red-500' : 'border-l-slate-700'}`}>
           <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stats.overdue > 0 ? 'bg-red-500/20 text-red-500' : 'bg-slate-500/20 text-slate-500'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Overdue Alerts</h3>
                <p className="text-slate-400 text-sm">
                  {stats.overdue === 0 
                    ? "Great job! No tasks are currently overdue." 
                    : `Attention: There are ${stats.overdue} tasks that have passed their deadline.`}
                </p>
              </div>
              <div className="ml-auto">
                <span className={`text-3xl font-bold ${stats.overdue > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                  {stats.overdue}
                </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
