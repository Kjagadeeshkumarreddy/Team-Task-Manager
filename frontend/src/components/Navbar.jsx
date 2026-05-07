import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="flex justify-between items-center p-6 mb-10 mt-5 glass-panel container mx-auto">
      <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-accent no-underline">TaskMaster</Link>
      <div className="flex gap-5 items-center">
        <Link to="/dashboard" className="px-4 py-2 rounded-lg border border-white border-opacity-10 text-slate-300 font-semibold hover:text-white hover:border-opacity-30 hover:bg-white/5 transition-all no-underline text-sm tracking-wide">Dashboard</Link>
        <Link to="/projects" className="px-4 py-2 rounded-lg border border-white border-opacity-10 text-slate-300 font-semibold hover:text-white hover:border-opacity-30 hover:bg-white/5 transition-all no-underline text-sm tracking-wide">Projects</Link>
        <span className="text-gray-400 ml-5">
          Hi, <span className="text-white font-semibold">{user.name}</span> <span className="text-xs uppercase tracking-wider bg-white bg-opacity-10 px-2 py-1 rounded ml-1">({user.role})</span>
        </span>
        <button onClick={handleLogout} className="btn btn-secondary ml-2">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
