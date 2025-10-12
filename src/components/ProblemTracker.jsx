import { useState, useEffect } from 'react';
import { storage, generateId } from '../utils/storage';

export default function ProblemTracker() {
  const [folders, setFolders] = useState([]);
  const [problems, setProblems] = useState([]);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [expandedProblems, setExpandedProblems] = useState({});
  const [folderName, setFolderName] = useState('');
  const [problemFormData, setProblemFormData] = useState({
    title: '',
    link: '',
    platform: 'LeetCode',
    difficulty: 'medium',
    status: 'todo',
    notes: '',
    solution: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const foldersData = storage.get('PROBLEM_FOLDERS');
    const problemsData = storage.get('PROBLEMS');
    setFolders(foldersData);
    setProblems(problemsData);
  };

  const handleAddFolder = (e) => {
    e.preventDefault();
    if (editingFolderId) {
      const updated = folders.map(f =>
        f.id === editingFolderId ? { ...f, name: folderName, updatedAt: new Date().toISOString() } : f
      );
      storage.set('PROBLEM_FOLDERS', updated);
      setFolders(updated);
      setEditingFolderId(null);
    } else {
      const newFolder = {
        id: generateId(),
        name: folderName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [...folders, newFolder];
      storage.set('PROBLEM_FOLDERS', updated);
      setFolders(updated);
    }
    setFolderName('');
    setShowFolderForm(false);
  };

  const handleEditFolder = (folder) => {
    setFolderName(folder.name);
    setEditingFolderId(folder.id);
    setShowFolderForm(true);
  };

  const handleDeleteFolder = (folderId) => {
    if (window.confirm('Delete this folder and all its problems?')) {
      const updatedFolders = folders.filter(f => f.id !== folderId);
      const updatedProblems = problems.filter(p => p.folderId !== folderId);
      storage.set('PROBLEM_FOLDERS', updatedFolders);
      storage.set('PROBLEMS', updatedProblems);
      setFolders(updatedFolders);
      setProblems(updatedProblems);
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
    }
  };

  const handleAddProblem = (e) => {
    e.preventDefault();
    if (!selectedFolder) {
      alert('Please select a folder first');
      return;
    }

    if (editingProblemId) {
      const updated = problems.map(p =>
        p.id === editingProblemId ? { ...problemFormData, id: editingProblemId, folderId: selectedFolder, updatedAt: new Date().toISOString() } : p
      );
      storage.set('PROBLEMS', updated);
      setProblems(updated);
      setEditingProblemId(null);
    } else {
      const newProblem = {
        ...problemFormData,
        id: generateId(),
        folderId: selectedFolder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [...problems, newProblem];
      storage.set('PROBLEMS', updated);
      setProblems(updated);
    }

    setProblemFormData({
      title: '',
      link: '',
      platform: 'LeetCode',
      difficulty: 'medium',
      status: 'todo',
      notes: '',
      solution: ''
    });
    setShowProblemForm(false);
  };

  const handleEditProblem = (problem) => {
    setProblemFormData({
      title: problem.title,
      link: problem.link,
      platform: problem.platform,
      difficulty: problem.difficulty,
      status: problem.status,
      notes: problem.notes,
      solution: problem.solution
    });
    setEditingProblemId(problem.id);
    setSelectedFolder(problem.folderId);
    setShowProblemForm(true);
  };

  const handleDeleteProblem = (problemId) => {
    if (window.confirm('Delete this problem?')) {
      const updated = problems.filter(p => p.id !== problemId);
      storage.set('PROBLEMS', updated);
      setProblems(updated);
    }
  };

  const handleStatusChange = (problemId, newStatus) => {
    const updated = problems.map(p =>
      p.id === problemId ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p
    );
    storage.set('PROBLEMS', updated);
    setProblems(updated);
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const toggleProblem = (problemId) => {
    setExpandedProblems(prev => ({
      ...prev,
      [problemId]: !prev[problemId]
    }));
  };

  const getFolderProblems = (folderId) => {
    return problems.filter(p => p.folderId === folderId);
  };

  const statusColors = {
    todo: 'status-todo',
    solved: 'status-solved',
    revise: 'status-revise'
  };

  const difficultyColors = {
    easy: 'diff-easy',
    medium: 'diff-medium',
    hard: 'diff-hard'
  };

  return (
    <div className="problem-tracker">
      <div className="section-header">
        <h1>Problems</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowFolderForm(!showFolderForm)}>
            {showFolderForm ? 'Cancel' : '+ New Folder'}
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowProblemForm(!showProblemForm)}
            disabled={!selectedFolder && !showProblemForm}
          >
            {showProblemForm ? 'Cancel' : '+ New Problem'}
          </button>
        </div>
      </div>

      {showFolderForm && (
        <form onSubmit={handleAddFolder} className="folder-form">
          <div className="form-group">
            <label>Folder Name *</label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., Arrays, Two Pointers, Sliding Window"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingFolderId ? 'Update Folder' : 'Create Folder'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => {
              setShowFolderForm(false);
              setFolderName('');
              setEditingFolderId(null);
            }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {showProblemForm && (
        <form onSubmit={handleAddProblem} className="problem-form">
          <div className="form-group">
            <label>Select Folder *</label>
            <select
              value={selectedFolder || ''}
              onChange={(e) => setSelectedFolder(e.target.value)}
              required
            >
              <option value="">Choose a folder...</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Problem Title *</label>
              <input
                type="text"
                value={problemFormData.title}
                onChange={(e) => setProblemFormData({ ...problemFormData, title: e.target.value })}
                placeholder="e.g., Two Sum"
                required
              />
            </div>
            <div className="form-group">
              <label>Link</label>
              <input
                type="url"
                value={problemFormData.link}
                onChange={(e) => setProblemFormData({ ...problemFormData, link: e.target.value })}
                placeholder="https://leetcode.com/problems/..."
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Platform</label>
              <select
                value={problemFormData.platform}
                onChange={(e) => setProblemFormData({ ...problemFormData, platform: e.target.value })}
              >
                <option value="LeetCode">LeetCode</option>
                <option value="Codeforces">Codeforces</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
                <option value="HackerRank">HackerRank</option>
                <option value="CodeChef">CodeChef</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={problemFormData.difficulty}
                onChange={(e) => setProblemFormData({ ...problemFormData, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={problemFormData.status}
                onChange={(e) => setProblemFormData({ ...problemFormData, status: e.target.value })}
              >
                <option value="todo">To Do</option>
                <option value="solved">Solved</option>
                <option value="revise">Revise</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={problemFormData.notes}
              onChange={(e) => setProblemFormData({ ...problemFormData, notes: e.target.value })}
              rows="3"
              placeholder="Approach, key insights, or hints..."
            />
          </div>
          <div className="form-group">
            <label>Solution Code</label>
            <textarea
              value={problemFormData.solution}
              onChange={(e) => setProblemFormData({ ...problemFormData, solution: e.target.value })}
              rows="6"
              placeholder="Paste your solution code here..."
              className="code-textarea"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingProblemId ? 'Update Problem' : 'Add Problem'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => {
              setShowProblemForm(false);
              setProblemFormData({
                title: '',
                link: '',
                platform: 'LeetCode',
                difficulty: 'medium',
                status: 'todo',
                notes: '',
                solution: ''
              });
              setEditingProblemId(null);
            }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="folders-list">
        {folders.length === 0 ? (
          <div className="empty-state">
            <p>No folders yet. Create a folder to organize your problems!</p>
          </div>
        ) : (
          folders.map(folder => {
            const folderProblems = getFolderProblems(folder.id);
            const isExpanded = expandedFolders[folder.id];

            return (
              <div key={folder.id} className="folder-item">
                <div className="folder-header">
                  <div className="folder-title-row" onClick={() => toggleFolder(folder.id)}>
                    <span className="folder-icon">{isExpanded ? '📂' : '📁'}</span>
                    <h3>{folder.name}</h3>
                    <span className="folder-count">({folderProblems.length})</span>
                  </div>
                  <div className="folder-actions">
                    <button onClick={() => {
                      setSelectedFolder(folder.id);
                      setShowProblemForm(true);
                    }} className="btn-icon">+ Problem</button>
                    <button onClick={() => handleEditFolder(folder)} className="btn-icon">Edit</button>
                    <button onClick={() => handleDeleteFolder(folder.id)} className="btn-icon danger">Delete</button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="folder-problems">
                    {folderProblems.length === 0 ? (
                      <p className="empty-folder">No problems in this folder</p>
                    ) : (
                      folderProblems.map(problem => {
                        const isProblemExpanded = expandedProblems[problem.id];
                        return (
                          <div key={problem.id} className="problem-item">
                            <div className="problem-item-header" onClick={() => toggleProblem(problem.id)}>
                              <div className="problem-item-title-row">
                                <span className="expand-icon">{isProblemExpanded ? '▼' : '▶'}</span>
                                <h4>{problem.title}</h4>
                              </div>
                              <div className="problem-item-badges">
                                <span className={`badge ${difficultyColors[problem.difficulty]}`}>
                                  {problem.difficulty}
                                </span>
                                <span className={`badge ${statusColors[problem.status]}`}>
                                  {problem.status === 'todo' ? 'To Do' : problem.status === 'solved' ? 'Solved' : 'Revise'}
                                </span>
                              </div>
                            </div>
                            {isProblemExpanded && (
                              <div className="problem-item-content">
                                <div className="problem-item-meta">
                                  <span className="platform">{problem.platform}</span>
                                  {problem.link && (
                                    <a href={problem.link} target="_blank" rel="noopener noreferrer" className="problem-link">
                                      View Problem →
                                    </a>
                                  )}
                                </div>
                                {problem.notes && (
                                  <div className="problem-item-notes">
                                    <strong>Notes:</strong>
                                    <p>{problem.notes}</p>
                                  </div>
                                )}
                                {problem.solution && (
                                  <div className="problem-item-solution">
                                    <strong>Solution:</strong>
                                    <pre><code>{problem.solution}</code></pre>
                                  </div>
                                )}
                                <div className="problem-item-footer">
                                  <select
                                    value={problem.status}
                                    onChange={(e) => handleStatusChange(problem.id, e.target.value)}
                                    className="status-select"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="todo">To Do</option>
                                    <option value="solved">Solved</option>
                                    <option value="revise">Revise</option>
                                  </select>
                                  <div className="problem-item-actions">
                                    <button onClick={() => handleEditProblem(problem)} className="btn-icon">Edit</button>
                                    <button onClick={() => handleDeleteProblem(problem.id)} className="btn-icon danger">Delete</button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
