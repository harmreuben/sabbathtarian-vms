import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './store/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import VisitorRegistration from './features/visitors/VisitorRegistration';
import CheckIn from './features/checkin/CheckIn';
import SelfCheckInKiosk from './features/checkin/SelfCheckInKiosk';
import FollowUpList from './features/followups/FollowUpList';
import SendBroadcast from './features/communication/SendBroadcast';
import AnalyticsDashboard from './features/reports/AnalyticsDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Kiosk Route (Outside Main Layout for Full Screen) */}
            <Route path="/kiosk" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'SECURITY']}>
                <SelfCheckInKiosk />
              </ProtectedRoute>
            } />

            {/* Standard App Routes (Inside Main Layout) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout><Dashboard /></MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/visitors/new" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                <MainLayout><VisitorRegistration /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/checkin" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'SECURITY']}>
                <MainLayout><CheckIn /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/followups" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PASTOR', 'FOLLOWUP']}>
                <MainLayout><FollowUpList /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/communication/broadcast" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PASTOR']}>
                <MainLayout><SendBroadcast /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PASTOR']}>
                <MainLayout><AnalyticsDashboard /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;