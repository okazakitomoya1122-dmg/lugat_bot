import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { SettingsDrawer } from './components/SettingsDrawer';
import { ScheduleView } from './components/ScheduleView';
import { Forma2View } from './components/Forma2View';
import { TeacherProfileView } from './components/TeacherProfileView';
import { TasksView } from './components/TasksView';
import './styles/theme.css';

export const MainContent = () => {
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'schedule' && <ScheduleView />}
        {activeTab === 'forma2' && <Forma2View />}
        {activeTab === 'teacher' && <TeacherProfileView />}
        {activeTab === 'tasks' && <TasksView />}
      </main>

      <SettingsDrawer />

      <footer style={{ 
        borderTop: '1px solid var(--border-color)', 
        padding: '16px 20px', 
        textAlign: 'center', 
        fontSize: '0.8rem', 
        color: 'var(--text-muted)',
        marginTop: 'auto'
      }}>
        O'qituvchi Yordamchisi Web Ilovasi &copy; {new Date().getFullYear()} — Barcha huquqlar himoyalangan
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
