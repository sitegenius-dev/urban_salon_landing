import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Scissors, Users,
  LogOut, Menu, ChevronRight, Settings, Image, FileText, Phone, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
 

const ADMIN_LINKS = [
  { to: '/admin',           label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/bookings',  label: 'Bookings',  icon: CalendarDays },
  { to: '/admin/services',  label: 'Services',  icon: Scissors },
  { to: '/admin/staff',     label: 'Staff',     icon: Users },
  { to: '/admin/settings',  label: 'Settings',  icon: Settings },
  { to: '/admin/reviews',   label: 'Reviews',   icon: Star }
];

const DEV_LINKS = [
  { to: '/developer',          label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/developer/hero',     label: 'Hero Section', icon: Image },
  { to: '/developer/services', label: 'Services CMS', icon: Scissors },
  { to: '/developer/about',    label: 'About Section',icon: FileText },
  { to: '/developer/contact',  label: 'Contact CMS',  icon: Phone },
];

export default function AdminLayout({ children, panel = 'admin' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();

  const links  = panel === 'developer' ? DEV_LINKS : ADMIN_LINKS;
  const title  = panel === 'developer' ? 'Developer CMS' : 'Admin Panel';
  const accent = panel === 'developer' ? '#4f8ef7' : '#D4AF37';

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate(panel === 'developer' ? '/developer/login' : '/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: accent }}>
            <span className="text-black font-black text-xs">R</span>
          </div>
          <div className="min-w-0">
            <div className="text-white font-bold text-sm truncate">Root & Rise</div>
            <div className="text-xs font-medium truncate" style={{ color: accent }}>{title}</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${active ? 'active' : ''}`}
              style={active ? { borderLeftColor: accent, color: accent } : {}}>
              <Icon size={16} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
              {active && <ChevronRight size={13} className="ml-auto flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
          <div className="text-xs truncate" style={{ color: accent }}>{user?.role}</div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full hover:text-red-400">
          <LogOut size={16} className="flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-[#0d0d0d] border-r border-white/10 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-56 bg-[#0d0d0d] border-r border-white/10 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="bg-[#0d0d0d] border-b border-white/10 px-4 h-14 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-400 hover:text-white p-1">
            <Menu size={20} />
          </button>
          <h1 className="text-white font-semibold text-sm truncate">{title}</h1>
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-gray-500 hidden sm:block truncate max-w-[150px]">{user?.email}</span>
            <a href="/" target="_blank"
              className="text-xs px-3 py-1 rounded-full border text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              style={{ borderColor: accent + '44' }}>
              View Site
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0a0a]">
          {children}
        </main>
      </div>
    </div>
  );
}
