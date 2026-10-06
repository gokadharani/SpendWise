import React from 'react';

const DesktopNavigation = ({ activeView, setActiveView }) => {
  return (
    <aside className="desktop-sidebar">
      <nav className="desktop-nav">
        <button 
          className={`desktop-nav-item ${activeView === 'dashboard' ? 'active' : ''}`} 
          onClick={() => setActiveView('dashboard')}
        >
          <i className="fa-solid fa-house"></i>
          <span>Dashboard</span>
        </button>
        <button 
          className={`desktop-nav-item ${activeView === 'add' ? 'active' : ''}`} 
          onClick={() => setActiveView('add')}
        >
          <i className="fa-solid fa-plus"></i>
          <span>Add Expense</span>
        </button>
        <button 
          className={`desktop-nav-item ${activeView === 'history' ? 'active' : ''}`} 
          onClick={() => setActiveView('history')}
        >
          <i className="fa-solid fa-list"></i>
          <span>Expense History</span>
        </button>
        <button 
          className={`desktop-nav-item ${activeView === 'analytics' ? 'active' : ''}`} 
          onClick={() => setActiveView('analytics')}
        >
          <i className="fa-solid fa-chart-pie"></i>
          <span>Analytics</span>
        </button>
        <button 
          className={`desktop-nav-item ${activeView === 'budget' ? 'active' : ''}`} 
          onClick={() => setActiveView('budget')}
        >
          <i className="fa-solid fa-wallet"></i>
          <span>Budget</span>
        </button>
        <button 
          className={`desktop-nav-item ${activeView === 'settings' ? 'active' : ''}`} 
          onClick={() => setActiveView('settings')}
        >
          <i className="fa-solid fa-gear"></i>
          <span>Settings</span>
        </button>
      </nav>
    </aside>
  );
};

export default DesktopNavigation;
