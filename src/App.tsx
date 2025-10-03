import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import CreateJob from './pages/CreateJob';
import JobDashboard from './pages/JobDashboard';
import ApplicantDashboard from './pages/ApplicantDashboard';
import ResultsDashboard from './pages/ResultsDashboard';
import Reports from './pages/Reports';
import Candidates from './pages/Candidates';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/candidates" element={
            <ProtectedRoute>
              <Layout>
                <Candidates />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/jobs/create" element={
            <ProtectedRoute>
              <Layout>
                <CreateJob />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/jobs/:jobId" element={
            <ProtectedRoute>
              <Layout>
                <JobDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/jobs/:jobId/applicants/:applicantId" element={
            <ProtectedRoute>
              <Layout>
                <ApplicantDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/jobs/:jobId/results" element={
            <ProtectedRoute>
              <Layout>
                <ResultsDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;