// src/components/MessMenuSection.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuThunk, updateMenuThunk, resetMenuThunk } from '../redux/meal/mealSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';
import { getDateString } from '../utils/dateUtils';

const MessMenuSection = () => {
  const dispatch = useDispatch();
  const menuStore = useSelector((state) => state.meal.menuStore) || {};
  const loading = useSelector((state) => state.meal.loading);

  const [activeDay, setActiveDay] = useState(0);

  // Textarea values state
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [snacks, setSnacks] = useState('');
  const [dinner, setDinner] = useState('');

  const DAY_NAMES = ['Default', 'Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  useEffect(() => {
    dispatch(fetchMenuThunk());
  }, [dispatch]);

  // Determine active dateStr and menu details
  const activeDateStr = activeDay === 0 ? null : getDateString(activeDay - 1);
  const activeKey = activeDateStr || 'default';

  // Load menu into textareas when menuStore or activeDay changes
  useEffect(() => {
    const defaultMenu = menuStore.default || { breakfast: '', lunch: '', snacks: '', dinner: '' };
    const customMenu = activeDateStr ? menuStore[activeDateStr] : null;
    const activeMenu = customMenu || defaultMenu;

    setBreakfast(activeMenu.breakfast || '');
    setLunch(activeMenu.lunch || '');
    setSnacks(activeMenu.snacks || '');
    setDinner(activeMenu.dinner || '');
  }, [menuStore, activeDay, activeDateStr]);

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const menuData = {
      breakfast,
      lunch,
      snacks,
      dinner
    };

    dispatch(updateMenuThunk({ key: activeKey, menu: menuData })).then((res) => {
      if (!res.error) {
        dispatch(addToast({
          message: activeDay === 0 ? 'Default menu updated!' : `${DAY_NAMES[activeDay]} menu override saved!`,
          type: 'success'
        }));
      } else {
        dispatch(addToast({ message: res.payload || 'Failed to save menu.', type: 'error' }));
      }
    });
  };

  const handleResetDay = () => {
    if (activeDay === 0) return;

    dispatch(updateMenuThunk({ key: activeDateStr, menu: null })).then((res) => {
      if (!res.error) {
        dispatch(addToast({ message: 'Menu reset to default.', type: 'success' }));
      } else {
        dispatch(addToast({ message: res.payload || 'Failed to reset menu.', type: 'error' }));
      }
    });
  };

  return (
    <div className="dashboard-panel dashboard-full">
      <div className="panel-header" style={{ marginBottom: 0 }}>
        <h2 className="panel-title">{ICONS.coffee} 7-Day Mess Menu Planner</h2>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Set a default menu, then override specific days</span>
      </div>

      <div className="menu-day-tabs-row">
        {DAY_NAMES.map((name, idx) => {
          const dateStr = idx === 0 ? null : getDateString(idx - 1);
          const overrideExists = idx > 0 && !!menuStore[dateStr];
          const shortDate = dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
          
          return (
            <button 
              key={idx}
              type="button"
              className={`menu-day-tab ${activeDay === idx ? 'active' : ''}`}
              onClick={() => setActiveDay(idx)}
            >
              {name}
              {shortDate && <span style={{ display: 'block', fontSize: '9px', opacity: 0.75 }}>{shortDate}</span>}
              {overrideExists && <span className="menu-override-dot" title="Custom menu set"></span>}
            </button>
          );
        })}
      </div>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#1e40af' }}>
        {activeDay === 0 ? (
          <span><strong>Default Menu</strong> — applies to every day that doesn't have a custom override. Any day you leave uncustomised will show this menu.</span>
        ) : (
          <span>
            <strong>{DAY_NAMES[activeDay]}</strong> menu{menuStore[activeDateStr] ? (
              <span> · <span style={{ color: '#15803d', fontWeight: 700 }}>Custom override active</span></span>
            ) : (
              ' — currently showing the default menu. Save below to create an override.'
            )}
          </span>
        )}
      </div>

      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <input type="hidden" value={activeKey} />
        
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group-full">
            <label className="form-label" style={{ fontWeight: 700 }}>☀️ Breakfast &nbsp;<span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>07:30 AM – 09:00 AM</span></label>
            <textarea 
              className="form-textarea" 
              style={{ height: '66px' }}
              value={breakfast}
              onChange={(e) => setBreakfast(e.target.value)}
              required
            />
          </div>
          <div className="form-group-full">
            <label className="form-label" style={{ fontWeight: 700 }}>🌤️ Lunch &nbsp;<span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>12:30 PM – 02:00 PM</span></label>
            <textarea 
              className="form-textarea" 
              style={{ height: '66px' }}
              value={lunch}
              onChange={(e) => setLunch(e.target.value)}
              required
            />
          </div>
          <div className="form-group-full">
            <label className="form-label" style={{ fontWeight: 700 }}>🌙 Snacks &nbsp;<span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>04:30 PM – 05:30 PM</span></label>
            <textarea 
              className="form-textarea" 
              style={{ height: '66px' }}
              value={snacks}
              onChange={(e) => setSnacks(e.target.value)}
              required
            />
          </div>
          <div className="form-group-full">
            <label className="form-label" style={{ fontWeight: 700 }}>🌃 Dinner &nbsp;<span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>07:30 PM – 09:00 PM</span></label>
            <textarea 
              className="form-textarea" 
              style={{ height: '66px' }}
              value={dinner}
              onChange={(e) => setDinner(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="submit" className="btn-primary" style={{ padding: '12px 24px', fontWeight: 700 }}>
            {ICONS.check} Save {activeDay === 0 ? 'Default Menu' : DAY_NAMES[activeDay] + ' Menu'}
          </button>
          
          {activeDay > 0 && menuStore[activeDateStr] && (
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ padding: '12px 20px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
              onClick={handleResetDay}
            >
              {ICONS.x} Reset to Default
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessMenuSection;
