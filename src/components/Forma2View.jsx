import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportForma2ToExcel } from '../utils/excelExport';
import { Download, Calendar, BookOpen, Edit3, CheckCircle, Wand2 } from 'lucide-react';

const MONTHS = [
  { key: '2026-09', name: 'Sentabr', year: 2026, monthIdx: 8 },
  { key: '2026-10', name: 'Oktyabr', year: 2026, monthIdx: 9 },
  { key: '2026-11', name: 'Noyabr', year: 2026, monthIdx: 10 },
  { key: '2026-12', name: 'Dekabr', year: 2026, monthIdx: 11 },
  { key: '2027-01', name: 'Yanvar', year: 2027, monthIdx: 0 },
  { key: '2027-02', name: 'Fevral', year: 2027, monthIdx: 1 },
  { key: '2027-03', name: 'Mart', year: 2027, monthIdx: 2 },
  { key: '2027-04', name: 'Aprel', year: 2027, monthIdx: 3 },
  { key: '2027-05', name: 'May', year: 2027, monthIdx: 4 },
  { key: '2027-06', name: 'Iyun', year: 2027, monthIdx: 5 }
];

export const Forma2View = () => {
  const { 
    teacher, 
    monthlyHours, 
    setMonthlyHours, 
    forma2MonthYear, 
    setForma2MonthYear,
    calendarEvents,
    lessons
  } = useApp();

  const [editCellModal, setEditCellModal] = useState(null); // { subjId, subjName, day, hours }

  const selectedMonthObj = MONTHS.find(m => m.key === forma2MonthYear) || MONTHS[0];
  const [yearStr, monthStr] = selectedMonthObj.key.split('-');
  const currentYear = parseInt(yearStr);
  const currentMonthNum = parseInt(monthStr);

  // Number of days in selected month (e.g. 30 for Sep, 31 for Oct)
  const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Helper to check if a specific day is Sunday or Holiday
  const isRedDay = (day) => {
    const dateObj = new Date(currentYear, currentMonthNum - 1, day);
    const isSunday = dateObj.getDay() === 0; // 0 = Sunday
    const dateStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isHoliday = calendarEvents.some(e => e.date === dateStr && (e.category === 'bayram' || e.category === 'tatil'));
    return isSunday || isHoliday;
  };

  const getSubjectNameById = (id) => {
    const s = teacher.subjects.find(sub => sub.id === id);
    return s ? s.name : id;
  };

  // Helper to get daily hours for a subject in a month (Auto-calculated from schedule if not overridden)
  const getSubjectDailyHours = (mKey, subjId) => {
    const subj = teacher.subjects.find(s => s.id === subjId || s.name === subjId);
    const keyToUse = subj ? subj.id : subjId;
    const nameToUse = subj ? subj.name : subjId;

    if (monthlyHours[mKey] && (monthlyHours[mKey][keyToUse] !== undefined || monthlyHours[mKey][nameToUse] !== undefined)) {
      const record = monthlyHours[mKey][keyToUse] ?? monthlyHours[mKey][nameToUse];
      if (typeof record === 'object' && record !== null) {
        return record;
      } else if (typeof record === 'number') {
        return { 1: record };
      }
    }

    // Auto-generate from schedule in `lessons` for dates in this month
    const [yStr, mStr] = mKey.split('-');
    const y = parseInt(yStr);
    const m = parseInt(mStr);
    const numDays = new Date(y, m, 0).getDate();
    const dayNameMap = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const generated = {};

    for (let d = 1; d <= numDays; d++) {
      const dateObj = new Date(y, m - 1, d);
      const isSunday = dateObj.getDay() === 0;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isHoliday = calendarEvents.some(e => e.date === dateStr && (e.category === 'bayram' || e.category === 'tatil'));
      if (isSunday || isHoliday) continue;

      const dayName = dayNameMap[dateObj.getDay()];
      const dayLessons = lessons.filter(l => (l.date === dateStr || (!l.date && l.day === dayName)));

      dayLessons.forEach(l => {
        const isMatch = subj && (
          l.title.toLowerCase().includes(subj.name.toLowerCase()) ||
          subj.name.toLowerCase().includes(l.title.toLowerCase()) ||
          (subj.groupName && l.classGroup && l.classGroup.toLowerCase() === subj.groupName.toLowerCase())
        );

        if (isMatch) {
          const hVal = l.isZamena ? `${l.hours || 2}z` : (l.hours || 2);
          generated[d] = hVal;
        }
      });
    }

    return generated;
  };

  // Calculate cumulative completed hours across all previous months up to selected month
  const getPreviousMonthsHours = (subjId) => {
    const selectedMonthIdx = MONTHS.findIndex(m => m.key === forma2MonthYear);
    let total = 0;

    for (let i = 0; i < selectedMonthIdx; i++) {
      const mKey = MONTHS[i].key;
      const dailyH = getSubjectDailyHours(mKey, subjId);
      Object.values(dailyH).forEach(h => total += (parseInt(String(h || 0), 10) || 0));
    }
    return total;
  };

  // Save single day cell hours (supports standard numbers e.g. 2, and Zamena format e.g. "2z")
  const handleSaveCellHours = (subjId, day, hoursVal) => {
    const valStr = String(hoursVal).trim();
    setMonthlyHours(prev => {
      const monthData = prev[forma2MonthYear] || {};
      const currentSubjData = getSubjectDailyHours(forma2MonthYear, subjId);
      const newSubjData = { ...currentSubjData };
      
      if (!valStr || valStr === '0') {
        delete newSubjData[day];
      } else {
        newSubjData[day] = valStr.includes('z') ? valStr : (parseInt(valStr, 10) || valStr);
      }

      return {
        ...prev,
        [forma2MonthYear]: {
          ...monthData,
          [subjId]: newSubjData
        }
      };
    });
    setEditCellModal(null);
  };

  // Auto-fill month hours based on weekly schedule in `lessons`
  const handleAutoFillFromSchedule = () => {
    if (!window.confirm(`${selectedMonthObj.name} oyi uchun jadvalingizdagi darslarni avtomatik kunlar bo'yicha to'ldirishni tasdiqlaysizmi?`)) return;

    const dayNameMap = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const newMonthRecord = {};

    teacher.subjects.forEach(subj => {
      newMonthRecord[subj.id] = {};
    });

    for (let d = 1; d <= daysInMonth; d++) {
      if (isRedDay(d)) continue; // Skip Sundays & Holidays
      
      const dateObj = new Date(currentYear, currentMonthNum - 1, d);
      const dayName = dayNameMap[dateObj.getDay()];
      const dateStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Find lessons matching this date OR day of week
      const dayLessons = lessons.filter(l => (l.date === dateStr || (!l.date && l.day === dayName)));

      dayLessons.forEach(l => {
        const matchedSubj = teacher.subjects.find(s => 
          s.name.toLowerCase().includes(l.title.toLowerCase()) || 
          l.title.toLowerCase().includes(s.name.toLowerCase()) ||
          (s.groupName && l.classGroup && l.classGroup.toLowerCase() === s.groupName.toLowerCase())
        );

        if (matchedSubj) {
          const hVal = l.isZamena ? `${l.hours || 2}z` : (l.hours || 2);
          newMonthRecord[matchedSubj.id][d] = hVal;
        }
      });
    }

    setMonthlyHours(prev => ({
      ...prev,
      [forma2MonthYear]: newMonthRecord
    }));

    alert(`${selectedMonthObj.name} oyi uchun darslar jadval bo'yicha avtomatik to'ldirildi!`);
  };

  const handleExcelExport = () => {
    exportForma2ToExcel(
      teacher,
      selectedMonthObj,
      monthlyHours,
      calendarEvents,
      daysInMonth
    );
  };

  // Calculate daily totals across all subjects for summary row 22
  const getDailyTotalAllSubjects = (day) => {
    let sum = 0;
    teacher.subjects.forEach(subj => {
      const dh = getSubjectDailyHours(forma2MonthYear, subj.id);
      sum += Number(dh[day] || 0);
    });
    return sum;
  };

  return (
    <div className="forma2-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Control Actions */}
      <div className="card" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '4px' }}>Forma-2 Oylik Dars Yuklamasi Hisoboti</h2>
            <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
              O'qituvchi: <strong>{teacher.name}</strong> | Texnikum: <strong>{teacher.school}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-header-light" onClick={handleAutoFillFromSchedule} title="Haftalik jadval bo'yicha avto-to'ldirish">
              <Wand2 size={18} />
              <span>Jadvaldan Avto-to'ldirish</span>
            </button>

            <button className="btn btn-header-light" onClick={handleExcelExport} title="Excel formatida yuklab olish">
              <Download size={18} />
              <span>Excel (.xlsx) Yuklab Olish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Month Selector Filter Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Calendar size={18} className="text-primary" />
            <span>Hisobot Oyi:</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 1, padding: '4px 0' }}>
            {MONTHS.map(m => (
              <button
                key={m.key}
                onClick={() => setForma2MonthYear(m.key)}
                className={`btn ${forma2MonthYear === m.key ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}
              >
                {m.name} ({m.year})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Official Paper Document Canvas (Replicating uploaded screenshot) */}
      <div className="card forma2-document-paper" style={{ overflowX: 'auto', padding: '30px 24px' }}>
        
        {/* Document Top Right Deputy Head Header */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-primary)' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>"Tasdiqlayman"</div>
            <div>{teacher.school} O'IBDO'</div>
            <div>o'rinbosari ___________ {teacher.deputyHead || "S.Abduraxmonova"}</div>
          </div>
        </div>

        {/* Document Main Center Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px', padding: '0 10px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            {teacher.school}ning Maxsus fan o'qituvchisi {teacher.name} {currentYear} yil {selectedMonthObj.name} oyi uchun o'quv jarayonida bajariladigan dars soatlarini hisobga olish varaqasi
          </h3>
        </div>

        {/* Official Grid Table */}
        <div className="table-responsive" style={{ border: '2px solid var(--text-primary)', borderRadius: '4px' }}>
          <table className="forma2-official-table">
            <thead>
              {/* Row 1: Column Headers */}
              <tr>
                <th rowSpan={2} className="col-no">№</th>
                <th rowSpan={2} className="col-subj">Fanlar nomi</th>
                <th rowSpan={2} className="col-total">Jami soat</th>
                <th colSpan={daysInMonth} className="col-days-header">
                  Kalendar (oy) kunlari
                </th>
                <th rowSpan={2} className="col-summary">Jami</th>
                <th rowSpan={2} className="col-qoldiq">Qol-dars</th>
              </tr>
              {/* Row 2: Day Numbers 1..N */}
              <tr>
                {daysArray.map(d => (
                  <th 
                    key={d} 
                    className={`col-day-num ${isRedDay(d) ? 'red-header-cell' : ''}`}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teacher.subjects.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth + 5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Ustoz bo'limida fanlar kiritilmagan. Avval "Ustoz bo'limi"da fanlarni qo'shing.
                  </td>
                </tr>
              ) : (
                teacher.subjects.map((subj, idx) => {
                  const dailyHours = getSubjectDailyHours(forma2MonthYear, subj.id);
                  let currentMonthTotal = 0;
                  daysArray.forEach(d => {
                    const val = dailyHours[d];
                    currentMonthTotal += parseInt(String(val || 0), 10) || 0;
                  });

                  const prevCompleted = getPreviousMonthsHours(subj.id, subj.name);
                  const cumulativeTotal = prevCompleted + currentMonthTotal;
                  const qoldiqDars = Math.max(0, Number(subj.annualHours) - cumulativeTotal);

                  return (
                    <tr key={subj.id || idx}>
                      {/* № */}
                      <td className="cell-center"><strong>{idx + 1}</strong></td>
                      
                      {/* Fan nomi & Guruh */}
                      <td className="cell-subj-name">
                        <strong style={{ fontSize: '0.85rem' }}>{subj.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          — {subj.groupName || '101-Guruh'}
                        </span>
                      </td>

                      {/* Jami soat (Ustoz bo'limidagi yillik soat) */}
                      <td className="cell-center cell-bold">{subj.annualHours}</td>

                      {/* Daily Hours 1..N */}
                      {daysArray.map(d => {
                        const h = dailyHours[d];
                        const isRed = isRedDay(d);
                        const isZamenaCell = typeof h === 'string' && h.includes('z');
                        return (
                          <td 
                            key={d}
                            onClick={() => setEditCellModal({ subjId: subj.id, subjName: subj.name, day: d, hours: h || 0 })}
                            className={`cell-day-hour ${isRed ? 'red-body-cell' : ''} ${h ? 'has-hours' : ''}`}
                            style={isZamenaCell ? { backgroundColor: 'rgba(139, 92, 246, 0.25)', color: '#6d28d9', fontWeight: 'bold' } : {}}
                            title={`${d}-${selectedMonthObj.name}: ${h || 0} soat ${isZamenaCell ? '(Zamena dars)' : ''}`}
                          >
                            {isRed ? '' : (h || '')}
                          </td>
                        );
                      })}

                      {/* Jami (Joriy oyda bajarilgan jami soat) */}
                      <td className="cell-center cell-bold cell-highlight">{currentMonthTotal || 0}</td>

                      {/* Qol-dars (Qoldiq dars soati) */}
                      <td className="cell-center cell-bold cell-qoldiq">{qoldiqDars}</td>
                    </tr>
                  );
                })
              )}

              {/* Empty padding rows if less than 19 rows (matching screenshot layout) */}
              {Array.from({ length: Math.max(0, 12 - teacher.subjects.length) }).map((_, emptyIdx) => (
                <tr key={`empty-${emptyIdx}`} className="empty-table-row">
                  <td className="cell-center">{teacher.subjects.length + emptyIdx + 1}</td>
                  <td />
                  <td />
                  {daysArray.map(d => (
                    <td key={d} className={isRedDay(d) ? 'red-body-cell' : ''} />
                  ))}
                  <td />
                  <td />
                </tr>
              ))}

              {/* Summary Row 20: I-semestr qolgan soat (Gray Row) */}
              <tr className="summary-gray-row">
                <td className="cell-center"><strong>20</strong></td>
                <td colSpan={2}><strong>I-semestr qolgan soat</strong></td>
                {daysArray.map(d => (
                  <td key={d} className={isRedDay(d) ? 'red-body-cell' : 'gray-cell'} />
                ))}
                <td colSpan={2} className="gray-cell" />
              </tr>

              {/* Summary Row 22: Jami kunlik soatlar */}
              <tr className="summary-daily-row">
                <td className="cell-center"><strong>22</strong></td>
                <td colSpan={2}><strong>Jami kunlik soatlar</strong></td>
                {daysArray.map(d => {
                  const dayTotal = getDailyTotalAllSubjects(d);
                  const isRed = isRedDay(d);
                  return (
                    <td key={d} className={`cell-center cell-bold ${isRed ? 'red-body-cell' : ''}`}>
                      {isRed ? '' : (dayTotal || '')}
                    </td>
                  );
                })}
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Signatures Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', paddingTop: '16px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          <div>
            ____ n boshlig'i _______________________
          </div>
          <div>
            Fan o'qituvchisi _______________________
          </div>
        </div>

      </div>

      {/* Edit Single Day Cell Modal */}
      {editCellModal && (
        <div className="modal-overlay" onClick={() => setEditCellModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>{editCellModal.subjName}</h3>
              <button type="button" className="icon-btn" onClick={() => setEditCellModal(null)}>✕</button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', marginBottom: '14px', color: 'var(--text-secondary)' }}>
                <strong>{editCellModal.day}-{selectedMonthObj.name}</strong> kuni uchun o'tilgan dars soati hajmini kiriting:
              </p>

              <div className="form-group">
                <label className="form-label">Dars soati (masalan: 2, 4, yoki Zamena dars uchun: 2z, 4z)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Masalan: 2 yoki 2z"
                  autoFocus
                  value={editCellModal.hours}
                  onChange={e => setEditCellModal({ ...editCellModal, hours: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => handleSaveCellHours(editCellModal.subjId, editCellModal.day, 2)}>
                  +2 soat (Standard)
                </button>
                <button type="button" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#8b5cf6', borderColor: '#8b5cf6' }} onClick={() => handleSaveCellHours(editCellModal.subjId, editCellModal.day, '2z')}>
                  🔄 +2z (Zamena)
                </button>
                <button type="button" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => handleSaveCellHours(editCellModal.subjId, editCellModal.day, 4)}>
                  +4 soat (Standard)
                </button>
                <button type="button" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#8b5cf6', borderColor: '#8b5cf6' }} onClick={() => handleSaveCellHours(editCellModal.subjId, editCellModal.day, '4z')}>
                  🔄 +4z (Zamena)
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => handleSaveCellHours(editCellModal.subjId, editCellModal.day, 0)}>
                Tozalash (0 soat)
              </button>
              <button type="button" className="btn btn-primary" onClick={() => handleSaveCellHours(editCellModal.subjId, editCellModal.day, editCellModal.hours)}>
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
