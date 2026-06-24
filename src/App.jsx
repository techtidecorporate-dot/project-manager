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
import AdminAnalytics from './pages/dashboards/admin/pages/Analytics';
import AdminPermissions from './pages/dashboards/admin/pages/Permissions';
import AdminScoring from './pages/dashboards/admin/pages/Scoring';
import AdminTasks from './pages/dashboards/admin/pages/AdminTasks';

// New Dynamic Pages (Shared)
import Projects from './pages/dashboards/admin/pages/Projects';
import Team from './pages/dashboards/admin/pages/AddUsers';
import Settings from './pages/dashboards/admin/pages/Settings';

// Hierarchy Pages
import Workspaces from './pages/dashboards/admin/pages/Workspaces';
import Departments from './pages/dashboards/admin/pages/Departments';

// PM Layout & Pages
import PMLayout from './pages/dashboards/pm/components/PMLayout';
import PMHome from './pages/dashboards/pm/pages/Dashboard';
import ProjectOverview from './pages/dashboards/pm/pages/ProjectOverview';
import ProjectDivision from './pages/dashboards/pm/pages/ProjectDivision';
import PMRequests from './pages/dashboards/pm/pages/Requests';
import PMSettings from './pages/dashboards/pm/pages/PMSettings';
import PMTasks from './pages/dashboards/pm/pages/PMTasks';
import PMTimeline from './pages/dashboards/pm/pages/PMTimeline';
import PMMilestonesManage from './pages/dashboards/pm/pages/PMMilestonesManage';
import PMDepartments from './pages/dashboards/pm/pages/PMDepartments';
import PMProjects from './pages/dashboards/pm/pages/PMProjects';

// Developer Layout & Pages
import DeveloperLayout from './pages/dashboards/developer/components/DeveloperLayout';
import DeveloperDashboard from './pages/dashboards/developer/pages/Dashboard';
import AssignedTasks from './pages/dashboards/developer/pages/AssignedTasks';
import CompletedTasks from './pages/dashboards/developer/pages/CompletedTasks';
import DeveloperScore from './pages/dashboards/developer/pages/DeveloperScore';
import DeveloperSettings from './pages/dashboards/developer/pages/DeveloperSettings';
import DeveloperRequestSession from './pages/dashboards/developer/pages/RequestSession';
import DeveloperProjects from './pages/dashboards/developer/pages/DeveloperProjects';

// SQA Layout & Pages
import SQALayout from './pages/dashboards/sqa/components/SQALayout';
import SQADashboard from './pages/dashboards/sqa/pages/Dashboard';
import SQAAssignedTasks from './pages/dashboards/sqa/pages/SQAAssignedTasks';
import SQACompletedTasks from './pages/dashboards/sqa/pages/SQACompletedTasks';
import SQAScore from './pages/dashboards/sqa/pages/SQAScore';
import SQASettings from './pages/dashboards/sqa/pages/SQASettings';
import RequestSession from './pages/dashboards/sqa/pages/RequestSession';
import SQATrackFixes from './pages/dashboards/sqa/pages/SQATrackFixes';
import SQADiscussions from './pages/dashboards/sqa/pages/SQADiscussions';

// Shared Pages
import ProjectDetail from './pages/dashboards/shared/ProjectDetail';

// Client Layout & Pages
import ClientLayout from './pages/dashboards/client/components/ClientLayout';
import ClientDashboard from './pages/dashboards/client/pages/Dashboard';
import ClientProjects from './pages/dashboards/client/pages/ClientProjects';
import ClientTickets from './pages/dashboards/client/pages/ClientTickets';
import ClientInvoices from './pages/dashboards/client/pages/ClientInvoices';
import ClientSettings from './pages/dashboards/client/pages/ClientSettings';
import ClientMilestones from './pages/dashboards/client/pages/ClientMilestones';
import ClientDeliverables from './pages/dashboards/client/pages/ClientDeliverables';
import ClientDiscussions from './pages/dashboards/client/pages/ClientDiscussions';

const App = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={
        <div className="flex flex-col items-center justify-center min-h-screen bg-[--background] text-[#191a23] space-y-6">
          <div className="w-20 h-20 bg-[#453abc]/20 rounded-[32px] flex items-center justify-center border border-[#453abc]/20">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-4xl font-black italic">Unauthorized Access</h2>
          <p className="text-[#6b7280] font-black uppercase tracking-[0.3em] text-[10px]">Permission Denied by OS Kernel</p>
          <button onClick={() => window.history.back()} className="px-8 py-3 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white rounded-xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all">
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
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="workspaces" element={<Workspaces />} />
        <Route path="departments" element={<Departments />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="team" element={<Team />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="permissions" element={<AdminPermissions />} />
        <Route path="scoring" element={<AdminScoring />} />
        <Route path="tasks" element={<AdminTasks />} />
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
        <Route path="projects" element={<PMProjects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="departments" element={<PMDepartments />} />
        <Route path="tasks" element={<PMTasks />} />
        <Route path="timeline" element={<PMTimeline />} />
        <Route path="milestones" element={<PMMilestonesManage />} />
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
        <Route path="projects" element={<DeveloperProjects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
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
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="tasks" element={<SQAAssignedTasks />} />
        <Route path="track-fixes" element={<SQATrackFixes />} />
        <Route path="discussions" element={<SQADiscussions />} />
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
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="milestones" element={<ClientMilestones />} />
        <Route path="deliverables" element={<ClientDeliverables />} />
        <Route path="discussions" element={<ClientDiscussions />} />
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

