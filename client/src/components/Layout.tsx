import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileSearch, History, LogOut, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyze', icon: FileSearch, label: 'Analyze' },
  { to: '/history', icon: History, label: 'History' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`;

  return (
    <div className="min-h-screen bg-slate-950 md:flex">

      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-40 bg-surface-800/95 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-white" />
          <h1 className="text-white font-bold text-lg">
            ResumeAI
          </h1>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 bg-surface-800/80 border-r border-white/5 flex-col">

        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-white" />
            <div>
              <h1 className="text-white font-bold text-lg">
                ResumeAI
              </h1>
              <p className="text-xs text-slate-500">
                Smart Analyzer
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-3">
          <div className={`text-xs flex items-center gap-2 ${
            isConnected
              ? 'text-emerald-400'
              : 'text-slate-500'
          }`}>
            {isConnected
              ? <Wifi size={14} />
              : <WifiOff size={14} />}
            {isConnected ? 'Live connected' : 'Offline'}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>

            <button onClick={handleLogout}><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 w-full overflow-auto pb-20 md:pb-0"> <Outlet /></main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-800/95 backdrop-blur-xl border-t border-white/5 flex justify-around py-3">
        {navItems.map(({ to, icon: Icon }) => ( <NavLink key={to} to={to}> <Icon size={20} /> </NavLink>
        ))}
      </nav>
    </div>
  );
}