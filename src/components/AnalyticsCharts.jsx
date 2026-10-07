import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { formatCurrency, formatMonthYear } from '../utils';
import { getAnalyticsCategories, getAnalyticsTrends, getAnalyticsTypes } from '../api/analytics';

const AnalyticsCharts = ({ expenses }) => {
  const categoryChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const typeChartRef = useRef(null);

  const categoryChartInstance = useRef(null);
  const trendChartInstance = useRef(null);
  const typeChartInstance = useRef(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAndRenderCharts = async () => {
      setLoading(true);
      try {
        const [categoriesRes, trendsRes, typesRes] = await Promise.all([
          getAnalyticsCategories(),
          getAnalyticsTrends(),
          getAnalyticsTypes()
        ]);
        
        if (!isMounted) return;

        // Make Chart.js inherit the app's dynamic text color hierarchy
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#666';
        Chart.defaults.color = textColor;

        // 1. Category Chart
        if (categoryChartInstance.current) categoryChartInstance.current.destroy();
        
        const categoryMap = {};
        (expenses || []).forEach(exp => {
          const type = exp.type || 'Expense';
          if (type.toLowerCase() === 'expense') {
            const cat = exp.category || 'Uncategorized';
            categoryMap[cat] = (categoryMap[cat] || 0) + Number(exp.amount || 0);
          }
        });
        
        const cats = Object.keys(categoryMap)
          .map(cat => ({ category: cat, amount: categoryMap[cat] }))
          .sort((a, b) => b.amount - a.amount);
        if (!cats.length) {
          categoryChartInstance.current = new Chart(categoryChartRef.current, {
            type: 'doughnut',
            data: { labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#e5e7eb'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '70%' }
          });
        } else {
          const labels = cats.map(c => c.category);
          const data = cats.map(c => c.amount);
          const bg = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#6366f1'];
          categoryChartInstance.current = new Chart(categoryChartRef.current, {
            type: 'doughnut',
            data: { labels, datasets: [{ data, backgroundColor: bg, borderWidth: 1, borderColor: '#ffffff' }] },
            options: {
              responsive: true, maintainAspectRatio: false, cutout: '65%',
              plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, padding: 15 } },
                tooltip: { callbacks: { label: (ctx) => ` ${ctx.label || ''}: ${formatCurrency(ctx.raw || 0)}` } }
              }
            }
          });
        }

        // 2. Trend Chart
        if (trendChartInstance.current) trendChartInstance.current.destroy();
        const trends = trendsRes.trends || [];
        if (!trends.length) {
          trendChartInstance.current = new Chart(trendChartRef.current, {
            type: 'line', data: { labels: ['No Data'], datasets: [{ data: [0], borderColor: '#e5e7eb', borderWidth: 2, pointBackgroundColor: '#e5e7eb' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
          });
        } else {
          const formattedLabels = trends.map(t => formatMonthYear(t.month));
          const data = trends.map(t => t.amount);
          trendChartInstance.current = new Chart(trendChartRef.current, {
            type: 'line',
            data: { labels: formattedLabels, datasets: [{ label: 'Total Spent', data, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 3, tension: 0.3, fill: true, pointBackgroundColor: '#ffffff', pointBorderColor: '#3b82f6', pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6 }] },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${formatCurrency(ctx.raw || 0)}` } } },
              scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { callback: (val) => formatCurrency(val) } } }
            }
          });
        }

        // 3. Types Chart (Replaces Payment Method)
        if (typeChartInstance.current) typeChartInstance.current.destroy();
        const types = typesRes.types || [];
        const hasData = types.some(t => t.amount > 0);
        if (!hasData) {
          typeChartInstance.current = new Chart(typeChartRef.current, {
            type: 'pie', data: { labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#e5e7eb'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '0%' }
          });
        } else {
          const labels = types.map(t => t.type);
          const data = types.map(t => t.amount);
          const bg = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b']; // Income(Green), Expense(Red), Savings(Blue), Investment(Yellow)
          typeChartInstance.current = new Chart(typeChartRef.current, {
            type: 'pie',
            data: { labels, datasets: [{ data, backgroundColor: bg, borderWidth: 1, borderColor: '#ffffff' }] },
            options: {
              responsive: true, maintainAspectRatio: false, cutout: '0%',
              plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 15 } }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.label || ''}: ${formatCurrency(ctx.raw || 0)}` } } }
            }
          });
        }
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchAndRenderCharts();
    
    return () => {
      isMounted = false;
      if (categoryChartInstance.current) categoryChartInstance.current.destroy();
      if (trendChartInstance.current) trendChartInstance.current.destroy();
      if (typeChartInstance.current) typeChartInstance.current.destroy();
    };
  }, [expenses]);

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
            <div className="chart-canvas-wrapper"><canvas ref={categoryChartRef}></canvas></div>
          </div>
          <div className="chart-box">
            <h3 className="chart-title">Monthly Spending Trend</h3>
            <div className="chart-canvas-wrapper"><canvas ref={trendChartRef}></canvas></div>
          </div>
          <div className="chart-box">
            <h3 className="chart-title">Transaction Types</h3>
            <div className="chart-canvas-wrapper"><canvas ref={typeChartRef}></canvas></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;
