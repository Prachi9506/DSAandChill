import { useState } from 'react';
import ProblemTracker from './components/ProblemTracker';
import NotesOrganizer from './components/NotesOrganizer';
import RoadmapPlanner from './components/RoadmapPlanner';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('problems');

  const navigation = [
    { id: 'problems', label: 'Problems', icon: '📝' },
    { id: 'notes', label: 'Notes', icon: '📖' },
    { id: 'roadmaps', label: 'Roadmaps', icon: '🗺️' }
  ];

  const renderView = () => {
    switch (currentView) {
      case 'problems':
        return <ProblemTracker />;
      case 'notes':
        return <NotesOrganizer />;
      case 'roadmaps':
        return <RoadmapPlanner />;
      default:
        return <ProblemTracker />;
    }
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1 className="app-title">DSAandChill</h1>
          <p className="app-tagline">Every time I write nested loops, somewhere a TLE monster laughs at me🐲</p>
        </div>
        <ul className="nav-list">
          {navigation.map(item => (
            <li key={item.id}>
              <button
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setCurrentView(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;

