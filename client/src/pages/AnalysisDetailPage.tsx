import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Lightbulb,
  Target, Shield, TrendingUp, ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import ScoreRing from '../components/ScoreRing';

interface Analysis {
  _id: string;
  jobTitle: string;
  jobDescription: string;
  overallScore: number;
  matchScore: number;
  skills: { matched: string[]; missing: string[]; extra: string[] };
  sections: { strengths: string[]; weaknesses: string[]; suggestions: string[] };
  atsCompatibility: { score: number; issues: string[] };
  keywordDensity: { keyword: string; count: number }[];
  summary: string;
  createdAt: string;
  resumeId: { fileName: string };
}

const Pill = ({ label, type }: { label: string; type: 'matched' | 'missing' | 'extra' }) => {
  const styles = {
    matched: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    missing: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    extra: 'bg-brand-500/10 text-brand-300 border-brand-500/20',
  };
  return (
    <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${styles[type]}`}>
      {label}
    </span>
  );
};

const SectionCard = ({
  title, items, icon: Icon, color, iconBg
}: {
  title: string;
  items: string[];
  icon: any;
  color: string;
  iconBg: string;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center justify-between hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon size={17} className={color} />
          </div>
          <span className="font-display font-semibold text-white">{title}</span>
          <span className="text-slate-600 text-sm">({items.length})</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-2.5 border-t border-white/5 pt-4">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${color.replace('text-', 'bg-')}`} />
              <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/analysis/${id}`).then(r => {
      setAnalysis(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!analysis) return (
    <div className="p-8 text-center">
      <p className="text-slate-400">Analysis not found.</p>
      <Link to="/history" className="btn-secondary mt-4 inline-block">Back to History</Link>
    </div>
  );

  const radarData = [
    { subject: 'Match', value: analysis.matchScore },
    { subject: 'Overall', value: analysis.overallScore },
    { subject: 'ATS', value: analysis.atsCompatibility.score },
    { subject: 'Skills', value: Math.round((analysis.skills.matched.length / Math.max(analysis.skills.matched.length + analysis.skills.missing.length, 1)) * 100) },
  ];

  const topKeywords = analysis.keywordDensity.slice(0, 8);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-slide-up">
        <div>
          <Link to="/history" className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-3 transition-colors">
            <ArrowLeft size={15} /> Back to History
          </Link>
          <h2 className="font-display font-bold text-3xl text-white">{analysis.jobTitle}</h2>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <FileText size={14} />
            {analysis.resumeId?.fileName} ·{' '}
            {new Date(analysis.createdAt).toLocaleDateString('en-US', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Score cards row */}
      <div className="grid grid-cols-4 gap-4 mb-8 animate-slide-up">
        {[
          { label: 'Overall Score', score: analysis.overallScore, icon: TrendingUp },
          { label: 'Job Match', score: analysis.matchScore, icon: Target },
          { label: 'ATS Score', score: analysis.atsCompatibility.score, icon: Shield },
          { label: 'Skill Match', score: Math.round((analysis.skills.matched.length / Math.max(analysis.skills.matched.length + analysis.skills.missing.length, 1)) * 100), icon: CheckCircle2 },
        ].map(({ label, score, icon: Icon }) => (
          <div key={label} className="glass-card p-5 flex flex-col items-center gap-3">
            <ScoreRing score={score} size={90} strokeWidth={7} />
            <p className="text-slate-400 text-sm text-center font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass-card p-6 mb-6 border-brand-500/20 bg-brand-500/5 animate-slide-up">
        <div className="flex gap-3">
          <div className="w-9 h-9 bg-brand-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Lightbulb size={17} className="text-brand-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-brand-400 mb-1">AI Summary</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Radar Chart */}
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="font-display font-semibold text-white mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'DM Sans' }} />
              <Radar name="Score" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Keyword density */}
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="font-display font-semibold text-white mb-4">Keyword Density</h3>
          {topKeywords.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topKeywords} layout="vertical">
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="keyword" type="category" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ background: '#111e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {topKeywords.map((_, i) => (
                    <Cell key={i} fill={`rgba(14,165,233,${0.9 - i * 0.08})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm">No keyword data available</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="glass-card p-6 mb-6 animate-slide-up">
        <h3 className="font-display font-semibold text-white mb-5">Skills Analysis</h3>
        <div className="space-y-5">
          {[
            { label: 'Matched Skills', items: analysis.skills.matched, type: 'matched' as const, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Missing Skills', items: analysis.skills.missing, type: 'missing' as const, icon: XCircle, color: 'text-rose-400' },
            { label: 'Extra Skills', items: analysis.skills.extra, type: 'extra' as const, icon: AlertCircle, color: 'text-brand-400' },
          ].map(({ label, items, type, icon: Icon, color }) => (
            <div key={label}>
              <div className={`flex items-center gap-2 mb-2 ${color}`}>
                <Icon size={15} />
                <span className="font-medium text-sm">{label} ({items.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.length > 0
                  ? items.map(s => <Pill key={s} label={s} type={type} />)
                  : <span className="text-slate-600 text-sm">None identified</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths, Weaknesses, Suggestions, ATS */}
      <div className="space-y-4 animate-slide-up">
        <SectionCard
          title="Strengths"
          items={analysis.sections.strengths}
          icon={CheckCircle2}
          color="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <SectionCard
          title="Weaknesses"
          items={analysis.sections.weaknesses}
          icon={XCircle}
          color="text-rose-400"
          iconBg="bg-rose-500/10"
        />
        <SectionCard
          title="Suggestions to Improve"
          items={analysis.sections.suggestions}
          icon={Lightbulb}
          color="text-amber-400"
          iconBg="bg-amber-500/10"
        />
        {analysis.atsCompatibility.issues.length > 0 && (
          <SectionCard
            title="ATS Compatibility Issues"
            items={analysis.atsCompatibility.issues}
            icon={Shield}
            color="text-brand-400"
            iconBg="bg-brand-500/10"
          />
        )}
      </div>
    </div>
  );
}
