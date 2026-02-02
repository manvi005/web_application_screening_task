import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Upload from './components/Upload';
import Dashboard from './components/Dashboard';
import api from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, LogOut, Clock, Plus, Database, ChevronRight } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);

  useEffect(() => {
    // Check if we have a token (simple persist check)
    if (localStorage.getItem('authToken')) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDatasets();
    }
  }, [isAuthenticated]);

  const loadDatasets = async () => {
    try {
      const res = await api.get('datasets/');
      setDatasets(res.data);
      if (res.data.length > 0 && !selectedDatasetId) {
        setSelectedDatasetId(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
      // If 401, logout
      if (e.response && e.response.status === 401) handleLogout();
    }
  };

  const handleLogin = (username, password) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setDatasets([]);
  }

  const handleUploadSuccess = () => {
    loadDatasets();
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-200 overflow-hidden font-sans">

      {/* Sidebar - Glass Effect */}
      <aside className="w-80 flex-shrink-0 border-r border-white/5 bg-slate-900/40 backdrop-blur-xl flex flex-col h-full relative z-20">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Database className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">ChemViz</h1>
              <span className="text-xs text-slate-500 font-medium tracking-wider">ANALYTICS SUITE</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          {/* Upload Section */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Data Import</h3>
            <Upload onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* History Section */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 flex items-center justify-between">
              Recent Datasets
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">{datasets.length}</span>
            </h3>
            <div className="space-y-1">
              <AnimatePresence>
                {datasets.map((d, i) => (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={d.id}
                    onClick={() => setSelectedDatasetId(d.id)}
                    className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border border-transparent
                                ${selectedDatasetId === d.id
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-lg shadow-cyan-900/20'
                        : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${selectedDatasetId === d.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate">Dataset #{d.id}</p>
                      <p className="text-[10px] opacity-60 truncate">{new Date(d.uploaded_at).toLocaleString()}</p>
                    </div>
                    {selectedDatasetId === d.id && (
                      <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
              {datasets.length === 0 && (
                <div className="text-center p-6 border-2 border-dashed border-slate-800 rounded-xl text-slate-600 text-sm">
                  No history found
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-slate-900/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 z-10 relative bg-slate-900/20 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-cyan-500" />
            Dashboard
          </h2>
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm text-slate-400 font-medium">System Online</span>
          </div>
        </header>

        <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-6xl mx-auto pb-10">
            <Dashboard datasetId={selectedDatasetId} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
