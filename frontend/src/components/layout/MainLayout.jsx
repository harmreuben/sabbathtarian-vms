import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  ScanLine, 
  ListChecks, 
  Send, 
  BarChart3, 
  Settings2, // Added Settings2 icon
  LogOut, 
  Church 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'PASTOR', 'RECEPTIONIST', 'FOLLOWUP', 'SECURITY'] },
  { name: 'Visitor Directory', path: '/visitors', icon: Users, roles: ['ADMIN', 'PASTOR', 'RECEPTIONIST', 'FOLLOWUP'] },
  { name: 'Register Visitor', path: '/visitors/new', icon: UserPlus, roles: ['ADMIN', 'RECEPTIONIST'] },
  { name: 'Check-in Kiosk', path: '/checkin', icon: ScanLine, roles: ['ADMIN', 'RECEPTIONIST', 'SECURITY'] },
  { name: 'Follow-ups', path: '/followups', icon: ListChecks, roles: ['ADMIN', 'PASTOR', 'FOLLOWUP'] },
  { name: 'Broadcasts', path: '/communication/broadcast', icon: Send, roles: ['ADMIN', 'PASTOR'] },
  { name: 'Analytics', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'PASTOR'] },
  { name: 'Settings', path: '/settings', icon: Settings2, roles: ['ADMIN', 'PASTOR'] }, // Added Settings
];

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed h-full">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800 px-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-600 rounded-lg">
              <Church className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none">Sabbathtarian</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-none mt-1">VMS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const canAccess = item.roles.includes(user?.role);
            if (!canAccess) return null;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white md:hidden">Sabbathtarian VMS</h2>
          <div className="hidden md:block">
            {/* Can add page titles here later */}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      
    </div>
  );
}