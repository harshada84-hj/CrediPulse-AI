import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Activity, LogOut, History, LayoutDashboard, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC<{ darkMode: boolean, toggleDarkMode: () => void }> = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const token = api.getToken();

  const handleLogout = () => {
    api.clearToken();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-md border-bottom border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-primary">CrediPulse AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {token ? (
              <>
                <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary flex items-center gap-1.5 text-sm font-medium">
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <Link to="/history" className="text-gray-600 dark:text-gray-300 hover:text-primary flex items-center gap-1.5 text-sm font-medium">
                  <History size={18} />
                  History
                </Link>
                <button onClick={handleLogout} className="text-gray-600 dark:text-gray-300 hover:text-red-500 flex items-center gap-1.5 text-sm font-medium transition-colors">
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/auth?mode=login" className="text-gray-600 dark:text-gray-300 hover:text-primary text-sm font-medium">Login</Link>
                <Link to="/auth?mode=register" className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary/20">
                  Get Started
                </Link>
              </>
            )}
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
