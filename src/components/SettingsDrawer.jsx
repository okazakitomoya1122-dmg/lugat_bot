import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Moon, Sun, Bell, RefreshCw, ShieldAlert } from 'lucide-react';

export const SettingsDrawer = () => {
  const { 
    theme, 
    toggleTheme, 
    drawerOpen, 
    setDrawerOpen, 
    notificationTime, 
    setNotificationTime,
    resetAllData 
  } = useApp();

  if (!drawerOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setDrawerOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="logo-icon-bg" style={{ width: '36px', height: '36px' }}>
              <Bell size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem' }}>Ilova Sozlamalari</h3>
          </div>
          <button className="icon-btn" onClick={() => setDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Theme Toggle */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {theme === 'dark' ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Mavzu Rejimi</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {theme === 'dark' ? "Tungi rejim yoqilgan" : "Kunduzgi rejim yoqilgan"}
                </div>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={toggleTheme}>
              {theme === 'dark' ? "Kunduzgi" : "Tungi"}
            </button>
          </div>

          {/* Notification Time */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label">
              <Bell size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Kunlik Ogohlantirish Vaqti
            </label>
            <input 
              type="time" 
              className="form-input" 
              value={notificationTime}
              onChange={e => setNotificationTime(e.target.value)}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Har kuni ushbu vaqtda darslar jadvalingiz va vazifalaringiz eslatiladi.
            </p>
          </div>

          {/* Reset Data Danger Zone */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px dashed var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--danger)' }}>
              <ShieldAlert size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Boshlang'ich Holatga Qaytish</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Barcha darslar jadvali, Forma-2 va vazifalar ma'lumotlarini o'chirib, noldan boshlash.
            </p>
            <button className="btn btn-danger" style={{ width: '100%' }} onClick={resetAllData}>
              <RefreshCw size={16} />
              <span>Ma'lumotlarni Qayta Tiklash</span>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={() => setDrawerOpen(false)}>
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
