import { useState, useEffect } from 'react';
import { storage, generateId } from '../utils/storage';

export default function RoadmapPlanner() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topics: []
  });
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = () => {
    const data = storage.get('ROADMAPS');
    setRoadmaps(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.topics.length === 0) {
      alert('Please add at least one topic to the roadmap');
      return;
    }

    if (editingId) {
      const updated = roadmaps.map(r =>
        r.id === editingId ? { ...formData, id: editingId, updatedAt: new Date().toISOString() } : r
      );
      storage.set('ROADMAPS', updated);
      setRoadmaps(updated);
      setEditingId(null);
    } else {
      const newRoadmap = {
        ...formData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [...roadmaps, newRoadmap];
      storage.set('ROADMAPS', updated);
      setRoadmaps(updated);
    }

    resetForm();
  };

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      setFormData({
        ...formData,
        topics: [...formData.topics, { name: newTopic.trim(), completed: false }]
      });
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (index) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter((_, i) => i !== index)
    });
  };

  const handleToggleTopic = (roadmapId, topicIndex) => {
    const updated = roadmaps.map(r => {
      if (r.id === roadmapId) {
        const newTopics = [...r.topics];
        newTopics[topicIndex].completed = !newTopics[topicIndex].completed;
        return { ...r, topics: newTopics, updatedAt: new Date().toISOString() };
      }
      return r;
    });
    storage.set('ROADMAPS', updated);
    setRoadmaps(updated);
  };

  const handleEdit = (roadmap) => {
    setFormData(roadmap);
    setEditingId(roadmap.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this roadmap?')) {
      const updated = roadmaps.filter(r => r.id !== id);
      storage.set('ROADMAPS', updated);
      setRoadmaps(updated);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      topics: []
    });
    setNewTopic('');
    setShowForm(false);
    setEditingId(null);
  };

  const calculateProgress = (topics) => {
    if (topics.length === 0) return 0;
    const completed = topics.filter(t => t.completed).length;
    return Math.round((completed / topics.length) * 100);
  };

  return (
    <div className="roadmap-planner">
      <div className="section-header">
        <h1>Roadmap Planner</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Roadmap'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="roadmap-form">
          <div className="form-group">
            <label>Roadmap Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., 90 Days DSA Challenge"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Describe your learning goals and plan..."
            />
          </div>

          <div className="form-group">
            <label>Topics *</label>
            <div className="topic-input-row">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Add a topic (e.g., Arrays, Binary Search)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
              />
              <button type="button" onClick={handleAddTopic} className="btn-secondary">
                Add Topic
              </button>
            </div>
          </div>

          {formData.topics.length > 0 && (
            <div className="topics-list-form">
              {formData.topics.map((topic, index) => (
                <div key={index} className="topic-item-form">
                  <span>{topic.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(index)}
                    className="btn-icon danger"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Roadmap' : 'Create Roadmap'}
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="roadmaps-list">
        {roadmaps.length === 0 ? (
          <div className="empty-state">
            <p>No roadmaps yet. Create your first learning roadmap!</p>
          </div>
        ) : (
          roadmaps.map(roadmap => {
            const progress = calculateProgress(roadmap.topics);
            return (
              <div key={roadmap.id} className="roadmap-card">
                <div className="roadmap-header">
                  <div>
                    <h2>{roadmap.title}</h2>
                    {roadmap.description && <p className="roadmap-description">{roadmap.description}</p>}
                  </div>
                  <div className="roadmap-actions">
                    <button onClick={() => handleEdit(roadmap)} className="btn-icon">Edit</button>
                    <button onClick={() => handleDelete(roadmap.id)} className="btn-icon danger">Delete</button>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-info">
                    <span className="progress-label">Progress</span>
                    <span className="progress-percentage">{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="progress-stats">
                    {roadmap.topics.filter(t => t.completed).length} of {roadmap.topics.length} topics completed
                  </div>
                </div>

                <div className="topics-checklist">
                  {roadmap.topics.map((topic, index) => (
                    <div
                      key={index}
                      className={`topic-item ${topic.completed ? 'completed' : ''}`}
                      onClick={() => handleToggleTopic(roadmap.id, index)}
                    >
                      <input
                        type="checkbox"
                        checked={topic.completed}
                        onChange={() => {}}
                      />
                      <span className="topic-name">{topic.name}</span>
                      {topic.completed && <span className="check-mark">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
