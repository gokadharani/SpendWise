import React from 'react';
import { createPortal } from 'react-dom';
import Header from './components/Header';
import DashboardStats from './components/DashboardStats';

const App = () => {
  const dashboardRoot = document.getElementById('react-dashboard-root');

  return (
    <>
      <Header />
      {dashboardRoot && createPortal(<DashboardStats />, dashboardRoot)}
    </>
  );
};

export default App;
