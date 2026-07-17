import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, <span className="font-medium">{user?.username}</span> ({user?.role})
              </span>
              <button 
                onClick={logout} 
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            
            <button 
              onClick={() => navigate('/visitors/new')}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Register New Visitor
            </button>

            <button 
              onClick={() => navigate('/checkin')}
              className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
            >
              Open Check-in Kiosk
            </button>

            <button 
              onClick={() => navigate('/followups')}
              className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700"
            >
              View Follow-ups
            </button>

            <button 
              onClick={() => navigate('/communication/broadcast')}
              className="inline-flex items-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700"
            >
              Send SMS Broadcast
            </button>

            <button 
              onClick={() => navigate('/reports')}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              View Analytics & Reports
            </button>

          </div>
        </div>
      </main>
    </div>
  );
}