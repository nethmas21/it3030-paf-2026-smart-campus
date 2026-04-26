import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NotificationPanel from './components/notifications/NotificationPanel';

import TicketListPage from './pages/tickets/TicketListPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import CreateTicketPage from './pages/tickets/CreateTicketPage';

import ResourceListPage from './pages/resources/ResourceListPage';
import ResourceDetailPage from './pages/resources/ResourceDetailPage';
import AdminResourcePage from './pages/resources/AdminResourcePage';

import CreateBookingPage from './pages/bookings/CreateBookingPage';
import MyBookingsPage from './pages/bookings/MyBookingsPage';
import AdminBookingsPage from './pages/bookings/AdminBookingsPage';

import DashboardPage from './pages/dashboard/DashboardPage';
import UserDashboard from './pages/dashboard/userdash';
import AdminPage from './pages/admin/AdminPage';
import logo from './assets/logo.png';
import UserManagementPage from './pages/admin/UserManagementPage';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium tracking-wide">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  const roles = user.roles || [];
  const canAccess = !allowedRoles || allowedRoles.some((role) => roles.includes(role));
  if (!canAccess) return <Navigate to="/dashboard" replace />;

  return children;
}

function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthLogin } = useAuth();

  useEffect(() => {
    const token = params.get('token');

    if (!token) {
      navigate('/login?error=true', { replace: true });
      return;
    }

    completeOAuthLogin(token)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => navigate('/login?error=true', { replace: true }));
  }, [completeOAuthLogin, navigate, params]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 text-sm text-gray-500">
      Completing sign in...
    </div>
  );
}

function LoginPage() {
  const { login, loginWithCredentials, registerWithCredentials } = useAuth();
  const hasError = new URLSearchParams(window.location.search).has('error');
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      if (mode === 'register') {
        await registerWithCredentials(form);
      } else {
        await loginWithCredentials({ email: form.email, password: form.password });
      }
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Smart Campus</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to manage facilities and incidents</p>

        <div className="grid grid-cols-2 gap-2 mb-6 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`px-3 py-2 text-sm rounded-md ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`px-3 py-2 text-sm rounded-md ${
              mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Register
          </button>
        </div>

        {hasError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Sign in failed. Please try again.
          </p>
        )}

        {message && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={8}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-5 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Login'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={login}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(false);

  const isAdmin = user?.roles?.includes('ADMIN');

  const isActive = (path) => location.pathname.startsWith(path);

  const baseLink =
    'block w-full px-4 py-3 rounded-lg text-sm font-medium transition';

  const normalLink = (path) =>
    `${baseLink} ${
      isActive(path)
        ? 'bg-slate-900 text-white'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  const adminLink = (path) =>
    `${baseLink} ${
      isActive(path)
        ? 'bg-indigo-600 text-white'
        : 'text-indigo-700 hover:bg-indigo-50'
    }`;

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 flex flex-col justify-between">

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="flex items-center gap-3 px-5 py-5 border-b">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-bold text-lg text-slate-900">
            CampusOps
          </span>
        </div>

        {/* NAV LINKS (VERTICAL FIX HERE) */}
        <div className="p-3 flex flex-col gap-2">

          <a href="/dashboard" className={normalLink('/dashboard')}>
            Dashboard
          </a>

          <a href="/tickets" className={normalLink('/tickets')}>
            Tickets
          </a>

          <a href="/resources" className={normalLink('/resources')}>
            Resources
          </a>

          <a href="/bookings/my" className={normalLink('/bookings')}>
            Bookings
          </a>

          {/* ADMIN */}
          {isAdmin && (
            <div className="mt-4 flex flex-col gap-2">

              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="w-full px-4 py-3 text-left rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Admin Panel ▾
              </button>

              {adminOpen && (
                <div className="flex flex-col gap-2 mt-2">

                  <a href="/admin" className={adminLink('/admin')}>
                    Manage Tickets
                  </a>

                  <a href="/admin/resources" className={adminLink('/admin/resources')}>
                    Manage Resources
                  </a>

                  <a href="/admin/bookings" className={adminLink('/admin/bookings')}>
                    Manage Bookings
                  </a>

                  <a href="/admin/users" className={adminLink('/admin/users')}>
                  Manage Users
                  </a>

                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* BOTTOM USER SECTION */}
      <div className="p-4 border-t">

        <p className="text-sm font-semibold text-slate-800">
          {user?.name}
        </p>

        <p className="text-xs text-slate-500 mb-3">
          {user?.roles?.[0]}
        </p>

        <button
          onClick={logout}
          className="w-full px-3 py-2 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
        >
          Logout
        </button>

      </div>
    </aside>
  );
}
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar />
      <main className="flex-1 ml-64 p-6">
        {children}
      </main>
    </div>
  );
}

function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  const isAdmin = user?.roles?.includes('ADMIN');

  return isAdmin ? <DashboardPage /> : <UserDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

          {/* DEFAULT → LOGIN */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardRouter />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* TICKETS */}
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TicketListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tickets/new"
            element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                <AppLayout>
                  <CreateTicketPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TicketDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* RESOURCES */}
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ResourceListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resources/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ResourceDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout>
                  <AdminResourcePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* BOOKINGS */}
          <Route
            path="/bookings/new"
            element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                <AppLayout>
                  <CreateBookingPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings/my"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MyBookingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout>
                  <AdminBookingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout>
                  <AdminPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ADMIN USERS (ADD THIS BELOW) */}
<Route
  path="/admin/users"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppLayout>
        <UserManagementPage />
      </AppLayout>
    </ProtectedRoute>
  }
/>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
