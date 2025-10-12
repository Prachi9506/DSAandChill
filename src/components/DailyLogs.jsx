import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export default function DailyLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalSolved: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageDaily: 0
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const data = storage.get('DAILY_LOGS');
    const sortedLogs = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setLogs(sortedLogs);
    calculateStats(sortedLogs);
  };

  const calculateStats = (logsData) => {
    if (logsData.length === 0) {
      setStats({ totalSolved: 0, currentStreak: 0, longestStreak: 0, averageDaily: 0 });
      return;
    }

    const totalSolved = logsData.reduce((sum, log) => sum + log.problemsSolved, 0);
    const averageDaily = Math.round(totalSolved / logsData.length);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const sortedByDate = [...logsData].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedByDate.length; i++) {
      const logDate = new Date(sortedByDate[i].date);
      logDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === expectedDate.getTime() && sortedByDate[i].problemsSolved > 0) {
        tempStreak++;
        if (i === 0 || sortedByDate[i - 1]) {
          currentStreak = tempStreak;
        }
      } else {
        break;
      }
    }

    tempStreak = 0;
    for (let i = 0; i < sortedByDate.length; i++) {
      if (sortedByDate[i].problemsSolved > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    setStats({
      totalSolved,
      currentStreak,
      longestStreak,
      averageDaily
    });
  };

  const getMonthData = () => {
    const monthData = {};
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();

      const log = logs.find(l => l.date === dateStr);
      monthData[dateStr] = {
        date: date,
        count: log ? log.problemsSolved : 0
      };
    }

    return Object.values(monthData);
  };

  const monthData = getMonthData();
  const maxCount = Math.max(...monthData.map(d => d.count), 1);

  const getIntensityClass = (count) => {
    if (count === 0) return 'intensity-0';
    if (count <= 2) return 'intensity-1';
    if (count <= 4) return 'intensity-2';
    if (count <= 6) return 'intensity-3';
    return 'intensity-4';
  };

  return (
    <div className="daily-logs">
      <div className="section-header">
        <h1>Daily Practice Logs</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSolved}</div>
            <div className="stat-label">Total Solved</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{stats.longestStreak}</div>
            <div className="stat-label">Longest Streak</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{stats.averageDaily}</div>
            <div className="stat-label">Daily Average</div>
          </div>
        </div>
      </div>

      <div className="activity-heatmap">
        <h2>Last 30 Days Activity</h2>
        <div className="heatmap-grid">
          {monthData.map((day, index) => (
            <div
              key={index}
              className={`heatmap-cell ${getIntensityClass(day.count)}`}
              title={`${day.date.toLocaleDateString()}: ${day.count} problems`}
            >
              <span className="cell-count">{day.count > 0 ? day.count : ''}</span>
            </div>
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-cells">
            <div className="legend-cell intensity-0"></div>
            <div className="legend-cell intensity-1"></div>
            <div className="legend-cell intensity-2"></div>
            <div className="legend-cell intensity-3"></div>
            <div className="legend-cell intensity-4"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="logs-table-container">
        <h2>Daily Log History</h2>
        {logs.length === 0 ? (
          <div className="empty-state">
            <p>No logs yet. Start solving problems to track your progress!</p>
          </div>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Problems Solved</th>
                <th>Day</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const date = new Date(log.date);
                return (
                  <tr key={index}>
                    <td>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="solved-count">{log.problemsSolved}</td>
                    <td>{date.toLocaleDateString('en-US', { weekday: 'long' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
