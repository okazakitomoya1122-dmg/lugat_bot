import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  BookOpen, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle,
  Bell,
  Sun,
  Flame,
  Award,
  Star,
  ListFilter
} from 'lucide-react';

const MONTH_NAMES_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];

const DAY_NAMES_SHORT = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
const DAY_NAMES_FULL = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

export const YearlyCalendar = () => {
  const { lessons, calendarEvents, addCalendarEvent, deleteCalendarEvent, monthlyHours } = useApp();
  
  // Default to September 2026 (or current date if in 2026/2027)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonthIdx, setCurrentMonthIdx] = useState(8); // 8 = Sentabr
  const [selectedDateStr, setSelectedDateStr] = useState(null); // 'YYYY-MM-DD' for date modal
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('nazorat');

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Helper to format date numbers to YYYY-MM-DD
  const formatDateStr = (year, monthIdx, day) => {
    return `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Get day of week index (0=Monday, ..., 6=Sunday)
  const getFirstDayOfMonth = (year, monthIdx) => {
    const firstDay = new Date(year, monthIdx, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const startDayIndex = getFirstDayOfMonth(currentYear, currentMonthIdx);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonthIdx === 0) {
      setCurrentMonthIdx(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIdx(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx === 11) {
      setCurrentMonthIdx(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIdx(prev => prev + 1);
    }
  };

  // Get day name (Dushanba, Seshanba, etc.) from date string
  const getDayNameFromDateStr = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    const dayIdx = dateObj.getDay();
    const mapDays = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    return mapDays[dayIdx];
  };

  // Get scheduled lessons for a day of week
  // Get scheduled lessons for a specific date (handles non-recurring vs recurring)
  const getLessonsForDateStr = (dateStr) => {
    if (!dateStr) return [];
    const dayName = getDayNameFromDateStr(dateStr);

    const matched = lessons.filter(l => {
      if (l.date) {
        if (l.date === dateStr) return true;
        if (l.isRecurring === false) return false;
        // If recurring and has date, check if date matches
        return false;
      }
      return l.day === dayName && l.isRecurring !== false;
    });

    const uniqueMap = new Map();
    matched.forEach(l => {
      const key = `${l.title}_${l.time}_${l.classGroup}`;
      if (!uniqueMap.has(key) || l.date === dateStr) {
        uniqueMap.set(key, l);
      }
    });
    return Array.from(uniqueMap.values());
  };

  // Get scheduled lessons specifically for an exact calendar date cell
  const getLessonsForExactDate = (dateStr, dayName) => {
    const matched = lessons.filter(l => {
      if (l.date) {
        if (l.date === dateStr) return true;
        if (l.isRecurring === false) return false;
        return false;
      }
      return l.day === dayName && l.isRecurring !== false;
    });

    const uniqueMap = new Map();
    matched.forEach(l => {
      const key = `${l.title}_${l.time}_${l.classGroup}`;
      if (!uniqueMap.has(key) || l.date === dateStr) {
        uniqueMap.set(key, l);
      }
    });
    return Array.from(uniqueMap.values());
  };

  // Get special events on a date
  const getEventsForDate = (dateStr) => {
    return calendarEvents.filter(e => e.date === dateStr);
  };

  // Helper to check if a day is Sunday or holiday
  const isRedDay = (day) => {
    const dateStr = formatDateStr(currentYear, currentMonthIdx, day);
    const dateObj = new Date(currentYear, currentMonthIdx, day);
    const isSunday = dateObj.getDay() === 0;
    const isHoliday = calendarEvents.some(e => e.date === dateStr && (e.category === 'bayram' || e.category === 'tatil'));
    return isSunday || isHoliday;
  };

  // Open date detail modal
  const handleDayClick = (dateStr) => {
    setSelectedDateStr(dateStr);
    setNewEventTitle('');
    setNewEventCategory('nazorat');
  };

  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !selectedDateStr) return;

    addCalendarEvent({
      date: selectedDateStr,
      title: newEventTitle.trim(),
      category: newEventCategory,
      type: newEventCategory === 'bayram' ? 'holiday' : newEventCategory === 'nazorat' ? 'exam' : 'event'
    });

    setNewEventTitle('');
  };

  // Category Badge Helper
  const renderCategoryBadge = (category) => {
    switch (category) {
      case 'bayram':
        return <span className="badge badge-danger">🎉 Bayram / Dam olish</span>;
      case 'nazorat':
        return <span className="badge badge-warning">📝 Nazorat ishi</span>;
      case 'ochiq_dars':
        return <span className="badge badge-info">⭐ Ochiq dars</span>;
      case 'majlis':
        return <span className="badge badge-success">👥 Majlis</span>;
      case 'tatil':
        return <span className="badge" style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>🌴 Tatil</span>;
      default:
        return <span className="badge badge-info">📌 Tadbir</span>;
    }
  };

  // Calculate full monthly schedule breakdown (all lessons for this month)
  const getMonthlyLessonsBreakdown = () => {
    const breakdown = [];
    let totalPairsCount = 0;
    let totalHoursCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDateStr(currentYear, currentMonthIdx, d);
      const dayName = getDayNameFromDateStr(dateStr);
      const dayLessons = getLessonsForExactDate(dateStr, dayName);
      const dayEvents = getEventsForDate(dateStr);

      if (dayLessons.length > 0 || dayEvents.length > 0) {
        totalPairsCount += dayLessons.length;
        totalHoursCount += dayLessons.length * 2; // 1 pair = 2 hours

        breakdown.push({
          day: d,
          dateStr,
          dayName,
          lessonsList: dayLessons,
          eventsList: dayEvents,
          isSundayOrHoliday: isRedDay(d)
        });
      }
    }

    return { breakdown, totalPairsCount, totalHoursCount };
  };

  const { breakdown: monthlyBreakdown, totalPairsCount, totalHoursCount } = getMonthlyLessonsBreakdown();

  // Create Days Matrix Array for Grid
  const daysArray = [];
  for (let i = 0; i < startDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <div className="month-calendar-view" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header Card with Month Selector */}
      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="logo-icon-bg" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)' }}>
              <CalendarIcon size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>{MONTH_NAMES_UZ[currentMonthIdx]} {currentYear} - Oylik Kalendar</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Katta oylik kalendar, dars vaqtlari (ko'k belgilar) hamda tadbirlar paneli
              </p>
            </div>
          </div>

          {/* Month Selector Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handlePrevMonth} style={{ padding: '8px 14px' }}>
              <ChevronLeft size={18} />
              <span>Oldingi oy</span>
            </button>

            <div className="year-selector-group" style={{ padding: '6px 12px' }}>
              <select 
                value={currentMonthIdx} 
                onChange={e => setCurrentMonthIdx(Number(e.target.value))}
                className="form-select"
                style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', padding: '2px 6px' }}
              >
                {MONTH_NAMES_UZ.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
              <select 
                value={currentYear} 
                onChange={e => setCurrentYear(Number(e.target.value))}
                className="form-select"
                style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', padding: '2px 6px' }}
              >
                {[2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button className="btn btn-secondary" onClick={handleNextMonth} style={{ padding: '8px 14px' }}>
              <span>Keyingi oy</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Key Indicators / Legend Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-info" style={{ backgroundColor: '#3b82f6', color: 'white', fontWeight: 700 }}>
              📘 2 juftlik (4 soat)
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>Kunning rejalashtirilgan dars soatlari</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="dot dot-holiday" />
            <span style={{ color: 'var(--text-secondary)' }}>Bayram / Dam olish</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="dot dot-exam" />
            <span style={{ color: 'var(--text-secondary)' }}>Nazorat ishi</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <span className="is-today-legend" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Bugungi kun</span>
          </div>
        </div>
      </div>

      {/* LARGE SINGLE-MONTH CALENDAR GRID */}
      <div className="card large-month-calendar-card">
        {/* Days Header Row */}
        <div className="large-calendar-header">
          {DAY_NAMES_FULL.map((dayName, idx) => (
            <div key={dayName} className={`large-day-title ${idx >= 5 ? 'weekend' : ''}`}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Large Grid Days */}
        <div className="large-calendar-grid">
          {daysArray.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="large-day-box empty" />;
            }

            const dateStr = formatDateStr(currentYear, currentMonthIdx, day);
            const isTodayCell = dateStr === todayStr;
            const dayName = getDayNameFromDateStr(dateStr);
            const dayLessons = getLessonsForExactDate(dateStr, dayName);
            const dayEvents = getEventsForDate(dateStr);
            const isRed = isRedDay(day);

            const totalPairs = dayLessons.length;
            const totalHours = totalPairs * 2;

            return (
              <div 
                key={dateStr}
                onClick={() => handleDayClick(dateStr)}
                className={`large-day-box ${isTodayCell ? 'is-today' : ''} ${isRed ? 'is-red-day' : ''} ${dayLessons.length > 0 ? 'has-lessons' : ''}`}
              >
                {/* Day Header Number & Day Badge */}
                <div className="large-day-box-header">
                  <span className="day-number">{day}</span>
                  {isTodayCell && <span className="today-badge">Bugun</span>}
                </div>

                {/* SPECIAL BLUE LESSON BADGE (As requested by user!) */}
                {totalPairs > 0 && !isRed && (
                  <div className="blue-lesson-badge" title={`${totalPairs} ta juftlik dars (${totalHours} soat)`}>
                    <BookOpen size={13} />
                    <span>{totalPairs} juftlik ({totalHours}s)</span>
                  </div>
                )}

                {/* Lessons summary text list inside box */}
                <div className="large-day-lessons-list">
                  {dayLessons.slice(0, 2).map(l => (
                    <div key={l.id} className="mini-lesson-item">
                      <span className="mini-lesson-title">• {l.title}</span>
                      <span className="mini-lesson-group">({l.classGroup})</span>
                    </div>
                  ))}
                  {dayLessons.length > 2 && (
                    <div className="mini-lesson-more">+{dayLessons.length - 2} ta dars</div>
                  )}
                </div>

                {/* Event Indicator Badges */}
                {dayEvents.length > 0 && (
                  <div className="large-day-events">
                    {dayEvents.map(evt => (
                      <div key={evt.id} className={`mini-event-tag tag-${evt.category}`}>
                        {evt.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* OVERALL MONTHLY LESSONS BREAKDOWN LIST (Ostiga umumiy osha oy darslarini korsatish) */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListFilter size={20} style={{ color: 'var(--accent-primary)' }} />
              {MONTH_NAMES_UZ[currentMonthIdx]} {currentYear} — Umumiy Oy Darslari Ro'yxati
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Ushbu oy davomidagi barcha dars va mashg'ulotlarning umumiy ko'rinishi
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-info" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              📘 Jami darslar: {totalPairsCount} juftlik
            </span>
            <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              ⏱ Jami soatlar: {totalHoursCount} soat
            </span>
          </div>
        </div>

        {monthlyBreakdown.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
            Ushbu oy uchun darslar jadvali topilmadi
          </p>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Sana</th>
                  <th style={{ width: '120px' }}>Hafta Kuni</th>
                  <th>Mashg'ulotlar (Juftliklar) & Fanlar</th>
                  <th>Guruh</th>
                  <th>Vaqti & Xona</th>
                  <th style={{ textAlign: 'right' }}>Soat</th>
                </tr>
              </thead>
              <tbody>
                {monthlyBreakdown.map(item => (
                  <tr 
                    key={item.dateStr} 
                    onClick={() => handleDayClick(item.dateStr)} 
                    style={{ cursor: 'pointer', backgroundColor: item.isSundayOrHoliday ? 'var(--danger-light)' : 'transparent' }}
                  >
                    <td>
                      <strong style={{ fontSize: '0.95rem' }}>{item.day}-{MONTH_NAMES_UZ[currentMonthIdx]}</strong>
                    </td>
                    <td>
                      <span className={`badge ${item.isSundayOrHoliday ? 'badge-danger' : 'badge-info'}`}>
                        {item.dayName}
                      </span>
                    </td>
                    <td>
                      {item.lessonsList.length === 0 ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Dam olish / Bayram kuni
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {item.lessonsList.map(l => (
                            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <BookOpen size={14} style={{ color: 'var(--accent-primary)' }} />
                              <strong style={{ fontSize: '0.9rem' }}>{l.title}</strong>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Display date events if any */}
                      {item.eventsList.map(evt => (
                        <div key={evt.id} style={{ marginTop: '4px' }}>
                          {renderCategoryBadge(evt.category)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{evt.title}</span>
                        </div>
                      ))}
                    </td>
                    <td>
                      {item.lessonsList.map(l => (
                        <div key={l.id} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {l.classGroup}
                        </div>
                      ))}
                    </td>
                    <td>
                      {item.lessonsList.map(l => (
                        <div key={l.id} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {l.time} • {l.room}
                        </div>
                      ))}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {item.lessonsList.length > 0 && (
                        <span className="badge badge-success" style={{ fontWeight: 700 }}>
                          {item.lessonsList.length * 2} soat
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DATE DETAILS MODAL (Sanasiga kirganda o'sha kuni o'tiladigan darslarni ko'rsatish) */}
      {selectedDateStr && (
        <div className="modal-overlay" onClick={() => setSelectedDateStr(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ background: 'var(--accent-gradient)', color: 'white', flexShrink: 0 }}>
              <div>
                <h3 style={{ color: 'white', fontSize: '1.2rem' }}>
                  {selectedDateStr} — {getDayNameFromDateStr(selectedDateStr)}
                </h3>
                <p style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                  Shu kuni o'tiladigan darslar hamda tadbirlar ma'lumoti
                </p>
              </div>
              <button className="icon-btn" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'transparent' }} onClick={() => setSelectedDateStr(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Section 1: Detailed Lessons list on this exact day */}
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} style={{ color: 'var(--accent-primary)' }} />
                  Ushbu Kuni O'tiladigan Darslar va Mashg'ulotlar:
                </h4>

                {getLessonsForDateStr(selectedDateStr).length === 0 ? (
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '14px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                    Ushbu kun uchun rejalashtirilgan darslar yo'q (Dam olish kuni yoki jadval bo'sh)
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                    {getLessonsForDateStr(selectedDateStr).map(l => (
                      <div 
                        key={l.id} 
                        style={{ 
                          padding: '14px 18px', 
                          borderRadius: 'var(--radius-md)', 
                          background: 'var(--bg-hover)', 
                          borderLeft: l.isZamena ? '5px solid #8b5cf6' : '5px solid var(--accent-primary)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
                            <Users size={12} /> {l.classGroup} guruh
                          </span>
                          <span className="badge badge-success" style={{ fontSize: '0.8rem' }}>
                            {l.hours || 2} soat {l.isZamena ? '(Zamena "2z")' : '(1 juftlik)'}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{l.title}</h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={15} style={{ color: 'var(--accent-primary)' }} />
                            <span>Vaqti: <strong>{l.time}</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={15} style={{ color: 'var(--accent-primary)' }} />
                            <span>Xona: <strong>{l.room}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Special Events / Notes */}
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} style={{ color: 'var(--warning)' }} />
                  Kunga Biriktirilgan Tadbir va Bayramlar:
                </h4>
                {getEventsForDate(selectedDateStr).length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                    Hozircha ushbu kunga maxsus tadbir kiritilmagan
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getEventsForDate(selectedDateStr).map(evt => (
                      <div key={evt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {renderCategoryBadge(evt.category)}
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{evt.title}</span>
                        </div>
                        <button className="icon-btn" style={{ width: '32px', height: '32px' }} onClick={() => deleteCalendarEvent(evt.id)} title="O'chirish">
                          <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Add event form */}
              <form onSubmit={handleAddEventSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  + Ushbu kunga yangi tadbir/eslatma qo'shish:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '10px', marginBottom: '10px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Masalan: Python oraliq nazorat ishi" 
                    value={newEventTitle}
                    onChange={e => setNewEventTitle(e.target.value)}
                    required
                  />
                  <select 
                    className="form-select"
                    value={newEventCategory}
                    onChange={e => setNewEventCategory(e.target.value)}
                  >
                    <option value="nazorat">Nazorat ishi</option>
                    <option value="bayram">Bayram/Tatil</option>
                    <option value="ochiq_dars">Ochiq dars</option>
                    <option value="majlis">Majlis</option>
                    <option value="eslatma">Eslatma</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                  <Plus size={16} />
                  <span>Tadbirni Saqlash</span>
                </button>
              </form>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedDateStr(null)}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
