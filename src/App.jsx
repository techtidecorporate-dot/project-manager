import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, ROLES } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './pages/dashboards/admin/components/AdminLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';


// Admin Pages
import AdminDashboard from './pages/dashboards/admin/pages/Dashboard';
import AdminAddUsers from './pages/dashboards/admin/pages/AddUsers';
import AdminReports from './pages/dashboards/admin/pages/Reports';
import AdminRequests from './pages/dashboards/admin/pages/Requests';
import AdminInvoices from './pages/dashboards/admin/pages/Invoices';
import AdminAttendance from './pages/dashboards/admin/pages/Attendance';

// New Dynamic Pages (Shared)
import Projects from './pages/dashboards/admin/pages/Projects';
import Team from './pages/dashboards/admin/pages/AddUsers';
import Settings from './pages/dashboards/admin/pages/Settings';

// PM Layout & Pages
// PM Layout & Pages
import PMLayout from './pages/dashboards/pm/components/PMLayout';
import PMHome from './pages/dashboards/pm/pages/Dashboard';
import ProjectOverview from './pages/dashboards/pm/pages/ProjectOverview';
import ProjectDivision from './pages/dashboards/pm/pages/ProjectDivision';
import PMRequests from './pages/dashboards/pm/pages/Requests';
import PMSettings from './pages/dashboards/pm/pages/PMSettings';

// Developer Layout & Pages
import DeveloperLayout from './pages/dashboards/developer/components/DeveloperLayout';
import DeveloperDashboard from './pages/dashboards/developer/pages/Dashboard';
import AssignedTasks from './pages/dashboards/developer/pages/AssignedTasks';
import CompletedTasks from './pages/dashboards/developer/pages/CompletedTasks';
import DeveloperScore from './pages/dashboards/developer/pages/DeveloperScore';
import DeveloperSettings from './pages/dashboards/developer/pages/DeveloperSettings';
import DeveloperRequestSession from './pages/dashboards/developer/pages/RequestSession';

// SQA Layout & Pages
import SQALayout from './pages/dashboards/sqa/components/SQALayout';
import SQADashboard from './pages/dashboards/sqa/pages/Dashboard';
import SQAAssignedTasks from './pages/dashboards/sqa/pages/SQAAssignedTasks';
import SQACompletedTasks from './pages/dashboards/sqa/pages/SQACompletedTasks';
import SQAScore from './pages/dashboards/sqa/pages/SQAScore';
import SQASettings from './pages/dashboards/sqa/pages/SQASettings';
import RequestSession from './pages/dashboards/sqa/pages/RequestSession';

// Client Layout & Pages
import ClientLayout from './pages/dashboards/client/components/ClientLayout';
import ClientDashboard from './pages/dashboards/client/pages/Dashboard';
import ClientProjects from './pages/dashboards/client/pages/ClientProjects';
import ClientTickets from './pages/dashboards/client/pages/ClientTickets';
import ClientInvoices from './pages/dashboards/client/pages/ClientInvoices';
import ClientSettings from './pages/dashboards/client/pages/ClientSettings';

const App = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#e8eae3] text-[#373833] space-y-6">
          <div className="w-20 h-20 bg-[#fa2742]/20 rounded-[32px] flex items-center justify-center border border-[#fa2742]/20">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-4xl font-black italic">Unauthorized Access</h2>
          <p className="text-[#373833]/60 font-black uppercase tracking-[0.3em] text-[10px]">Permission Denied by OS Kernel</p>
          <button onClick={() => window.history.back()} className="px-8 py-3 bg-[#fa2742] text-[#373833] rounded-xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all">
            Execute Backtrack
          </button>
        </div>
      } />

      {/* Admin Routes with AdminLayout */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole={ROLES.ADMIN}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="add-users" element={<AdminAddUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="invoices" element={<AdminInvoices />} /> {/* Added Invoices Route */}
        <Route path="projects" element={<Projects />} />
        <Route path="team" element={<Team />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Project Manager Routes with PMLayout */}
      <Route path="/pm" element={
        <ProtectedRoute requiredRole={ROLES.PM}>
          <PMLayout />
        </ProtectedRoute>
      }>
        <Route index element={<PMHome />} />
        <Route path="overview" element={<ProjectOverview />} />
        <Route path="division" element={<ProjectDivision />} />
        <Route path="requests" element={<PMRequests />} />
        <Route path="settings" element={<PMSettings />} />
      </Route>

      {/* Developer Routes with DeveloperLayout */}
      <Route path="/developer" element={
        <ProtectedRoute requiredRole={ROLES.DEVELOPER}>
          <DeveloperLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DeveloperDashboard />} />
        <Route path="tasks" element={<AssignedTasks />} />
        <Route path="completed" element={<CompletedTasks />} />
        <Route path="score" element={<DeveloperScore />} />
        <Route path="settings" element={<DeveloperSettings />} />
        <Route path="requests" element={<DeveloperRequestSession />} />
      </Route>

      {/* SQA Routes with SQALayout */}
      <Route path="/sqa" element={
        <ProtectedRoute requiredRole={ROLES.SQA}>
          <SQALayout />
        </ProtectedRoute>
      }>
        <Route index element={<SQADashboard />} />
        <Route path="tasks" element={<SQAAssignedTasks />} />
        <Route path="completed" element={<SQACompletedTasks />} />
        <Route path="score" element={<SQAScore />} />
        <Route path="settings" element={<SQASettings />} />
        <Route path="requests" element={<RequestSession />} />
      </Route>

      {/* Client Routes with ClientLayout */}
      <Route path="/client" element={
        <ProtectedRoute requiredRole={ROLES.CLIENT}>
          <ClientLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ClientDashboard />} />
        <Route path="projects" element={<ClientProjects />} />
        <Route path="tickets" element={<ClientTickets />} />
        <Route path="invoices" element={<ClientInvoices />} />
        <Route path="settings" element={<ClientSettings />} />
      </Route>

      {/* Main Routes with MainLayout */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={
          user?.role === ROLES.ADMIN ? <Navigate to="/admin" /> :
            user?.role === ROLES.PM ? <Navigate to="/pm" /> :
              user?.role === ROLES.CLIENT ? <Navigate to="/client" /> :
                user?.role === ROLES.DEVELOPER ? <Navigate to="/developer" /> :
                  user?.role === ROLES.SQA ? <Navigate to="/sqa" /> :
                    <Navigate to="/unauthorized" />
        } />

        {/* Universal Workspace Routes */}
        <Route path="projects" element={<Projects />} />
        <Route path="team" element={<Team />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;

