import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, TrendingUp, Award, ArrowRight, Plus, BarChart2 } from 'lucide-react';
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

export default function Dashboard() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/analysis`).then(r => {
      setAnalyses(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.overallScore, 0) / analyses.length)
    : 0;

  const bestScore = analyses.length ? Math.max(...analyses.map(a => a.overallScore)) : 0;

  const stats = [
    { label: 'Analyses Run', value: analyses.length, icon: BarChart2, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Avg Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Best Score', value: `${bestScore}%`, icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h2 className="font-display font-bold text-3xl text-white">
          Welcome back, {user?.name.split(' ')[0]} 👋
        </h2>
        <p className="text-slate-400 mt-1">Here's an overview of your resume analyses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card p-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">{label}</p>
                <p className={`font-display font-bold text-3xl mt-1 ${color}`}>{value}</p>
              </div>
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={22} className={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="glass-card p-6 mb-8 bg-gradient-to-r from-brand-500/10 to-transparent border-brand-500/20 flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center">
            <FileText size={22} className="text-brand-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white">Ready to analyze a resume?</h3>
            <p className="text-slate-400 text-sm mt-0.5">Upload your resume and match it against any job description</p>
          </div>
        </div>
        <Link to="/analyze" className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> New Analysis
        </Link>
      </div>

      {/* Recent analyses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg text-white">Recent Analyses</h3>
          <Link to="/history" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No analyses yet</p>
            <p className="text-slate-600 text-sm mt-1">Start by uploading a resume and a job description</p>
            <Link to="/analyze" className="btn-primary inline-flex items-center gap-2 mt-4">
              <Plus size={16} /> Start Analyzing
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.slice(0, 5).map((a) => (
              <Link
                key={a._id}
                to={`/analysis/${a._id}`}
                className="glass-card p-4 flex items-center gap-4 hover:border-brand-500/20 transition-all duration-200 hover:bg-surface-700/60 group"
              >
                <ScoreRing score={a.overallScore} size={64} strokeWidth={5} />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-white truncate">{a.jobTitle}</p>
                  <p className="text-slate-500 text-sm mt-0.5 truncate">
                    {a.resumeId?.fileName} · {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full">
                      Match: {a.matchScore}%
                    </span>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      Score: {a.overallScore}%
                    </span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-brand-400 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
