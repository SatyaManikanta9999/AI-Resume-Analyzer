import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Trash2, FileText, Plus, Search } from 'lucide-react';
import ScoreRing from '../components/ScoreRing';

const API_URL = import.meta.env.VITE_API_URL;

interface Analysis {
  _id: string;
  jobTitle: string;
  overallScore: number;
  matchScore: number;
  createdAt: string;
  resumeId: { fileName: string };
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filtered, setFiltered] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/analysis`).then(r => {
      setAnalyses(r.data);
      setFiltered(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(analyses.filter(a =>
      a.jobTitle.toLowerCase().includes(q) ||
      a.resumeId?.fileName?.toLowerCase().includes(q)
    ));
  }, [search, analyses]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await axios.delete(`${API_URL}/api/analysis/${id}`);
    setAnalyses(prev => prev.filter(a => a._id !== id));
    setDeleting(null);
  };

  const scoreLabel = (s: number) =>
    s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Average' : 'Needs Work';

  const scoreClass = (s: number) =>
    s >= 80 ? 'text-emerald-400 bg-emerald-500/10' :
    s >= 60 ? 'text-brand-400 bg-brand-500/10' :
    s >= 40 ? 'text-amber-400 bg-amber-500/10' :
    'text-rose-400 bg-rose-500/10';

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <h2 className="font-display font-bold text-3xl text-white">Analysis History</h2>
          <p className="text-slate-400 mt-1">{analyses.length} analyses total</p>
        </div>
        <Link to="/analyze" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Analysis
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 animate-slide-up">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by job title or resume..."
          className="input-field w-full pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FileText size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">
            {search ? 'No results found' : 'No analyses yet'}
          </p>
          {!search && (
            <Link to="/analyze" className="btn-primary inline-flex items-center gap-2 mt-4">
              <Plus size={16} /> Start Analyzing
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div
              key={a._id}
              className="glass-card p-5 flex items-center gap-4 hover:border-white/10 transition-all duration-200 animate-fade-in group"
            >
              <ScoreRing score={a.overallScore} size={72} strokeWidth={6} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-semibold text-white">{a.jobTitle}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${scoreClass(a.overallScore)}`}>
                    {scoreLabel(a.overallScore)}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-0.5 truncate">
                  {a.resumeId?.fileName}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-slate-500">
                    {new Date(a.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-500">Match: {a.matchScore}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(a._id)}
                  disabled={deleting === a._id}
                  className="p-2 text-slate-600 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                >
                  <Trash2 size={16} />
                </button>
                <Link
                  to={`/analysis/${a._id}`}
                  className="p-2 text-slate-600 hover:text-brand-400 transition-colors rounded-lg hover:bg-brand-500/10 group-hover:text-brand-400"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
