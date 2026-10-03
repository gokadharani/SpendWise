import React from 'react';

const MobileNavigation = ({ activeView, setActiveView }) => {
  return (
    <nav className="mobile-bottom-nav">
      <button className={`nav-item ${activeView === 'home' ? 'active' : ''}`} onClick={() => setActiveView('home')}>
        <i className="fa-solid fa-house"></i>
        <span>Home</span>
      </button>
      <button className={`nav-item ${activeView === 'history' ? 'active' : ''}`} onClick={() => setActiveView('history')}>
        <i className="fa-solid fa-list"></i>
        <span>History</span>
      </button>
      <button className={`nav-item ${activeView === 'add' ? 'active' : ''}`} onClick={() => setActiveView('add')}>
        <div className="nav-fab">
          <i className="fa-solid fa-plus"></i>
        </div>
      </button>
      <button className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`} onClick={() => setActiveView('analytics')}>
        <i className="fa-solid fa-chart-pie"></i>
        <span>Analytics</span>
      </button>
      <button className={`nav-item ${activeView === 'settings' ? 'active' : ''}`} onClick={() => setActiveView('settings')}>
        <i className="fa-solid fa-gear"></i>
        <span>Settings</span>
      </button>
    </nav>
  );
};

export default MobileNavigation;
