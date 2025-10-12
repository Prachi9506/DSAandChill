import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalProblems: 0,
    solved: 0,
    pending: 0,
    toRevise: 0,
    totalNotes: 0,
    totalRoadmaps: 0,
    solvedToday: 0,
    weeklyProgress: []
  });

  useEffect(() => {
    const problems = storage.get('PROBLEMS');
    const notes = storage.get('NOTES');
    const roadmaps = storage.get('ROADMAPS');
    const dailyLogs = storage.get('DAILY_LOGS');

    const today = new Date().toDateString();
    const todayLog = dailyLogs.find(log => log.date === today);

    const lastWeek = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const log = dailyLogs.find(l => l.date === dateStr);
      lastWeek.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: log ? log.problemsSolved : 0
      });
    }

    setStats({
      totalProblems: problems.length,
      solved: problems.filter(p => p.status === 'solved').length,
      pending: problems.filter(p => p.status === 'todo').length,
      toRevise: problems.filter(p => p.status === 'revise').length,
      totalNotes: notes.length,
      totalRoadmaps: roadmaps.length,
      solvedToday: todayLog ? todayLog.problemsSolved : 0,
      weeklyProgress: lastWeek
    });
  }, []);

  const maxWeekly = Math.max(...stats.weeklyProgress.map(d => d.count), 1);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>DSA Practice Dashboard</h1>
        <p className="subtitle">Track your progress and stay consistent</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.solved}</div>
            <div className="stat-label">Problems Solved</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">↻</div>
          <div className="stat-content">
            <div className="stat-value">{stats.toRevise}</div>
            <div className="stat-label">To Revise</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.solvedToday}</div>
            <div className="stat-label">Solved Today</div>
          </div>
        </div>
      </div>

      <div className="weekly-progress">
        <h2>Weekly Progress</h2>
        <div className="chart">
          {stats.weeklyProgress.map((day, index) => (
            <div key={index} className="chart-bar">
              <div
                className="bar-fill"
                style={{ height: `${(day.count / maxWeekly) * 100}%` }}
              >
                <span className="bar-value">{day.count}</span>
              </div>
              <div className="bar-label">{day.date}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <button className="action-btn primary" onClick={() => onNavigate('problems')}>
          <span className="btn-icon">📝</span>
          <span>Problem Tracker</span>
        </button>
        <button className="action-btn secondary" onClick={() => onNavigate('notes')}>
          <span className="btn-icon">📖</span>
          <span>Notes</span>
        </button>
        <button className="action-btn tertiary" onClick={() => onNavigate('roadmaps')}>
          <span className="btn-icon">🗺️</span>
          <span>Roadmaps</span>
        </button>
        <button className="action-btn quaternary" onClick={() => onNavigate('logs')}>
          <span className="btn-icon">📊</span>
          <span>Daily Logs</span>
        </button>
      </div>
    </div>
  );
}
