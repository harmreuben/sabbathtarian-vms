import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { reportsApi } from './api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: reportsApi.getStats,
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>;

  const stats = data?.data;
  const charts = stats?.charts || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Visitors</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats?.total_visitors || 0}</div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Attendance</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats?.total_attendance || 0}</div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
            <div className="p-5">
               <a href="http://localhost:8000/api/v1/reports/export/visitors/" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                Export Visitors to CSV
              </a>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Growth Trend */}
          <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Visitor Growth (Last 7 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.growth_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Gender Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.gender_distribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {charts.gender_distribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Counties */}
          <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top 5 Counties</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.top_counties || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Visitor Types */}
          <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">First Time vs Returning</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.visitor_types || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Bar dataKey="value" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}