import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  BarChart3, 
  UserCheck, 
  CheckSquare, 
  Sun, 
  Moon, 
  Menu,
  BookOpen
} from 'lucide-react';

export const Header = ({ activeTab, setActiveTab }) => {
  const { theme, toggleTheme, setDrawerOpen } = useApp();

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-group" onClick={() => setActiveTab('schedule')}>
          <div className="logo-icon-bg">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="logo-title">O'qituvchi Yordamchisi</h1>
            <p className="logo-subtitle">O'quv Rejasi & Forma-2 Tizimi</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar size={18} />
            <span>Darslar Jadvali</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'forma2' ? 'active' : ''}`}
            onClick={() => setActiveTab('forma2')}
          >
            <BarChart3 size={18} />
            <span>Forma-2 Yuklama</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'teacher' ? 'active' : ''}`}
            onClick={() => setActiveTab('teacher')}
          >
            <UserCheck size={18} />
            <span>Ustoz Bo'limi</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <CheckSquare size={18} />
            <span>Vazifalar</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="header-actions">
          <button 
            className="icon-btn" 
            onClick={toggleTheme}
            title={theme === 'dark' ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish"}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            className="icon-btn" 
            onClick={() => setDrawerOpen(true)}
            title="Sozlamalar va Menyuni ochish"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
};
