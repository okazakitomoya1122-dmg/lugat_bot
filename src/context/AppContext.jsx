import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const INITIAL_TEACHER = {
  name: "Axmedov Foziljon",
  school: "Marg'ilon shahar 4-son texnikumi",
  deputyHead: "S.Abduraxmonova",
  subjects: [
    { id: '1', name: 'Dasturlash (Python)', groupName: '101-Guruh', annualHours: 120 },
    { id: '2', name: 'Ma\'lumotlar Bazasi (SQL)', groupName: '202-K', annualHours: 100 },
    { id: '3', name: 'Kompyuter Tarmoqlari', groupName: '305-T', annualHours: 80 }
  ]
};

const INITIAL_LESSONS = [
  { id: 'l1', date: '2026-09-07', day: 'Dushanba', title: 'Dasturlash (Python)', time: '1-juftlik', room: '204-xona', classGroup: '101-Guruh', hours: 2, isRecurring: true, isZamena: false, completed: true },
  { id: 'l2', date: '2026-09-07', day: 'Dushanba', title: 'Ma\'lumotlar Bazasi (SQL)', time: '2-juftlik', room: '102-lab', classGroup: '202-K', hours: 2, isRecurring: true, isZamena: false, completed: false },
  { id: 'l3', date: '2026-09-08', day: 'Seshanba', title: 'Kompyuter Tarmoqlari', time: '1-juftlik', room: '301-xona', classGroup: '305-T', hours: 2, isRecurring: true, isZamena: false, completed: false },
  { id: 'l4', date: '2026-09-09', day: 'Chorshanba', title: 'Dasturlash (Python)', time: '3-juftlik', room: '204-xona', classGroup: '101-Guruh', hours: 2, isRecurring: true, isZamena: false, completed: true },
  { id: 'l5', date: '2026-09-10', day: 'Payshanba', title: 'Ma\'lumotlar Bazasi (SQL)', time: '2-juftlik', room: '102-lab', classGroup: '202-K', hours: 2, isRecurring: true, isZamena: false, completed: false },
  { id: 'l6', date: '2026-09-16', day: 'Chorshanba', title: 'Dasturlash (Python)', time: '2-juftlik', room: '204-xona', classGroup: '101-Guruh', hours: 2, isRecurring: false, isZamena: true, completed: true }
];

const INITIAL_MONTHLY_HOURS = {
  '2026-09': {
    '1': { 2: 2, 4: 2, 9: 4, 11: 2, 16: '2z', 18: 4, 23: 2, 25: 2, 30: 4 },
    '2': { 3: 2, 5: 2, 10: 2, 12: 4, 17: 2, 19: '2z', 24: 2, 26: 4 },
    '3': { 2: 2, 8: 2, 9: 2, 15: 2, 16: 2, 22: 2, 23: 2, 29: 2, 30: 2 }
  }
};

const INITIAL_TASKS = [
  { id: 't1', title: "101-Guruh talabalari amaliyot daftarlarini tekshirish", completed: true },
  { id: 't2', title: "Python dasturlash fanidan ochiq dars konspekti", completed: false },
  { id: 't3', title: "Oylik Forma-2 yuklama hisobotini topshirish", completed: false }
];

const INITIAL_TARGETS = [
  { id: 'tg1', title: "1-Semestr oraliq va yakuniy nazorat ishlarini o'tkazish", month: "Noyabr" }
];

const INITIAL_QUICK_TOPICS = [
  { id: 'qt1', title: "Relatsion ma'lumotlar bazasini loyihalash va SQL so'rovlar" }
];

const INITIAL_CALENDAR_EVENTS = [
  { id: 'ce1', date: '2026-09-01', title: 'Mustaqillik kuni', type: 'holiday', category: 'bayram' },
  { id: 'ce2', date: '2026-09-02', title: '1-Semestr mashg\'ulotlari boshlanishi', type: 'event', category: 'maktab' },
  { id: 'ce3', date: '2026-10-01', title: 'O\'qituvchi va murabbiylar kuni', type: 'holiday', category: 'bayram' },
  { id: 'ce4', date: '2026-11-15', title: '1-Semestr Oraliq Nazorat haftaligi', type: 'exam', category: 'nazorat' },
  { id: 'ce5', date: '2026-12-08', title: 'Konstitutsiya kuni', type: 'holiday', category: 'bayram' },
  { id: 'ce6', date: '2026-12-20', title: 'Python fanidan ochiq dars va laboratoriya', type: 'open_lesson', category: 'ochiq_dars' },
  { id: 'ce7', date: '2027-01-15', title: '1-Semestr Yakuniy imtihonlar boshlanishi', type: 'exam', category: 'nazorat' },
  { id: 'ce8', date: '2027-01-25', title: 'Qishki Tatil / Semestrlar oralig\'i boshlanishi', type: 'event', category: 'tatil' },
  { id: 'ce9', date: '2027-02-08', title: '2-Semestr mashg\'ulotlari boshlanishi', type: 'event', category: 'maktab' },
  { id: 'ce10', date: '2027-03-08', title: 'Xotin-qizlar kuni', type: 'holiday', category: 'bayram' },
  { id: 'ce11', date: '2027-03-21', title: 'Navro\'z bayrami', type: 'holiday', category: 'bayram' },
  { id: 'ce12', date: '2027-04-20', title: 'Ishlab chiqarish amaliyoti boshlanishi', type: 'event', category: 'maktab' },
  { id: 'ce13', date: '2027-05-09', title: 'Xotira va qadrlash kuni', type: 'holiday', category: 'bayram' },
  { id: 'ce14', date: '2027-06-15', title: '2-Semestr Yakuniy imtihonlar va Diplom himoyasi', type: 'exam', category: 'nazorat' },
  { id: 'ce15', date: '2027-06-26', title: 'Yozgi Tatil boshlanishi', type: 'event', category: 'tatil' }
];

export const AppProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');
  
  // Teacher profile
  const [teacher, setTeacher] = useState(() => {
    const saved = localStorage.getItem('app_teacher');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER;
  });

  // Lessons schedule
  const [lessons, setLessons] = useState(() => {
    const saved = localStorage.getItem('app_lessons');
    return saved ? JSON.parse(saved) : INITIAL_LESSONS;
  });

  // Monthly completed hours record for Forma-2
  const [monthlyHours, setMonthlyHours] = useState(() => {
    const saved = localStorage.getItem('app_monthly_hours');
    return saved ? JSON.parse(saved) : INITIAL_MONTHLY_HOURS;
  });

  // Selected Month for Forma-2 (default: 2026-09)
  const [forma2MonthYear, setForma2MonthYear] = useState('2026-09');

  // Tasks, Targets, Topics
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('app_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  
  const [targets, setTargets] = useState(() => {
    const saved = localStorage.getItem('app_targets');
    return saved ? JSON.parse(saved) : INITIAL_TARGETS;
  });

  const [quickTopics, setQuickTopics] = useState(() => {
    const saved = localStorage.getItem('app_topics');
    return saved ? JSON.parse(saved) : INITIAL_QUICK_TOPICS;
  });

  // Calendar events
  const [calendarEvents, setCalendarEvents] = useState(() => {
    const saved = localStorage.getItem('app_calendar_events');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  // Settings
  const [notificationTime, setNotificationTime] = useState(() => localStorage.getItem('app_notif_time') || '07:30');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app_teacher', JSON.stringify(teacher));
  }, [teacher]);

  useEffect(() => {
    localStorage.setItem('app_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('app_monthly_hours', JSON.stringify(monthlyHours));
  }, [monthlyHours]);

  useEffect(() => {
    localStorage.setItem('app_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('app_targets', JSON.stringify(targets));
  }, [targets]);

  useEffect(() => {
    localStorage.setItem('app_topics', JSON.stringify(quickTopics));
  }, [quickTopics]);

  useEffect(() => {
    localStorage.setItem('app_calendar_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem('app_notif_time', notificationTime);
  }, [notificationTime]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const addCalendarEvent = (newEvent) => {
    const event = {
      id: 'ce_' + Date.now(),
      ...newEvent
    };
    setCalendarEvents(prev => [...prev, event]);
  };

  const deleteCalendarEvent = (id) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  // Reset Data helper
  const resetAllData = () => {
    if (window.confirm("Barcha ma'lumotlarni boshlang'ich holatga qaytarishni tasdiqlaysizmi?")) {
      localStorage.clear();
      setTeacher(INITIAL_TEACHER);
      setLessons(INITIAL_LESSONS);
      setMonthlyHours(INITIAL_MONTHLY_HOURS);
      setTasks(INITIAL_TASKS);
      setTargets(INITIAL_TARGETS);
      setQuickTopics(INITIAL_QUICK_TOPICS);
      setCalendarEvents(INITIAL_CALENDAR_EVENTS);
      setNotificationTime('07:30');
      setTheme('dark');
    }
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      teacher,
      setTeacher,
      lessons,
      setLessons,
      monthlyHours,
      setMonthlyHours,
      forma2MonthYear,
      setForma2MonthYear,
      tasks,
      setTasks,
      targets,
      setTargets,
      quickTopics,
      setQuickTopics,
      calendarEvents,
      setCalendarEvents,
      addCalendarEvent,
      deleteCalendarEvent,
      notificationTime,
      setNotificationTime,
      drawerOpen,
      setDrawerOpen,
      resetAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
