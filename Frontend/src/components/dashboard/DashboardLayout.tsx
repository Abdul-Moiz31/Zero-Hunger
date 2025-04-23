import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Heart, 
  LayoutDashboard, 
  Package2, 
  Users, 
  Settings as SettingsIcon, 
  LogOut,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: "New task available", time: "5 minutes ago" },
    { id: 2, message: "Task completed successfully", time: "1 hour ago" },
    { id: 3, message: "New feedback received", time: "2 hours ago" },
  ]);

  const handleLogout = () => {
    signOut();
  };

  const renderContent = () => {
    if (activePage === 'settings') {
      const Settings = React.lazy(() => import('./Settings'));
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <Settings />
        </React.Suspense>
      );
    }
    return children;
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className={`${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      } bg-white shadow-lg transition-all duration-300 z-20`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="bg-green-100 rounded-lg p-2 transition-transform group-hover:scale-110">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              {!isSidebarCollapsed && (
                <span className="text-xl font-bold text-gray-800">Zero Hunger</span>
              )}
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <SidebarButton
              icon={LayoutDashboard}
              label="Dashboard"
              isActive={activePage === 'dashboard'}
              onClick={() => setActivePage('dashboard')}
              collapsed={isSidebarCollapsed}
            />
            
            {user?.role === 'donor' && (
              <SidebarButton
                icon={Package2}
                label="My Donations"
                isActive={activePage === 'donations'}
                onClick={() => setActivePage('donations')}
                collapsed={isSidebarCollapsed}
              />
            )}
            
            {user?.role === 'ngo' && (
              <SidebarButton
                icon={Users}
                label="Manage Volunteers"
                isActive={activePage === 'volunteers'}
                onClick={() => setActivePage('volunteers')}
                collapsed={isSidebarCollapsed}
              />
            )}
            
            <SidebarButton
              icon={SettingsIcon}
              label="Settings"
              isActive={activePage === 'settings'}
              onClick={() => setActivePage('settings')}
              collapsed={isSidebarCollapsed}
            />
          </nav>

          <div className="p-4 border-t">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm z-10">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronDown 
                  className={`w-5 h-5 transform transition-transform ${
                    isSidebarCollapsed ? 'rotate-90' : '-rotate-90'
                  }`} 
                />
              </button>
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fadeIn">
                    {notifications.map(notification => (
                      <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-green-600">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Guest'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto py-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarButton = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick,
  collapsed 
}: { 
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
  collapsed: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-green-50 text-green-600' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
    {!collapsed && <span>{label}</span>}
  </button>
);

export default DashboardLayout;