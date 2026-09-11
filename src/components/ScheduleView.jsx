import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Users, 
  Edit3, 
  Trash2, 
  Calendar, 
  CalendarDays,
  CheckCircle2,
  XCircle,
  Filter,
  BookOpen,
  Repeat,
  Zap
} from 'lucide-react';
import { YearlyCalendar } from './YearlyCalendar';

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const DAY_NAMES_MAP = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

const MONTHS_FILTER = [
  { key: 'all', name: 'Barcha Oylar' },
  { key: '2026-09', name: 'Sentabr 2026' },
  { key: '2026-10', name: 'Oktyabr 2026' },
  { key: '2026-11', name: 'Noyabr 2026' },
  { key: '2026-12', name: 'Dekabr 2026' },
  { key: '2027-01', name: 'Yanvar 2027' },
  { key: '2027-02', name: 'Fevral 2027' },
  { key: '2027-03', name: 'Mart 2027' },
  { key: '2027-04', name: 'Aprel 2027' },
  { key: '2027-05', name: 'May 2027' }
];

export const ScheduleView = () => {
  const { lessons, setLessons, teacher, setMonthlyHours } = useApp();
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' | 'yearly'
  
  // Status filter: 'all' | 'pending' | 'completed' | 'zamena'
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Month filter: default 'all' so no lessons are hidden!
  const [selectedMonthKey, setSelectedMonthKey] = useState('all');
  
  // Day filter
  const [selectedDay, setSelectedDay] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: teacher.subjects[0]?.name || 'Dasturlash (Python)',
    date: '2026-09-07',
    day: 'Dushanba',
    time: '1-juftlik (08:30 - 09:50)',
    room: '204-xona',
    classGroup: teacher.subjects[0]?.groupName || '101-Guruh',
    hours: 2,
    isRecurring: true,
    isZamena: false
  });

  // Calculate filtered lessons list
  const getFilteredLessons = () => {
    return lessons.filter(l => {
      // Day filter
      if (selectedDay !== 'all' && l.day !== selectedDay) return false;

      // Month filter
      if (selectedMonthKey !== 'all') {
        if (l.date && !l.date.startsWith(selectedMonthKey)) return false;
      }

      // Status filter
      if (statusFilter === 'pending' && l.completed) return false;
      if (statusFilter === 'completed' && !l.completed) return false;
      if (statusFilter === 'zamena' && !l.isZamena) return false;

      return true;
    });
  };

  const filteredLessons = getFilteredLessons();

  // Helper to count lessons per day matching active filters
  const getLessonsCountForDay = (dayName) => {
    return lessons.filter(l => {
      if (dayName !== 'all' && l.day !== dayName) return false;
      if (selectedMonthKey !== 'all' && l.date && !l.date.startsWith(selectedMonthKey)) return false;
      if (statusFilter === 'pending' && l.completed) return false;
      if (statusFilter === 'completed' && !l.completed) return false;
      if (statusFilter === 'zamena' && !l.isZamena) return false;
      return true;
    }).length;
  };

  // Completed vs Pending Counts
  const completedLessonsCount = lessons.filter(l => l.completed).length;
  const pendingLessonsCount = lessons.filter(l => !l.completed).length;
  const zamenaLessonsCount = lessons.filter(l => l.isZamena).length;
  const totalCompletedHours = lessons.filter(l => l.completed).reduce((sum, l) => sum + Number(l.hours || 2), 0);

  // Helper to convert YYYY-MM-DD to day of week name (local timezone safe)
  const getDayNameFromYMD = (ymdStr) => {
    if (!ymdStr) return 'Dushanba';
    const [y, m, d] = ymdStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayIdx = dateObj.getDay();
    const mapDays = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    return mapDays[dayIdx] === 'Yakshanba' ? 'Dushanba' : mapDays[dayIdx];
  };

  const getSampleDateForDayName = (dayName) => {
    const mapDate = {
      'Dushanba': '2026-09-07',
      'Seshanba': '2026-09-08',
      'Chorshanba': '2026-09-09',
      'Payshanba': '2026-09-10',
      'Juma': '2026-09-11',
      'Shanba': '2026-09-12'
    };
    return mapDate[dayName] || '2026-09-07';
  };

  // Date selection helper
  const handleDateChange = (dateVal) => {
    if (!dateVal) return;
    const computedDay = getDayNameFromYMD(dateVal);
    setFormData(prev => ({
      ...prev,
      date: dateVal,
      day: computedDay
    }));
  };

  const openAddModal = (isZamenaQuick = false) => {
    const activeDay = selectedDay !== 'all' ? selectedDay : 'Dushanba';
    const activeDate = getSampleDateForDayName(activeDay);

    setEditingLesson(null);
    setFormData({
      title: teacher.subjects[0]?.name || 'Dasturlash (Python)',
      date: activeDate,
      day: activeDay,
      time: '1-juftlik',
      room: '204-xona',
      classGroup: teacher.subjects[0]?.groupName || '101-Guruh',
      hours: 2,
      isRecurring: !isZamenaQuick,
      isZamena: isZamenaQuick
    });
    setModalOpen(true);
  };

  const openEditModal = (lesson) => {
    setEditingLesson(lesson);
    setFormData({ 
      title: lesson.title,
      date: lesson.date || '2026-09-07',
      day: lesson.day || 'Dushanba',
      time: lesson.time || '1-juftlik',
      room: lesson.room || '204-xona',
      classGroup: lesson.classGroup || '101-Guruh',
      hours: lesson.hours || 2,
      isRecurring: lesson.isRecurring || false,
      isZamena: lesson.isZamena || false
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Duplicate Juftlik Conflict Check for same group
    const targetSlot = formData.time.split(' ')[0]; // '1-juftlik'
    const conflict = lessons.find(l => {
      if (editingLesson && l.id === editingLesson.id) return false;

      const sameGroup = l.classGroup && l.classGroup.trim().toLowerCase() === formData.classGroup.trim().toLowerCase();
      const sameSlot = l.time && l.time.toLowerCase().startsWith(targetSlot.toLowerCase());

      if (!sameGroup || !sameSlot) return false;

      if (formData.date && l.date && formData.date === l.date) return true;
      if (formData.day && l.day === formData.day && (l.isRecurring || formData.isRecurring)) return true;

      return false;
    });

    if (conflict) {
      alert(`⚠️ DIQQAT: ${formData.classGroup} guruhi uchun ${formData.date || formData.day} kuni ${targetSlot}da allaqachon dars mavjud!\n\nBitta guruh uchun bir xil kun va juftlikda 2 ta dars qo'yishga ruxsat berilmaydi.`);
      return;
    }

    if (editingLesson) {
      setLessons(prev => prev.map(l => l.id === editingLesson.id ? { ...l, ...formData } : l));
    } else {
      if (formData.isRecurring && formData.date) {
        // Generate recurring weekly lessons for 16 weeks (1 semester)
        const baseDate = new Date(formData.date);
        const recurringList = [];
        for (let w = 0; w < 16; w++) {
          const nextD = new Date(baseDate);
          nextD.setDate(baseDate.getDate() + (w * 7));
          const dStr = `${nextD.getFullYear()}-${String(nextD.getMonth() + 1).padStart(2, '0')}-${String(nextD.getDate()).padStart(2, '0')}`;
          
          recurringList.push({
            id: `l_${Date.now()}_w${w}`,
            ...formData,
            date: dStr,
            completed: false
          });
        }
        setLessons(prev => [...prev, ...recurringList]);
      } else {
        const newLesson = {
          id: 'l_' + Date.now(),
          ...formData,
          isRecurring: !!formData.isRecurring,
          completed: false
        };
        setLessons(prev => [...prev, newLesson]);
      }
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Ushbu darsni o'chirishni tasdiqlaysizmi?")) {
      setLessons(prev => prev.filter(l => l.id !== id));
    }
  };

  // 1-Click Toggle Zamena Status
  const toggleZamena = (lesson) => {
    const nextZamena = !lesson.isZamena;
    setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, isZamena: nextZamena } : l));

    if (lesson.date) {
      const [y, m, dStr] = lesson.date.split('-');
      const mKey = `${y}-${m}`;
      const dayNum = parseInt(dStr);

      const matchedSubj = teacher.subjects.find(s => s.name.toLowerCase().includes(lesson.title.toLowerCase()) || lesson.title.toLowerCase().includes(s.name.toLowerCase()));
      const subjId = matchedSubj ? matchedSubj.id : lesson.title;

      setMonthlyHours(prev => {
        const monthRec = prev[mKey] || {};
        const subjRec = (typeof monthRec[subjId] === 'object' && monthRec[subjId] !== null) ? { ...monthRec[subjId] } : {};
        
        if (lesson.completed) {
          subjRec[dayNum] = nextZamena ? `${lesson.hours || 2}z` : Number(lesson.hours || 2);
        }

        return {
          ...prev,
          [mKey]: {
            ...monthRec,
            [subjId]: subjRec
          }
        };
      });
    }
  };

  const toggleComplete = (lesson) => {
    const nextCompleted = !lesson.completed;

    setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, completed: nextCompleted } : l));

    // Auto-sync with Forma-2 monthlyHours if lesson has date
    if (lesson.date) {
      const [y, m, dStr] = lesson.date.split('-');
      const mKey = `${y}-${m}`;
      const dayNum = parseInt(dStr);

      const matchedSubj = teacher.subjects.find(s => s.name.toLowerCase().includes(lesson.title.toLowerCase()) || lesson.title.toLowerCase().includes(s.name.toLowerCase()));
      const subjId = matchedSubj ? matchedSubj.id : lesson.title;

      setMonthlyHours(prev => {
        const monthRec = prev[mKey] || {};
        const subjRec = (typeof monthRec[subjId] === 'object' && monthRec[subjId] !== null) ? { ...monthRec[subjId] } : {};
        
        if (nextCompleted) {
          // If Zamena lesson, store format "2z" for Forma-2
          subjRec[dayNum] = lesson.isZamena ? `${lesson.hours || 2}z` : Number(lesson.hours || 2);
        } else {
          delete subjRec[dayNum];
        }

        return {
          ...prev,
          [mKey]: {
            ...monthRec,
            [subjId]: subjRec
          }
        };
      });
    }
  };

  return (
    <div className="schedule-page">
      {/* Top Header & View Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <div className="nav-tabs" style={{ background: 'var(--bg-card)', padding: '6px', border: '1px solid var(--border-color)' }}>
          <button 
            className={`nav-tab-btn ${viewMode === 'weekly' ? 'active' : ''}`}
            onClick={() => setViewMode('weekly')}
          >
            <Clock size={16} />
            <span>Haftalik & Kunlik Darslar</span>
          </button>
          <button 
            className={`nav-tab-btn ${viewMode === 'yearly' ? 'active' : ''}`}
            onClick={() => setViewMode('yearly')}
          >
            <CalendarDays size={16} />
            <span>Oylik Kalendar</span>
          </button>
        </div>

        {viewMode === 'weekly' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => openAddModal(true)} style={{ color: '#8b5cf6', borderColor: '#8b5cf6' }}>
              <Zap size={18} />
              <span>+ Tezkor Zamena Qo'shish ("2z")</span>
            </button>
            <button className="btn btn-primary" onClick={() => openAddModal(false)}>
              <Plus size={18} />
              <span>Yangi Dars Qo'shish</span>
            </button>
          </div>
        )}
      </div>

      {viewMode === 'yearly' ? (
        <YearlyCalendar />
      ) : (
        <>
          {/* Top Banner Header */}
          <div className="card" style={{ marginBottom: '24px', background: 'var(--accent-gradient)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '4px' }}>Mashg'ulotlar Jadvali va Darslar Ijrosi</h2>
                <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                  Takrorlanuvchi haftalik darslar, zamena (o'rniga kirish "2z") darslar va ijro hisoboti
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Bajarilgan Soatlar</div>
                  <strong style={{ fontSize: '1.1rem' }}>{totalCompletedHours} soat</strong>
                </div>
              </div>
            </div>
          </div>

          {/* STATUS SEPARATION TABS (Bajarilgan vs Bajarilmagan vs Zamena darslar) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div className="nav-tabs" style={{ background: 'var(--bg-card)', padding: '4px', border: '1px solid var(--border-color)' }}>
              <button 
                className={`nav-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <span>Barcha Darslar ({lessons.length})</span>
              </button>

              <button 
                className={`nav-tab-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
                style={{ color: statusFilter === 'pending' ? 'white' : 'var(--warning)' }}
              >
                <XCircle size={15} />
                <span>⏳ Bajarilmagan ({pendingLessonsCount})</span>
              </button>

              <button 
                className={`nav-tab-btn ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('completed')}
                style={{ color: statusFilter === 'completed' ? 'white' : 'var(--success)' }}
              >
                <CheckCircle2 size={15} />
                <span>✅ Bajarilgan ({completedLessonsCount})</span>
              </button>

              <button 
                className={`nav-tab-btn ${statusFilter === 'zamena' ? 'active' : ''}`}
                onClick={() => setStatusFilter('zamena')}
                style={{ color: statusFilter === 'zamena' ? 'white' : '#8b5cf6' }}
              >
                <Zap size={15} />
                <span>🔄 Zamena Darslar ({zamenaLessonsCount})</span>
              </button>
            </div>

            {/* MONTH SELECTOR FILTER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select 
                value={selectedMonthKey} 
                onChange={e => setSelectedMonthKey(e.target.value)}
                className="form-select"
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
              >
                {MONTHS_FILTER.map(m => (
                  <option key={m.key} value={m.key}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Days Filter Buttons Bar with Correct Filtered Counts */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => setSelectedDay('all')}
              className={`btn ${selectedDay === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}
            >
              <span>Barcha kunlar</span>
              <span className="badge" style={{ backgroundColor: selectedDay === 'all' ? 'rgba(255,255,255,0.25)' : 'var(--bg-hover)', color: selectedDay === 'all' ? 'white' : 'var(--text-secondary)' }}>
                {getLessonsCountForDay('all')}
              </span>
            </button>
            {DAYS.map(day => {
              const dayCount = getLessonsCountForDay(day);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`btn ${selectedDay === day ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}
                >
                  <Calendar size={14} />
                  <span>{day}</span>
                  <span className="badge" style={{ backgroundColor: selectedDay === day ? 'rgba(255,255,255,0.25)' : 'var(--bg-hover)', color: selectedDay === day ? 'white' : 'var(--text-secondary)' }}>
                    {dayCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Lesson List Cards Grid */}
          {filteredLessons.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Clock size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Darslar mavjud emas</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Ushbu filtr bo'yicha mashg'ulotlar topilmadi. Filtrni "Barcha Oylar"ga o'tkazib ko'ring.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => { setSelectedMonthKey('all'); setStatusFilter('all'); setSelectedDay('all'); }}>
                  Barcha filtrlarni tozalash
                </button>
                <button className="btn btn-primary" onClick={() => openAddModal(false)}>
                  <Plus size={18} />
                  <span>Mashg'ulot Qo'shish</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredLessons.map(lesson => (
                <div 
                  key={lesson.id} 
                  className="card" 
                  style={{ 
                    borderLeft: lesson.isZamena ? '5px solid #8b5cf6' : lesson.completed ? '5px solid var(--success)' : '5px solid var(--warning)',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span className="badge badge-info">
                          <Users size={12} /> {lesson.classGroup} guruh
                        </span>
                        
                        {lesson.isZamena && (
                          <span className="badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.18)', color: '#8b5cf6', fontWeight: 800 }}>
                            ⚡ Zamena dars ({lesson.hours || 2}z)
                          </span>
                        )}

                        {lesson.isRecurring && (
                          <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                            <Repeat size={12} /> Takrorlanuvchi
                          </span>
                        )}

                        {lesson.date && (
                          <span className="badge badge-warning">
                            📅 {lesson.date} ({lesson.day})
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.15rem' }}>{lesson.title}</h3>
                    </div>

                    <button 
                      className={`btn ${lesson.completed ? 'btn-success' : 'btn-secondary'}`}
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      onClick={() => toggleComplete(lesson)}
                    >
                      <CheckCircle size={14} />
                      <span>{lesson.completed ? "Bajarildi" : "Kutilmoqda"}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} style={{ color: 'var(--accent-primary)' }} />
                      <span>Vaqti: <strong>{lesson.time}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} style={{ color: 'var(--accent-primary)' }} />
                      <span>Xona: <strong>{lesson.room}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={16} style={{ color: 'var(--success)' }} />
                      <span>Dars hajmi: <strong>{lesson.hours || 2} soat {lesson.isZamena ? '(Zamena "2z")' : ''}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)', gap: '8px' }}>
                    {/* 1-Click Quick Zamena Toggle Button */}
                    <button 
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', color: lesson.isZamena ? '#8b5cf6' : 'var(--text-secondary)', borderColor: lesson.isZamena ? '#8b5cf6' : 'var(--border-color)' }}
                      onClick={() => toggleZamena(lesson)}
                      title="1-bosish bilan Zamena (2z) rejimiga o'tkazish"
                    >
                      <Zap size={12} />
                      <span>{lesson.isZamena ? "⚡ Zamena (2z)" : "Zamena Qilish"}</span>
                    </button>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="icon-btn" onClick={() => openEditModal(lesson)} title="Tahrirlash">
                        <Edit3 size={16} />
                      </button>
                      <button className="icon-btn" onClick={() => handleDelete(lesson.id)} title="O'chirish">
                        <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add / Edit Lesson Modal */}
          {modalOpen && (
            <div className="modal-overlay" onClick={() => setModalOpen(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSave}>
                  <div className="modal-header">
                    <h3>{editingLesson ? "Darsni Tahrirlash" : (formData.isZamena ? "⚡ Zamena Dars Qo'shish ('2z')" : "Yangi Dars Qo'shish")}</h3>
                    <button type="button" className="icon-btn" onClick={() => setModalOpen(false)}>✕</button>
                  </div>

                  <div className="modal-body">
                    {/* Dars Turi (Standard vs Zamena dars) */}
                    <div className="form-group">
                      <label className="form-label">Dars Turi (Xususiyati)</label>
                      <select 
                        className="form-select"
                        value={formData.isZamena ? 'zamena' : 'standard'}
                        onChange={e => setFormData({ ...formData, isZamena: e.target.value === 'zamena' })}
                      >
                        <option value="standard">Standard Dars (Oddiy mashg'ulot)</option>
                        <option value="zamena">⚡ Zamena Dars (O'rniga kirish — Forma-2 da "2z")</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fan Nomi</label>
                      <select 
                        className="form-select"
                        value={formData.title}
                        onChange={e => {
                          const subj = teacher.subjects.find(s => s.name === e.target.value);
                          setFormData({ 
                            ...formData, 
                            title: e.target.value,
                            classGroup: subj ? subj.groupName : formData.classGroup
                          });
                        }}
                      >
                        {teacher.subjects.map(s => (
                          <option key={s.id} value={s.name}>{s.name} ({s.groupName})</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group">
                        <label className="form-label">Dars Sanasi (Oy va Kuni)</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          required
                          value={formData.date}
                          onChange={e => handleDateChange(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Hafta Kuni</label>
                        <select 
                          className="form-select"
                          value={formData.day}
                          onChange={e => setFormData({ ...formData, day: e.target.value })}
                        >
                          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group">
                        <label className="form-label">Guruh / Bosqich</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          required 
                          placeholder="Masalan: 101-Guruh" 
                          value={formData.classGroup}
                          onChange={e => setFormData({ ...formData, classGroup: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Dars Soati Hajmi</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          min="1"
                          max="8"
                          value={formData.hours}
                          onChange={e => setFormData({ ...formData, hours: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group">
                        <label className="form-label">Dars Juftligi (Tartibi)</label>
                        <select 
                          className="form-select"
                          value={formData.time}
                          onChange={e => setFormData({ ...formData, time: e.target.value })}
                        >
                          <option value="1-juftlik">1-juftlik</option>
                          <option value="2-juftlik">2-juftlik</option>
                          <option value="3-juftlik">3-juftlik</option>
                          <option value="4-juftlik">4-juftlik</option>
                          <option value="5-juftlik">5-juftlik</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Xona / Kabinet</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="204-xona" 
                          value={formData.room}
                          onChange={e => setFormData({ ...formData, room: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Takrorlanuvchi dars checkbox */}
                    <div className="form-group" style={{ background: 'var(--bg-hover)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                        <input 
                          type="checkbox"
                          checked={formData.isRecurring || false}
                          onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>🔄 Takrorlanuvchi Dars (Semestr davomida har haftaning shu kuni)</span>
                      </label>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '28px' }}>
                        Belgilansa, 1-semestr davomidagi barcha haftalarda ({formData.day} kunlari) avtomatik dars jadvali yaratiladi.
                      </p>
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
        </>
      )}
    </div>
  );
};
