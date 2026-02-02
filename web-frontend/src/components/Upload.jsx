import React, { useState, useRef } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

function Upload({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, success, error
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (e.dataTransfer.files[0].type === "text/csv" || e.dataTransfer.files[0].name.endsWith('.csv')) {
                setFile(e.dataTransfer.files[0]);
                setStatus('idle');
            } else {
                setStatus('error');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('datasets/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setStatus('success');
            onUploadSuccess();
            setTimeout(() => {
                setFile(null);
                setStatus('idle');
            }, 3000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        setStatus('idle');
        if (inputRef.current) inputRef.current.value = "";
    }

    return (
        <div className="w-full">
            <AnimatePresence mode='wait'>
                {!file ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`relative group cursor-pointer flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition-all duration-300
                    ${dragActive ? 'border-cyan-400 bg-cyan-400/10' : 'border-slate-600 hover:border-slate-400 hover:bg-slate-700/30'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            onChange={handleFileChange}
                            accept=".csv"
                            className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <div className={`p-3 rounded-full mb-2 transition-colors ${dragActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-slate-200'}`}>
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <p className="text-sm text-slate-400 font-medium">
                                <span className="text-cyan-400 font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-500 mt-1">CSV files only</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full bg-slate-800/50 rounded-xl border border-slate-600 p-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            {!loading && (
                                <button onClick={removeFile} className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {status === 'idle' && (
                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? 'Analyzing...' : 'Analyze Dataset'}
                            </button>
                        )}

                        {loading && (
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-cyan-400"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                            </div>
                        )}

                        {status === 'success' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-green-400 text-sm font-medium bg-green-500/10 py-2 rounded-lg border border-green-500/20">
                                <CheckCircle className="w-4 h-4" />
                                Analysis Complete
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-red-400 text-sm font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                                <AlertCircle className="w-4 h-4" />
                                Upload Failed
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Upload;
