import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, School, BookOpen, Plus, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

export const TeacherProfileView = () => {
  const { teacher, setTeacher } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Profile Form
  const [teacherName, setTeacherName] = useState(teacher.name);
  const [schoolName, setSchoolName] = useState(teacher.school);
  const [deputyHead, setDeputyHead] = useState(teacher.deputyHead || "S.Abduraxmonova");

  // Subject Form
  const [subjectName, setSubjectName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [annualHours, setAnnualHours] = useState(100);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setTeacher(prev => ({
      ...prev,
      name: teacherName,
      school: schoolName,
      deputyHead: deputyHead
    }));
    alert("Ustoz profili saqlandi!");
  };

  const openAddSubject = () => {
    setEditingSubject(null);
    setSubjectName('');
    setGroupName('101-Guruh');
    setAnnualHours(100);
    setModalOpen(true);
  };

  const openEditSubject = (subj) => {
    setEditingSubject(subj);
    setSubjectName(subj.name);
    setGroupName(subj.groupName || '101-Guruh');
    setAnnualHours(subj.annualHours);
    setModalOpen(true);
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    if (editingSubject) {
      setTeacher(prev => ({
        ...prev,
        subjects: prev.subjects.map(s => s.id === editingSubject.id ? { ...s, name: subjectName, groupName: groupName, annualHours: Number(annualHours) } : s)
      }));
    } else {
      const newSubj = {
        id: 's_' + Date.now(),
        name: subjectName,
        groupName: groupName || '101-Guruh',
        annualHours: Number(annualHours)
      };
      setTeacher(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubj]
      }));
    }
    setModalOpen(false);
  };

  const handleDeleteSubject = (id) => {
    if (window.confirm("Ushbu fanni o'chirishni tasdiqlaysizmi?")) {
      setTeacher(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => s.id !== id)
      }));
    }
  };

  const totalAnnualHours = teacher.subjects.reduce((sum, s) => sum + Number(s.annualHours || 0), 0);

  return (
    <div className="teacher-page">
      {/* Banner Header */}
      <div className="card" style={{ marginBottom: '24px', background: 'var(--accent-gradient)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '4px' }}>Ustoz Profili va O'tadigan Fanlar</h2>
            <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Fanlar va ularning yillik rejasi avtomatik Forma-2 hisoboti bilan integratsiya qilingan</p>
          </div>
          <button className="btn btn-header-light" onClick={openAddSubject}>
            <Plus size={18} />
            <span>Yangi Fan Qo'shish</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Profile Card */}
        <div className="card">
          <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <div className="logo-icon-bg" style={{ width: '64px', height: '64px', margin: '0 auto 12px auto', fontSize: '1.5rem' }}>
              <User size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>{teacher.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{teacher.school}</p>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">
                <User size={16} style={{ display: 'inline', marginRight: '6px' }} />
                O'qituvchi F.I.Sh.
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={teacherName} 
                onChange={e => setTeacherName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <School size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Texnikum / Ta'lim Muassasasi
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={schoolName} 
                onChange={e => setSchoolName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={16} style={{ display: 'inline', marginRight: '6px' }} />
                O'IBDO' o'rinbosari (Forma-2 tasdiqlovchisi)
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="S.Abduraxmonova"
                value={deputyHead} 
                onChange={e => setDeputyHead(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <CheckCircle2 size={16} />
              <span>Profilni Saqlash</span>
            </button>
          </form>
        </div>

        {/* Subjects Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>O'tadigan Fanlar va Yillik Soatlar</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Jami yillik soat: <strong style={{ color: 'var(--accent-primary)' }}>{totalAnnualHours} soat</strong>
              </p>
            </div>
            <button className="btn btn-primary" onClick={openAddSubject}>
              <Plus size={16} />
              <span>Fan Qo'shish</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {teacher.subjects.map((subj, idx) => (
              <div 
                key={subj.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '14px 18px', 
                  backgroundColor: 'var(--bg-hover)', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="badge badge-info" style={{ width: '30px', height: '30px', borderRadius: '50%', justifyContent: 'center' }}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem' }}>{subj.name}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Guruh: <strong style={{ color: 'var(--text-primary)' }}>{subj.groupName || '101-Guruh'}</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                    {subj.annualHours} soat
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="icon-btn" onClick={() => openEditSubject(subj)} title="Tahrirlash">
                      <Edit3 size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => handleDeleteSubject(subj.id)} title="O'chirish">
                      <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Subject Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSaveSubject}>
              <div className="modal-header">
                <h3>{editingSubject ? "Fanni Tahrirlash" : "Yangi Fan Qo'shish"}</h3>
                <button type="button" className="icon-btn" onClick={() => setModalOpen(false)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Fan Nomi</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="Masalan: Fizika" 
                    value={subjectName}
                    onChange={e => setSubjectName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Guruh / Bosqich Nomi</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="Masalan: 101-Guruh" 
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Yillik Reja Soati (Reja dars soati)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    min="1"
                    max="500"
                    placeholder="Masalan: 120" 
                    value={annualHours}
                    onChange={e => setAnnualHours(e.target.value)}
                  />
                </div>
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
