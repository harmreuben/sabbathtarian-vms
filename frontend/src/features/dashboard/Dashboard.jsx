import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../reports/api';
import { Users, CalendarCheck, UserPlus, Activity, ShieldCheck, AlertTriangle, Clock, Fingerprint } from 'lucide-react';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: reportsApi.getStats,
  });

  const stats = data?.data || {};
  const todayStats = stats.today || {};
  const scanStats = todayStats.scans || {};

  const statCards = [
    { name: 'Total Visitors', value: stats.total_visitors || 0, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { name: "Today's Check-ins", value: todayStats.check_ins || 0, icon: CalendarCheck, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { name: 'First Time Today', value: todayStats.first_time || 0, icon: UserPlus, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
    { name: 'Total Attendance', value: stats.total_attendance || 0, icon: Activity, color: 'text-teal-500', bgColor: 'bg-teal-50 dark:bg-teal-900/20' },
  ];

  const securityCards = [
    { name: 'Successful Scans', value: scanStats.success || 0, icon: Fingerprint, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { name: 'Duplicates Prevented', value: scanStats.duplicate || 0, icon: ShieldCheck, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { name: 'Invalid Scans', value: scanStats.invalid || 0, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
    { name: 'Peak Arrival', value: todayStats.peak_hours?.[0] || 'N/A', icon: Clock, color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back. Here's what's happening at the church today.</p>
      </div>

      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-4 text-center py-10 text-gray-500">Loading stats...</div>
        ) : (
          statCards.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-gray-900 rounded-xl shadow-premium border border-gray-100 dark:border-gray-800 p-5 transition-shadow hover:shadow-premium-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security & Scans Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security & Check-in Analytics (Today)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {!isLoading && securityCards.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-gray-900 rounded-xl shadow-premium border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 capitalize">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-premium border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/visitors/new" className="inline-flex items-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm">
            Register New Visitor
          </a>
          <a href="/checkin" className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Open Reception Check-in
          </a>
          <a href="/kiosk" target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors shadow-sm">
            Launch Self-Service Kiosk
          </a>
          <a href="/reports" className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            View Full Analytics & Reports
          </a>
        </div>
      </div>

    </div>
  );
}