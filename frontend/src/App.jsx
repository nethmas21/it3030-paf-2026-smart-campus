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

function getHomeRouteForUser(user) {
  const roles = user?.roles || [];
  return roles.includes('ADMIN') ? '/admin' : '/dashboard';
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />
        <p className="text-sm font-medium tracking-wide text-slate-400">Loading...</p>
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
  if (!canAccess) return <Navigate to={getHomeRouteForUser(user)} replace />;

  return children;
}

function DefaultRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  return <Navigate to={getHomeRouteForUser(user)} replace />;
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
      .then((profile) => navigate(getHomeRouteForUser(profile), { replace: true }))
      .catch(() => navigate('/login?error=true', { replace: true }));
  }, [completeOAuthLogin, navigate, params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
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
      const profile = mode === 'register'
        ? await registerWithCredentials(form)
        : await loginWithCredentials({ email: form.email, password: form.password });

      navigate(getHomeRouteForUser(profile), { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-100 bg-white p-10 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Smart Campus</h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to manage facilities and incidents</p>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-md px-3 py-2 text-sm ${mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-md px-3 py-2 text-sm ${mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={8}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Login'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={login}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="" className="h-4 w-4" />
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

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tickets', label: 'Tickets' },
    { to: '/resources', label: 'Resources' },
    { to: '/bookings/my', label: 'My Bookings' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Operations' },
    { to: '/admin/resources', label: 'Resources' },
    { to: '/admin/bookings', label: 'Bookings' },
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

  const brandHref = isAdmin ? '/admin' : '/dashboard';

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <a href={brandHref} className="flex items-center gap-2.5 text-base font-bold text-gray-900">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-600">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <div className="flex flex-wrap items-center gap-1">
          {(isAdmin ? adminLinks : userLinks).map((link) => (
            <a
              key={link.to}
              href={link.to}
              className={
                isActive(link.to)
                  ? 'rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900'
                  : 'rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }
            >
              {link.label}
            </a>
          ))}

          {!isAdmin && isUser && (
            <>
              <a
                href="/tickets/new"
                className={
                  location.pathname === '/tickets/new'
                    ? 'rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900'
                    : 'rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              >
                New Ticket
              </a>
              <a
                href="/bookings/new"
                className={
                  location.pathname === '/bookings/new'
                    ? 'rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900'
                    : 'rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              >
                New Booking
              </a>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <NotificationPanel />
          {user?.picture && (
            <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
          )}
          <div className="hidden text-right md:block">
            <p className="text-xs font-semibold leading-none text-slate-800">{user?.name}</p>
            <p className="mt-0.5 text-xs leading-none text-slate-400">{user?.roles?.[0]}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600"
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
                    <Route path="/" element={<DefaultRoute />} />
                    <Route path="/dashboard" element={<DashboardPage />} />

                    <Route path="/tickets" element={<TicketListPage />} />
                    <Route
                      path="/tickets/new"
                      element={
                        <ProtectedRoute allowedRoles={['USER']}>
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
                        <ProtectedRoute allowedRoles={['USER']}>
                          <CreateBookingPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bookings/my"
                      element={
                        <ProtectedRoute allowedRoles={['USER']}>
                          <MyBookingsPage />
                        </ProtectedRoute>
                      }
                    />
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
