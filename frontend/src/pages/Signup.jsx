import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-400 mb-2">Create Account</h1>
            <p className="text-slate-400">Join TaskMaster and start organizing</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
                placeholder="John Doe"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
                placeholder="name@company.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Password</label>
              <input 
                type="password" 
                required 
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Role</label>
              <select 
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Member" className="bg-slate-900">Member</option>
                <option value="Admin" className="bg-slate-900">Admin</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              Get Started
            </button>
          </form>

          <p className="text-center text-slate-400 mt-8">
            Already have an account? <Link to="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
