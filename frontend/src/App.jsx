import { useEffect, useState, useRef } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
  useLocation,
  Link
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

  const isAdmin = user?.roles?.includes("ADMIN");

  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setMenuOpen(false);
        setAdminOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (to) => location.pathname.startsWith(to);

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition
        ${
          isActive(to)
            ? "bg-primary-50 text-primary-700"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
        }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg shadow-soft">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* LOGO */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-primary-600 shadow-soft">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor">
              <path strokeWidth="2" d="M3 10l9-7 9 7v11a1 1 0 01-1 1h-5V14H9v8H4a1 1 0 01-1-1z"/>
            </svg>
          </div>
          <span className="font-bold text-slate-900 text-lg">
            CampusHub
          </span>
        </Link>

        {/* NAV LINKS */}
        <div className="flex items-center gap-2">
          {navLink("/dashboard", "Dashboard")}
          {navLink("/tickets", "Tickets")}
          {navLink("/resources", "Resources")}
          {navLink("/bookings/my", "Bookings")}

          {/* ADMIN DROPDOWN */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="px-3 py-2 text-sm font-medium rounded-lg text-primary-600 hover:bg-primary-50"
              >
                Admin ▾
              </button>

              {adminOpen && (
                <div className="absolute mt-2 w-48 rounded-xl border bg-white shadow-card p-2">
                  <Link to="/admin" className="block px-3 py-2 rounded-lg hover:bg-slate-100">
                    Manage Tickets
                  </Link>
                  <Link to="/admin/resources" className="block px-3 py-2 rounded-lg hover:bg-slate-100">
                    Manage Resources
                  </Link>
                  <Link to="/admin/bookings" className="block px-3 py-2 rounded-lg hover:bg-slate-100">
                    Manage Bookings
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 relative" ref={menuRef}>

          {/* Notifications */}
          <NotificationPanel />

          {/* AVATAR */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-full hover:bg-slate-100 p-1 transition"
          >
            <img
              src={user?.picture || "https://i.pravatar.cc/40"}
              alt=""
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
            />
          </button>

          {/* DROPDOWN MENU */}
          {menuOpen && (
            <div className="absolute right-0 top-14 w-56 rounded-xl border bg-white shadow-card p-2 animate-fade-in">
              
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.roles?.[0]}</p>
              </div>

              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-lg hover:bg-slate-100 text-sm"
              >
                Dashboard
              </Link>

              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-danger-50 text-sm text-danger-600"
              >
                Sign out
              </button>
            </div>
          )}
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardRouter />} />

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
