import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, History, LogOut,
  Wifi, WifiOff, Sparkles, Menu, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyze',   icon: FileSearch,       label: 'Analyze'   },
  { to: '/history',   icon: History,           label: 'History'   },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`;

  const drawerNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
      isActive
        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
        : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`;

  const bottomNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 px-5 py-1 rounded-xl transition-all ${
      isActive ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'
    }`;

  return (
    <div className="min-h-screen bg-slate-950 md:flex">

      {/* ── Mobile header ─────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 bg-surface-800/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center">
              <Sparkles size={15} className="text-brand-400" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">ResumeAI</span>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer overlay ──────────────────────────── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={() => setDrawerOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Drawer panel — slides in from left */}
          <div
            className="relative w-72 max-w-[85vw] h-full bg-surface-800 border-r border-white/8 flex flex-col z-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center">
                  <Sparkles size={15} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-base leading-none">ResumeAI</p>
                  <p className="text-xs text-slate-500 mt-0.5">Smart Analyzer</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={drawerNavClass}
                  onClick={() => setDrawerOpen(false)}
                >
                  <Icon size={20} />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Drawer footer */}
            <div className="px-4 pb-6 pt-4 border-t border-white/5 space-y-4">
              {/* Connection status */}
              <div className={`text-xs flex items-center gap-2 ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
                {isConnected ? 'Live connected' : 'Offline'}
              </div>

              {/* User row */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  aria-label="Log out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ────────────────────────────────── */}
      <aside className="hidden md:flex md:w-64 bg-surface-800/80 border-r border-white/5 flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
              <Sparkles size={16} className="text-brand-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">ResumeAI</h1>
              <p className="text-xs text-slate-500 mt-0.5">Smart Analyzer</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={desktopNavClass}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-3">
          <div className={`text-xs flex items-center gap-2 ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
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
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="flex-1 w-full overflow-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* ── Mobile bottom nav (icon + label) ──────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-800/95 backdrop-blur-xl border-t border-white/5 flex justify-around items-center px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={bottomNavClass}>
            <Icon size={21} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  );
}