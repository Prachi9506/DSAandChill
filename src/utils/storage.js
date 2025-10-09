const STORAGE_KEYS = {
  PROBLEMS: 'dsa_problems',
  PROBLEM_FOLDERS: 'dsa_problem_folders',
  NOTES: 'dsa_notes',
  NOTE_FOLDERS: 'dsa_note_folders',
  ROADMAPS: 'dsa_roadmaps'
};

export const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(STORAGE_KEYS[key]);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  clear(key) {
    try {
      localStorage.removeItem(STORAGE_KEYS[key]);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
