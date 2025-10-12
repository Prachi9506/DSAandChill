import { useState, useEffect } from 'react';
import { storage, generateId } from '../utils/storage';

export default function NotesOrganizer() {
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [expandedNotes, setExpandedNotes] = useState({});
  const [folderName, setFolderName] = useState('');
  const [noteFormData, setNoteFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const foldersData = storage.get('NOTE_FOLDERS');
    const notesData = storage.get('NOTES');
    setFolders(foldersData);
    setNotes(notesData);
  };

  const handleAddFolder = (e) => {
    e.preventDefault();
    if (editingFolderId) {
      const updated = folders.map(f =>
        f.id === editingFolderId ? { ...f, name: folderName, updatedAt: new Date().toISOString() } : f
      );
      storage.set('NOTE_FOLDERS', updated);
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
      storage.set('NOTE_FOLDERS', updated);
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
    if (window.confirm('Delete this folder and all its notes?')) {
      const updatedFolders = folders.filter(f => f.id !== folderId);
      const updatedNotes = notes.filter(n => n.folderId !== folderId);
      storage.set('NOTE_FOLDERS', updatedFolders);
      storage.set('NOTES', updatedNotes);
      setFolders(updatedFolders);
      setNotes(updatedNotes);
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!selectedFolder) {
      alert('Please select a folder first');
      return;
    }

    if (editingNoteId) {
      const updated = notes.map(n =>
        n.id === editingNoteId ? { ...noteFormData, id: editingNoteId, folderId: selectedFolder, updatedAt: new Date().toISOString() } : n
      );
      storage.set('NOTES', updated);
      setNotes(updated);
      setEditingNoteId(null);
    } else {
      const newNote = {
        ...noteFormData,
        id: generateId(),
        folderId: selectedFolder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [...notes, newNote];
      storage.set('NOTES', updated);
      setNotes(updated);
    }

    setNoteFormData({ title: '', content: '' });
    setShowNoteForm(false);
  };

  const handleEditNote = (note) => {
    setNoteFormData({ title: note.title, content: note.content });
    setEditingNoteId(note.id);
    setSelectedFolder(note.folderId);
    setShowNoteForm(true);
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Delete this note?')) {
      const updated = notes.filter(n => n.id !== noteId);
      storage.set('NOTES', updated);
      setNotes(updated);
    }
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const toggleNote = (noteId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  const getFolderNotes = (folderId) => {
    return notes.filter(n => n.folderId === folderId);
  };

  return (
    <div className="notes-organizer">
      <div className="section-header">
        <h1>Notes</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowFolderForm(!showFolderForm)}>
            {showFolderForm ? 'Cancel' : '+ New Folder'}
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowNoteForm(!showNoteForm)}
            disabled={!selectedFolder && !showNoteForm}
          >
            {showNoteForm ? 'Cancel' : '+ New Note'}
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
              placeholder="e.g., Arrays, Trees, Dynamic Programming"
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

      {showNoteForm && (
        <form onSubmit={handleAddNote} className="note-form">
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
          <div className="form-group">
            <label>Note Title *</label>
            <input
              type="text"
              value={noteFormData.title}
              onChange={(e) => setNoteFormData({ ...noteFormData, title: e.target.value })}
              placeholder="e.g., Binary Search Template"
              required
            />
          </div>
          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={noteFormData.content}
              onChange={(e) => setNoteFormData({ ...noteFormData, content: e.target.value })}
              rows="12"
              placeholder="Write your notes here..."
              className="code-textarea"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingNoteId ? 'Update Note' : 'Add Note'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => {
              setShowNoteForm(false);
              setNoteFormData({ title: '', content: '' });
              setEditingNoteId(null);
            }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="folders-list">
        {folders.length === 0 ? (
          <div className="empty-state">
            <p>No folders yet. Create a folder to organize your notes!</p>
          </div>
        ) : (
          folders.map(folder => {
            const folderNotes = getFolderNotes(folder.id);
            const isExpanded = expandedFolders[folder.id];

            return (
              <div key={folder.id} className="folder-item">
                <div className="folder-header">
                  <div className="folder-title-row" onClick={() => toggleFolder(folder.id)}>
                    <span className="folder-icon">{isExpanded ? '📂' : '📁'}</span>
                    <h3>{folder.name}</h3>
                    <span className="folder-count">({folderNotes.length})</span>
                  </div>
                  <div className="folder-actions">
                    <button onClick={() => {
                      setSelectedFolder(folder.id);
                      setShowNoteForm(true);
                    }} className="btn-icon">+ Note</button>
                    <button onClick={() => handleEditFolder(folder)} className="btn-icon">Edit</button>
                    <button onClick={() => handleDeleteFolder(folder.id)} className="btn-icon danger">Delete</button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="folder-notes">
                    {folderNotes.length === 0 ? (
                      <p className="empty-folder">No notes in this folder</p>
                    ) : (
                      folderNotes.map(note => {
                        const isNoteExpanded = expandedNotes[note.id];
                        return (
                          <div key={note.id} className="note-item">
                            <div className="note-item-header" onClick={() => toggleNote(note.id)}>
                              <span className="expand-icon">{isNoteExpanded ? '▼' : '▶'}</span>
                              <h4>{note.title}</h4>
                            </div>
                            {isNoteExpanded && (
                              <div className="note-item-content">
                                <pre>{note.content}</pre>
                                <div className="note-item-footer">
                                  <span className="note-date">
                                    Updated: {new Date(note.updatedAt).toLocaleDateString()}
                                  </span>
                                  <div className="note-item-actions">
                                    <button onClick={() => handleEditNote(note)} className="btn-icon">Edit</button>
                                    <button onClick={() => handleDeleteNote(note.id)} className="btn-icon danger">Delete</button>
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
