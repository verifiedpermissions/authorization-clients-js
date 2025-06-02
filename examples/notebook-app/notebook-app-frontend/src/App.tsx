import { useAuth } from 'react-oidc-context';
import Spinner from "./components/spinner";
import { Route, Routes } from "react-router";
import Notebook from "./routes/notebook";
import Notebooks from "./routes/notebooks";
import Note from "./routes/note";
import { NotebooksProvider, useNotebooks } from "./state/appState";
import React, { useState, useEffect } from 'react';
import './App.css';

function CreateNotebookModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createNotebook } = useNotebooks();

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setContent('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await createNotebook(name, content);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Notebook</h2>
        <div className="form-group">
          <label htmlFor="notebook-name">Name</label>
          <input
            id="notebook-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete='off'
          />
        </div>
        <div className="form-group">
          <label htmlFor="notebook-content">Content</label>
          <textarea
            id="notebook-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            autoComplete='off'
          />
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Notebook'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const auth = useAuth();

  return (
    <div>
      <nav>
        {auth.user?.profile.email}
      </nav>
      <Routes>
        <Route path={'/'} element={<Notebooks />} />
        <Route path={'/notebooks/:notebookId'} element={<Notebook />} />
      </Routes>
      
      {
        !!auth.user && (
            <>
                <button 
                    className="floating-action-button"
                    onClick={() => setIsModalOpen(true)}
                >
                    +
                </button>
                
                <CreateNotebookModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                />
            </>
        )
      }
    </div>
  );
}

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <Spinner
        type={'dual'}
        size={80}
        fullScreen
        thickness={3}
        color={'#2ecc71'}
      />
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div>
        <button onClick={() => auth.signinRedirect()}>Sign in</button>
      </div>
    );
  }

  return (
    <NotebooksProvider>
      <AppContent />
    </NotebooksProvider>
  )
}

export default App;