import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateJob from './pages/CreateJob';
import JobDashboard from './pages/JobDashboard';
import ApplicantDashboard from './pages/ApplicantDashboard';
import ResultsDashboard from './pages/ResultsDashboard';
import Reports from './pages/Reports';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs/create" element={<CreateJob />} />
          <Route path="/jobs/:jobId" element={<JobDashboard />} />
          <Route path="/jobs/:jobId/applicants/:applicantId" element={<ApplicantDashboard />} />
          <Route path="/jobs/:jobId/results" element={<ResultsDashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;