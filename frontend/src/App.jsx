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
import AdminPage from './pages/admin/AdminPage';

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
            className={`px-3 py-2 text-sm rounded-md ${mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`px-3 py-2 text-sm rounded-md ${mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
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

  const isAdmin = user?.roles?.includes('ADMIN');
  const isUser = user?.roles?.includes('USER');
  const canCreateTickets = isUser || isAdmin;
  const canCreateBookings = isUser || isAdmin;

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tickets', label: 'Tickets' },
    { to: '/resources', label: 'Resources' },
    { to: '/bookings/my', label: 'My Bookings' },
  ];

  const isActive = (to) => {
    if (to === '/tickets') return location.pathname.startsWith('/tickets');
    if (to === '/resources') return location.pathname.startsWith('/resources');
    if (to === '/bookings/my') return location.pathname.startsWith('/bookings');
    if (to === '/admin/bookings') return location.pathname.startsWith('/admin/bookings');
    if (to === '/admin/resources') return location.pathname.startsWith('/admin/resources');
    if (to === '/admin') return location.pathname === '/admin';
    return location.pathname === to;
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <a href="/dashboard" className="text-base font-bold text-gray-900 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <span>Smart Campus</span>
        </a>

        <div className="flex items-center gap-1 flex-wrap">
          {links.map((link) => (
            <a
              key={link.to}
              href={link.to}
              className={isActive(link.to) ? 'px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-900 font-medium' : 'px-3 py-2 text-sm rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
            >
              {link.label}
            </a>
          ))}

          {canCreateTickets && (
            <a
              href="/tickets/new"
              className={location.pathname === '/tickets/new' ? 'px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-900 font-medium' : 'px-3 py-2 text-sm rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
            >
              New Ticket
            </a>
          )}

          {canCreateBookings && (
            <a
              href="/bookings/new"
              className={location.pathname === '/bookings/new' ? 'px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-900 font-medium' : 'px-3 py-2 text-sm rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
            >
              New Booking
            </a>
          )}

          {isAdmin && (
            <>
              <a
                href="/admin/resources"
                className={isActive('/admin/resources') ? 'px-3 py-2 text-sm rounded-lg bg-purple-50 text-purple-700 font-medium' : 'px-3 py-2 text-sm rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-50'}
              >
                Manage Resources
              </a>
              <a
                href="/admin/bookings"
                className={isActive('/admin/bookings') ? 'px-3 py-2 text-sm rounded-lg bg-purple-50 text-purple-700 font-medium' : 'px-3 py-2 text-sm rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-50'}
              >
                Manage Bookings
              </a>
              <a
                href="/admin"
                className={isActive('/admin') ? 'px-3 py-2 text-sm rounded-lg bg-purple-50 text-purple-700 font-medium' : 'px-3 py-2 text-sm rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-50'}
              >
                Admin
              </a>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <NotificationPanel />
          {user?.picture && (
            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
          )}
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-none">{user?.roles?.[0]}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="px-3 py-2 text-sm rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />

                    <Route path="/tickets" element={<TicketListPage />} />
                    <Route
                      path="/tickets/new"
                      element={
                        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                          <CreateTicketPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/tickets/:id" element={<TicketDetailPage />} />

                    <Route path="/resources" element={<ResourceListPage />} />
                    <Route path="/resources/:id" element={<ResourceDetailPage />} />
                    <Route
                      path="/admin/resources"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminResourcePage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/bookings/new"
                      element={
                        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                          <CreateBookingPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/bookings/my" element={<MyBookingsPage />} />
                    <Route
                      path="/admin/bookings"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminBookingsPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminPage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
