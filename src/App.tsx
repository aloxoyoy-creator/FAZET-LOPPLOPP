import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppConfigProvider, useAppConfig } from './context/AppConfigContext';
import { Suspense, lazy, useEffect, type ReactNode } from 'react';
import AnimatedBackground from './components/ui/AnimatedBackground';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import { initNativeApp, useHardwareBackButton } from './lib/native';
import { useToast } from './components/ui/Toast';
import { AdminRoute, GuestRoute, ProtectedRoute } from './routes/guards';
import RuntimeErrorBoundary from './components/ui/RuntimeErrorBoundary';

const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const TaskDetail = lazy(() => import('./pages/TaskDetail'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Tutoring = lazy(() => import('./pages/Tutoring'));
const Raport = lazy(() => import('./pages/Raport'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Focus = lazy(() => import('./pages/Focus'));
const SearchPage = lazy(() => import('./pages/Search'));
const Insights = lazy(() => import('./pages/Insights'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminTasks = lazy(() => import('./pages/admin/AdminTasks'));
const AdminSchedule = lazy(() => import('./pages/admin/AdminSchedule'));
const AdminTutoring = lazy(() => import('./pages/admin/AdminTutoring'));
const AdminSubjects = lazy(() => import('./pages/admin/AdminSubjects'));
const AdminTeachers = lazy(() => import('./pages/admin/AdminTeachers'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminSessions = lazy(() => import('./pages/admin/AdminSessions'));
const AdminBroadcast = lazy(() => import('./pages/admin/AdminBroadcast'));
const AdminStorage = lazy(() => import('./pages/admin/AdminStorage'));
const AdminHealth = lazy(() => import('./pages/admin/AdminHealth'));
const AdminData = lazy(() => import('./pages/admin/AdminData'));
const AdminOperations = lazy(() => import('./pages/admin/AdminOperations'));
const AdminFocusSessions = lazy(() => import('./pages/admin/AdminFocusSessions'));
const AdminTaskWorkspace = lazy(() => import('./pages/admin/AdminTaskWorkspace'));
const AdminToken = lazy(() => import('./pages/admin/AdminToken'));
const RemotePage = lazy(() => import('./pages/RemotePage'));
const TaskSummaryPdf = lazy(() => import('./pages/TaskSummaryPdf'));
const ActivityCenter = lazy(() => import('./pages/ActivityCenter'));
const Chat = lazy(() => import('./pages/Chat'));
const AiAssistant = lazy(() => import('./pages/AiAssistant'));
const MyMinee = lazy(() => import('./pages/MyMinee'));
const Notes = lazy(() => import('./pages/Notes'));
const TimeBox = lazy(() => import('./pages/TimeBox'));
const AdminControl = lazy(() => import('./pages/admin/AdminControl'));
const AdminHub = lazy(() => import('./pages/admin/AdminHub'));
const AdminDigitalCards = lazy(() => import('./pages/admin/AdminDigitalCards'));

function Page({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { isPathEnabled, branding } = useAppConfig();
  const { isAdmin } = useAuth();
  if (branding.maintenance && !isAdmin) return (
    <AppShell><div className="grid min-h-[60vh] place-items-center p-6 text-center"><div className="max-w-md"><div className="text-5xl">🛠️</div><div className="mt-3 text-xl font-black">Sedang perawatan</div><p className="mt-2 text-sm opacity-70">{branding.maintenanceMessage}</p></div></div></AppShell>
  );
  if (!isPathEnabled(pathname)) return (
    <AppShell><div className="grid min-h-[60vh] place-items-center p-6 text-center"><div><div className="text-lg font-bold">Fitur sedang dinonaktifkan</div><p className="mt-2 text-sm opacity-70">Admin menonaktifkan halaman ini untuk sementara.</p><a href="/" className="mt-4 inline-block font-bold text-blue-600">Kembali ke beranda</a></div></div></AppShell>
  );
  return (
    <AppShell>
      <RuntimeErrorBoundary>
        <div key={window.location.pathname} className="page-transition">{children}</div>
      </RuntimeErrorBoundary>
    </AppShell>
  );
}

function NativeBootstrap() {
  const navigate = useNavigate();
  const { push } = useToast();
  useEffect(() => { void initNativeApp(); }, []);
  useHardwareBackButton(navigate, () => push({ tone: 'info', title: 'Tekan sekali lagi untuk keluar' }));
  return null;
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="max-w-md text-center">
        <div className="text-6xl font-black text-slate-900">404</div>
        <h1 className="mt-3 text-xl font-extrabold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Alamat yang kamu buka tidak tersedia atau sudah dipindahkan.</p>
        <a href="/" className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">Kembali ke dashboard</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <AppConfigProvider>
          <NativeBootstrap />
          <AnimatedBackground />
          <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm" style={{ color: 'var(--tf-ink-muted)' }}>Memuat…</div>}>
          <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/verify-email" element={<GuestRoute><VerifyEmail /></GuestRoute>} />
            <Route path="/auth/confirm" element={<GuestRoute><VerifyEmail /></GuestRoute>} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/403" element={<div className="grid min-h-screen place-items-center bg-slate-50 p-6"><div className="text-center"><div className="text-6xl font-black text-slate-900">403</div><p className="mt-2 text-sm text-slate-500">Access Denied</p><a className="mt-4 inline-block font-bold text-blue-600" href="/">Kembali ke dashboard</a></div></div>} />

            {/* Active product */}
            <Route path="/" element={<ProtectedRoute><Page><Dashboard /></Page></ProtectedRoute>} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/chat" element={<ProtectedRoute><Page><Chat /></Page></ProtectedRoute>} />
            <Route path="/notes/:id" element={<ProtectedRoute><Page><Notes /></Page></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><Page><Schedule /></Page></ProtectedRoute>} />
            <Route path="/tutoring" element={<ProtectedRoute><Page><Tutoring /></Page></ProtectedRoute>} />
            <Route path="/simulasi-tka" element={<ProtectedRoute><Page><iframe src="/cbt_pusmendik_simulasi.html" style={{width: '100%', height: 'calc(100vh - 64px)', border: 'none', borderRadius: '8px'}}/></Page></ProtectedRoute>} />
            <Route path="/raport" element={<ProtectedRoute><Page><Raport /></Page></ProtectedRoute>} />
            <Route path="/rapor" element={<Navigate to="/raport" replace />} />
            <Route path="/calendar" element={<ProtectedRoute><Page><Calendar /></Page></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><Page><AiAssistant /></Page></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Page><Profile /></Page></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Page><Settings /></Page></ProtectedRoute>} />

            {/* Semua fitur Fathur School Hub — kini tampil penuh di menu */}
            <Route path="/notes" element={<ProtectedRoute><Page><Notes /></Page></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Page><Tasks /></Page></ProtectedRoute>} />
            <Route path="/tasks/:id" element={<ProtectedRoute><Page><TaskDetail /></Page></ProtectedRoute>} />
            <Route path="/tasks/summary" element={<ProtectedRoute><Page><TaskSummaryPdf /></Page></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Page><Notifications /></Page></ProtectedRoute>} />
            <Route path="/focus" element={<ProtectedRoute><Page><Focus /></Page></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Page><SearchPage /></Page></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Page><Insights /></Page></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><Page><ActivityCenter /></Page></ProtectedRoute>} />
            <Route path="/my-minee" element={<ProtectedRoute><Page><MyMinee /></Page></ProtectedRoute>} />
            <Route path="/timebox" element={<ProtectedRoute><TimeBox /></ProtectedRoute>} />
            <Route path="/mediabox" element={<ProtectedRoute><TimeBox /></ProtectedRoute>} />
            <Route path="/watch-party" element={<ProtectedRoute><TimeBox /></ProtectedRoute>} />
            <Route path="/remote" element={<RemotePage />} />
            <Route path="/join" element={<RemotePage />} />
            <Route path="/admin/digital-cards" element={<AdminRoute><Page><AdminDigitalCards /></Page></AdminRoute>} />

            <Route path="/admin" element={<AdminRoute><Page><AdminHub /></Page></AdminRoute>} />
            <Route path="/admin/token" element={<AdminRoute><Page><AdminToken /></Page></AdminRoute>} />
            <Route path="/admin/overview" element={<AdminRoute><Page><AdminDashboard /></Page></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><Page><AdminUsers /></Page></AdminRoute>} />
            <Route path="/admin/tasks" element={<AdminRoute><Page><AdminTasks /></Page></AdminRoute>} />
            <Route path="/admin/task-workspace" element={<AdminRoute><Page><AdminTaskWorkspace /></Page></AdminRoute>} />
            <Route path="/admin/schedule" element={<AdminRoute><Page><AdminSchedule /></Page></AdminRoute>} />
            <Route path="/admin/tutoring-schedule" element={<AdminRoute><Page><AdminTutoring /></Page></AdminRoute>} />
            <Route path="/admin/subjects" element={<AdminRoute><Page><AdminSubjects /></Page></AdminRoute>} />
            <Route path="/admin/teachers" element={<AdminRoute><Page><AdminTeachers /></Page></AdminRoute>} />
            <Route path="/admin/announcements" element={<AdminRoute><Page><AdminAnnouncements /></Page></AdminRoute>} />
            <Route path="/admin/notifications" element={<AdminRoute><Page><AdminNotifications /></Page></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><Page><Insights admin /></Page></AdminRoute>} />
            <Route path="/admin/audit-logs" element={<AdminRoute><Page><AdminAuditLogs /></Page></AdminRoute>} />
            <Route path="/admin/control" element={<AdminRoute><Page><AdminHub /></Page></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><Page><AdminSettings /></Page></AdminRoute>} />
            <Route path="/admin/sessions" element={<AdminRoute><Page><AdminSessions /></Page></AdminRoute>} />
            <Route path="/admin/broadcast" element={<AdminRoute><Page><AdminBroadcast /></Page></AdminRoute>} />
            <Route path="/admin/storage" element={<AdminRoute><Page><AdminStorage /></Page></AdminRoute>} />
            <Route path="/admin/health" element={<AdminRoute><Page><AdminHealth /></Page></AdminRoute>} />
            <Route path="/admin/data" element={<AdminRoute><Page><AdminData /></Page></AdminRoute>} />
            <Route path="/admin/operations" element={<AdminRoute><Page><AdminOperations /></Page></AdminRoute>} />
            <Route path="/admin/focus-sessions" element={<AdminRoute><Page><AdminFocusSessions /></Page></AdminRoute>} />
            <Route path="/admin/my-minee" element={<AdminRoute><Page><MyMinee /></Page></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </AppConfigProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

