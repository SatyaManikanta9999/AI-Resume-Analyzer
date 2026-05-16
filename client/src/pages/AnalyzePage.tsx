import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import {
  Upload, FileText, X, Loader2, Sparkles, CheckCircle2, ChevronDown
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface ResumeOption {
  _id: string;
  fileName: string;
  uploadedAt: string;
}

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { axios.get(`${API_URL}/api/resume`).then(r => setResumes(r.data)); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('analysis:start', () => setAnalysisStage('🔍 Scanning resume structure...'));
    socket.on('analysis:complete', ({ analysisId }: any) => {
      setAnalysisStage('✅ Analysis complete! Redirecting...');
      setTimeout(() => navigate(`/analysis/${analysisId}`), 800);
    });
    socket.on('analysis:error', ({ message }: any) => {
      setError(message);
      setAnalyzing(false);
    });
    return () => {
      socket.off('analysis:start');
      socket.off('analysis:complete');
      socket.off('analysis:error');
    };
  }, [socket, navigate]);

  // Auto-upload as soon as a file is dropped / selected
  const uploadFile = useCallback(async (file: File) => {
    setUploadedFile(file);
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const { data } = await axios.post(`${API_URL}/api/resume/upload`, fd);
      setResumes(prev => [data, ...prev]);
      setSelectedResumeId(data._id);
      setUploadedFile(null); // clear preview — resume now appears in the dropdown
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) uploadFile(files[0]);
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!selectedResumeId || !jobTitle.trim() || !jobDescription.trim()) {
      setError('Please select a resume, enter a job title, and paste a job description');
      return;
    }
    setAnalyzing(true);
    setError('');
    setAnalysisStage('🚀 Sending to AI engine...');
    try {
      await axios.post(`${API_URL}/api/analysis/analyze`, {
        resumeId: selectedResumeId,
        jobTitle,
        jobDescription,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed');
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8 animate-slide-up">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">Analyze Resume</h2>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">Upload a resume and match it against a job description</p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Resume */}
        <div className="glass-card p-5 sm:p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-bold font-display">1</div>
            <h3 className="font-display font-semibold text-white">Select Resume</h3>
          </div>

          {/* Existing resumes dropdown */}
          {resumes.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Choose from uploaded resumes</label>
              <div className="relative">
                <select
                  value={selectedResumeId}
                  onChange={e => setSelectedResumeId(e.target.value)}
                  className="input-field w-full appearance-none pr-10"
                >
                  <option value="">Select a resume...</option>
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>{r.fileName}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Divider */}
          {resumes.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-slate-600 text-sm">or upload new</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
          )}

          {/* Dropzone / uploading state */}
          {uploading ? (
            // Show a progress indicator while auto-uploading
            <div className="border border-brand-500/30 bg-brand-500/5 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Loader2 size={20} className="text-brand-400 animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-brand-300 font-medium truncate">{uploadedFile?.name}</p>
                <p className="text-slate-500 text-sm">Uploading…</p>
              </div>
            </div>
          ) : (
            // Normal dropzone
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-brand-500 bg-brand-500/5'
                  : 'border-white/10 hover:border-brand-500/50 hover:bg-white/2'
              }`}
            >
              <input {...getInputProps()} />
              <Upload size={32} className={`mx-auto mb-3 ${isDragActive ? 'text-brand-400' : 'text-slate-600'}`} />
              <p className="text-slate-300 font-medium">
                {isDragActive ? 'Drop it here!' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-slate-600 text-sm mt-1">PDF, DOCX, TXT · Max 5MB</p>
            </div>
          )}

          {/* Selected confirmation */}
          {selectedResumeId && !uploading && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 size={15} />
                Resume selected
              </div>
              <button
                onClick={() => setSelectedResumeId('')}
                className="text-slate-600 hover:text-rose-400 transition-colors"
                title="Clear selection"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Job Details */}
        <div className="glass-card p-5 sm:p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-bold font-display">2</div>
            <h3 className="font-display font-semibold text-white">Job Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Senior React Developer"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">
                Job Description
                <span className="ml-2 text-slate-600">({jobDescription.length} chars)</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={8}
                className="input-field w-full resize-none"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={analyzing || uploading || !selectedResumeId || !jobTitle.trim() || !jobDescription.trim()}
          className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>{analysisStage || 'Analyzing...'}</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Analyze with AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}