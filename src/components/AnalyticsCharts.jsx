import React, { useEffect, useState, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { Doughnut, Line, Pie } from 'react-chartjs-2';
import { formatCurrency, formatMonthYear } from '../utils';
import { getAnalyticsTrends, getAnalyticsTypes } from '../api/analytics';

const AnalyticsCharts = ({ expenses }) => {
  const [trends, setTrends] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Make Chart.js inherit the app's dynamic text color hierarchy
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#666';
    Chart.defaults.color = textColor;
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAndRenderCharts = async () => {
      setLoading(true);
      try {
        const [trendsRes, typesRes] = await Promise.all([
          getAnalyticsTrends().catch(() => ({ trends: [] })),
          getAnalyticsTypes().catch(() => ({ types: [] }))
        ]);
        
        if (!isMounted) return;

        setTrends(trendsRes?.trends || []);
        setTypes(typesRes?.types || []);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchAndRenderCharts();
    
    return () => {
      isMounted = false;
    };
  }, [expenses]);

  // 1. Category Chart Data (calculated locally from expenses)
  const categoryData = useMemo(() => {
    const categoryMap = {};
    (expenses || []).forEach(exp => {
      const type = exp.type || 'Expense';
      if (type.toLowerCase() === 'expense') {
        const cat = exp.category || 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(exp.amount || 0);
      }
    });
    
    return Object.keys(categoryMap)
      .map(cat => ({ category: cat, amount: categoryMap[cat] }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const hasCategoryData = categoryData.length > 0;
  const categoryLabels = hasCategoryData ? categoryData.map(c => c.category) : ['No Data'];
  const categoryValues = hasCategoryData ? categoryData.map(c => c.amount) : [1];
  const categoryBg = hasCategoryData 
    ? ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#6366f1'] 
    : ['#e5e7eb'];

  const doughnutData = {
    labels: categoryLabels,
    datasets: [{
      data: categoryValues,
      backgroundColor: categoryBg,
      borderWidth: hasCategoryData ? 1 : 0,
      borderColor: hasCategoryData ? '#ffffff' : 'transparent'
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: hasCategoryData ? '65%' : '70%',
    plugins: {
      legend: { 
        display: hasCategoryData, 
        position: 'right', 
        labels: { boxWidth: 12, padding: 15 } 
      },
      tooltip: { 
        enabled: hasCategoryData,
        callbacks: { label: (ctx) => ` ${ctx.label || ''}: ${formatCurrency(ctx.raw || 0)}` } 
      }
    }
  };

  // 2. Trend Chart Data
  const hasTrendData = trends.length > 0;
  const trendLabels = hasTrendData ? trends.map(t => formatMonthYear(t.month)) : ['No Data'];
  const trendValues = hasTrendData ? trends.map(t => t.amount) : [0];

  const lineData = {
    labels: trendLabels,
    datasets: [{
      label: 'Total Spent',
      data: trendValues,
      borderColor: hasTrendData ? '#3b82f6' : '#e5e7eb',
      backgroundColor: hasTrendData ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      borderWidth: hasTrendData ? 3 : 2,
      tension: 0.3,
      fill: hasTrendData,
      pointBackgroundColor: hasTrendData ? '#ffffff' : '#e5e7eb',
      pointBorderColor: hasTrendData ? '#3b82f6' : 'transparent',
      pointBorderWidth: hasTrendData ? 2 : 0,
      pointRadius: hasTrendData ? 4 : 0,
      pointHoverRadius: hasTrendData ? 6 : 0
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }, 
      tooltip: { 
        enabled: hasTrendData,
        callbacks: { label: (ctx) => ` ${formatCurrency(ctx.raw || 0)}` } 
      } 
    },
    scales: { 
      x: { display: hasTrendData, grid: { display: false } }, 
      y: { display: hasTrendData, beginAtZero: true, ticks: { callback: (val) => formatCurrency(val) } } 
    }
  };

  // 3. Types Chart Data
  const hasTypeData = types.some(t => t.amount > 0);
  const typeLabels = hasTypeData ? types.map(t => t.type) : ['No Data'];
  const typeValues = hasTypeData ? types.map(t => t.amount) : [1];
  const typeBg = hasTypeData ? ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'] : ['#e5e7eb']; // Income, Expense, Savings, Investment

  const pieData = {
    labels: typeLabels,
    datasets: [{
      data: typeValues,
      backgroundColor: typeBg,
      borderWidth: hasTypeData ? 1 : 0,
      borderColor: hasTypeData ? '#ffffff' : 'transparent'
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '0%',
    plugins: { 
      legend: { 
        display: hasTypeData, 
        position: 'right', 
        labels: { boxWidth: 12, padding: 15 } 
      }, 
      tooltip: { 
        enabled: hasTypeData,
        callbacks: { label: (ctx) => ` ${ctx.label || ''}: ${formatCurrency(ctx.raw || 0)}` } 
      } 
    }
  };

  return (
    <div className="card charts-card">
      <div className="charts-header">
        <div>
          <h2 className="card-title"><i className="fa-solid fa-chart-simple"></i> Spending Analytics</h2>
          <p className="card-subtitle">Visual representation of your financial habits</p>
        </div>
      </div>
      
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
           Loading analytics data...
        </div>
      ) : (
        <div className="charts-grid">
          <div className="chart-box">
            <h3 className="chart-title">Breakdown by Category</h3>
            <div className="chart-canvas-wrapper"><Doughnut data={doughnutData} options={doughnutOptions} /></div>
          </div>
          <div className="chart-box">
            <h3 className="chart-title">Monthly Spending Trend</h3>
            <div className="chart-canvas-wrapper"><Line data={lineData} options={lineOptions} /></div>
          </div>
          <div className="chart-box">
            <h3 className="chart-title">Transaction Types</h3>
            <div className="chart-canvas-wrapper"><Pie data={pieData} options={pieOptions} /></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;
