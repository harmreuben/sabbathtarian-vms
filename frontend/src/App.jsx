import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './store/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import VisitorRegistration from './features/visitors/VisitorRegistration';
import CheckIn from './features/checkin/CheckIn';
import FollowUpList from './features/followups/FollowUpList';
import AnalyticsDashboard from './features/reports/AnalyticsDashboard';

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />

            
            <Route path="/reports" element={
             <ProtectedRoute allowedRoles={['ADMIN', 'PASTOR']}><AnalyticsDashboard /></ProtectedRoute>
            } />


            <Route path="/followups" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PASTOR', 'FOLLOWUP']}><FollowUpList /></ProtectedRoute>
            } />

            
            <Route path="/visitors/new" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}><VisitorRegistration /></ProtectedRoute>
            } />

            <Route path="/checkin" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'SECURITY']}><CheckIn /></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;