import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckSquare, Target, BookMarked, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export const TasksView = () => {
  const { 
    tasks, setTasks, 
    targets, setTargets, 
    quickTopics, setQuickTopics 
  } = useApp();

  const [activeTab, setActiveTab] = useState('tasks');
  const [modalOpen, setModalOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [extraInput, setExtraInput] = useState('');

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const openAddModal = () => {
    setInputText('');
    setExtraInput(activeTab === 'targets' ? 'Oktyabr' : '');
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (activeTab === 'tasks') {
      const newTask = { id: 't_' + Date.now(), title: inputText, completed: false };
      setTasks(prev => [newTask, ...prev]);
    } else if (activeTab === 'targets') {
      const newTarget = { id: 'tg_' + Date.now(), title: inputText, month: extraInput || 'Oktyabr' };
      setTargets(prev => [newTarget, ...prev]);
    } else if (activeTab === 'topics') {
      const newTopic = { id: 'qt_' + Date.now(), title: inputText };
      setQuickTopics(prev => [newTopic, ...prev]);
    }

    setModalOpen(false);
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const deleteTarget = (id) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  const deleteTopic = (id) => {
    setQuickTopics(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="tasks-page">
      {/* Banner Header */}
      <div className="card" style={{ marginBottom: '24px', background: 'var(--accent-gradient)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '4px' }}>Kunlik Vazifalar & Maqsadlar</h2>
            <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Dars tayyorgarligi, maqsadlar va muhim konspektlar paneli</p>
          </div>

          <button className="btn btn-header-light" onClick={openAddModal}>
            <Plus size={18} />
            <span>Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Progress Bar for Tasks */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            Kunlik Vazifalar Bajarilish Progressi
          </div>
          <div style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>
            {completedTasksCount} / {tasks.length} ({taskProgress}%)
          </div>
        </div>
        <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${taskProgress}%`, 
              height: '100%', 
              background: 'var(--accent-gradient)', 
              borderRadius: 'var(--radius-full)', 
              transition: 'width 0.4s ease' 
            }} 
          />
        </div>
      </div>

      {/* Internal Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button 
          className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={16} />
          <span>Kunlik Vazifalar ({tasks.length})</span>
        </button>

        <button 
          className={`btn ${activeTab === 'targets' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('targets')}
        >
          <Target size={16} />
          <span>Oylik Maqsadlar ({targets.length})</span>
        </button>

        <button 
          className={`btn ${activeTab === 'topics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('topics')}
        >
          <BookMarked size={16} />
          <span>Tezkor Mavzular ({quickTopics.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'tasks' && (
          <div>
            <div className="card-header">
              <h3>Bajariladigan Vazifalar Ro'yxati</h3>
              <button className="btn btn-primary" onClick={openAddModal}>
                <Plus size={16} />
                <span>Vazifa Qo'shish</span>
              </button>
            </div>

            {tasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Vazifalar mavjud emas</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '14px 18px', 
                      backgroundColor: 'var(--bg-hover)', 
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
                      onClick={() => toggleTask(task.id)}
                    >
                      {task.completed ? (
                        <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />
                      ) : (
                        <Circle size={22} style={{ color: 'var(--text-muted)' }} />
                      )}
                      <span style={{ 
                        fontSize: '0.95rem', 
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        fontWeight: task.completed ? 400 : 600
                      }}>
                        {task.title}
                      </span>
                    </div>

                    <button className="icon-btn" onClick={() => deleteTask(task.id)} title="O'chirish">
                      <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'targets' && (
          <div>
            <div className="card-header">
              <h3>Oylik va Semestrlik Maqsadlar</h3>
              <button className="btn btn-primary" onClick={openAddModal}>
                <Plus size={16} />
                <span>Maqsad Qo'shish</span>
              </button>
            </div>

            {targets.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Maqsadlar kiritilmagan</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {targets.map(target => (
                  <div key={target.id} style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
                    <span className="badge badge-warning" style={{ marginBottom: '8px' }}>
                      <Target size={12} /> {target.month} oyi uchun
                    </span>
                    <h4 style={{ fontSize: '1rem', marginTop: '4px', marginBottom: '12px' }}>{target.title}</h4>
                    <div style={{ textAlign: 'right' }}>
                      <button className="icon-btn" onClick={() => deleteTarget(target.id)} title="O'chirish">
                        <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'topics' && (
          <div>
            <div className="card-header">
              <h3>Tezkor Mavzular & Qaydlar</h3>
              <button className="btn btn-primary" onClick={openAddModal}>
                <Plus size={16} />
                <span>Mavzu Qo'shish</span>
              </button>
            </div>

            {quickTopics.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Mavzular kiritilmagan</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {quickTopics.map(topic => (
                  <div key={topic.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <BookMarked size={20} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{topic.title}</span>
                    </div>
                    <button className="icon-btn" onClick={() => deleteTopic(topic.id)} title="O'chirish">
                      <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSave}>
              <div className="modal-header">
                <h3>
                  {activeTab === 'tasks' ? "Yangi Vazifa Qo'shish" : activeTab === 'targets' ? "Yangi Maqsad Qo'shish" : "Yangi Mavzu Qo'shish"}
                </h3>
                <button type="button" className="icon-btn" onClick={() => setModalOpen(false)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Sarlavha / Matn</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="Matnni kiriting..." 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                  />
                </div>

                {activeTab === 'targets' && (
                  <div className="form-group">
                    <label className="form-label">Hisobati Oyi</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Masalan: Oktyabr" 
                      value={extraInput}
                      onChange={e => setExtraInput(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
