/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Heart,
  LayoutDashboard,
  Package2,
  Users,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  X,
  Menu,
  Star,
  MessageSquare,
  User,
  ShieldCheck,
  BarChart3,
  CalendarClock,
  Sliders,
} from 'lucide-react';

const Settings = lazy(() => import('./Settings'));
const RecurringDonations = lazy(() => import('./RecurringDonations'));
const NGOPreferences = lazy(() => import('./NGOPreferences'));
const ProfilePage = lazy(() => import('./ProfilePage'));
const MessagingPanel = lazy(() => import('./MessagingPanel'));

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  donor: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'donations', icon: Package2, label: 'My Donations' },
    { id: 'recurring', icon: CalendarClock, label: 'Schedules' },
    { id: 'profile', icon: User, label: 'My Profile' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ],
  ngo: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'volunteers', icon: Users, label: 'Volunteers' },
    { id: 'inventory', icon: Package2, label: 'Inventory' },
    { id: 'preferences', icon: Sliders, label: 'Preferences' },
    { id: 'profile', icon: User, label: 'My Profile' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ],
  volunteer: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'tasks', icon: Package2, label: 'My Tasks' },
    { id: 'ratings', icon: Star, label: 'My Ratings' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ],
  admin: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'All Users' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'security', icon: ShieldCheck, label: 'Security' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ],
};

const ROLE_BADGE: Record<string, string> = {
  donor: 'bg-green-100 text-green-700',
  ngo: 'bg-blue-100 text-blue-700',
  volunteer: 'bg-amber-100 text-amber-700',
  admin: 'bg-rose-100 text-rose-700',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const role = user?.role ?? 'donor';
  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.donor;
  const badgeCls = ROLE_BADGE[role] ?? ROLE_BADGE.donor;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/');
    } catch {
      setIsLoggingOut(false);
    }
  };

  const handleNav = (id: string) => {
    setActivePage(id);
    setMobileOpen(false);
  };

  const renderMain = () => {
    const FullPage = (() => {
      switch (activePage) {
        case 'settings':   return Settings;
        case 'recurring':  return RecurringDonations;
        case 'preferences': return NGOPreferences;
        case 'profile':    return ProfilePage;
        case 'messages':   return MessagingPanel;
        default:           return null;
      }
    })();

    if (FullPage) {
      return (
        <Suspense fallback={<PageLoader />}>
          <FullPage />
        </Suspense>
      );
    }
    return children;
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white shadow-[1px_0_0_0_#f1f5f9] transition-all duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'md:w-[72px]' : 'w-[260px]'}`}
      >
        {/* Logo row */}
        <div className={`flex h-16 items-center border-b border-gray-100 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 rounded-lg p-1 transition hover:opacity-80"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-600">
              <Heart className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <span className="text-[15px] font-bold tracking-tight text-gray-900">Zero Hunger</span>
            )}
          </button>

          {/* Close on mobile */}
          <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 md:hidden">
            <X className="h-5 w-5" />
          </button>

          {/* Collapse toggle on desktop */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 md:block"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                    ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {!collapsed && isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User profile + logout */}
        <div className="border-t border-gray-100 p-3">
          {!collapsed ? (
            <div className="flex items-center gap-3 rounded-xl p-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{user?.name ?? 'User'}</p>
                <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${badgeCls}`}>
                  {role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Re-expand button when collapsed */}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="mt-2 flex w-full items-center justify-center rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              title="Expand sidebar"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </button>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-100 bg-white/80 px-4 backdrop-blur-sm sm:px-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page title */}
          <div className="flex-1">
            <h1 className="text-base font-semibold capitalize text-gray-900">
              {navItems.find((n) => n.id === activePage)?.label ?? 'Dashboard'}
            </h1>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <span className={`hidden rounded-full px-3 py-1 text-xs font-semibold capitalize sm:inline-block ${badgeCls}`}>
              {role}
            </span>
            <div className="h-8 w-px bg-gray-200" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderMain()}
        </main>
      </div>

      {/* Full-screen logout loader */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-green-100 border-t-green-600" />
            <p className="text-sm font-medium text-gray-600">Signing out…</p>
          </div>
        </div>
      )}
    </div>
  );
};

const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-green-100 border-t-green-600" />
  </div>
);

export default DashboardLayout;
