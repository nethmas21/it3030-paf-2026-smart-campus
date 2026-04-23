import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import TicketListPage from './pages/tickets/TicketListPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import CreateTicketPage from './pages/tickets/CreateTicketPage';

import ResourceListPage from './pages/resources/ResourceListPage';
import ResourceDetailPage from './pages/resources/ResourceDetailPage';
import AdminResourcePage from './pages/resources/AdminResourcePage';

import DashboardPage from './pages/dashboard/DashboardPage';
import AdminPage from './pages/admin/AdminPage';

import CreateBookingPage from './pages/bookings/CreateBookingPage';
import MyBookingsPage from './pages/bookings/MyBookingsPage';
import AdminBookingsPage from './pages/bookings/AdminBookingsPage';

// ── Loading screen ────────────────────────────────────────────────────────────
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

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

// ── Login Page ────────────────────────────────────────────────────────────────
function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-2xl shadow-card mb-5">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Campus</h1>
          <p className="text-sm text-slate-500 mt-1.5">Operations Hub</p>
        </div>

        <div className="card shadow-lifted">
          <h2 className="text-base font-semibold text-slate-800 mb-1">Sign in to continue</h2>
          <p className="text-sm text-slate-500 mb-6">Use your Google account to access the platform</p>

          <a
            href="http://localhost:8081/oauth2/authorization/google"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 shadow-soft"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </a>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Smart Campus Operations Hub &mdash; &copy; 2026
        </p>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.roles?.includes('ADMIN');

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
    if (to === '/admin') return location.pathname === '/admin';
    return location.pathname === to;
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/dashboard" className="navbar-brand flex items-center gap-2.5">
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

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <a
              key={link.to}
              href={link.to}
              className={isActive(link.to) ? 'nav-link-active' : 'nav-link'}
            >
              {link.label}
            </a>
          ))}

          {isAdmin && (
            <>
              <a
                href="/admin/bookings"
                className={isActive('/admin/bookings') ? 'nav-link-active' : 'nav-link-admin'}
              >
                Manage Bookings
              </a>
              <a
                href="/admin"
                className={isActive('/admin') ? 'nav-link-active' : 'nav-link-admin'}
              >
                Admin
              </a>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user?.picture && (
            <img src={user.picture} alt={user.name} className="avatar avatar-sm" />
          )}
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-none">{user?.roles?.[0]}</p>
          </div>
          <button
            onClick={logout}
            className="btn-ghost btn-sm text-slate-500 hover:text-danger-600 hover:bg-danger-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── App Layout ────────────────────────────────────────────────────────────────
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />

                    <Route path="/tickets" element={<TicketListPage />} />
                    <Route path="/tickets/new" element={<CreateTicketPage />} />
                    <Route path="/tickets/:id" element={<TicketDetailPage />} />

                    <Route path="/resources" element={<ResourceListPage />} />
                    <Route path="/resources/:id" element={<ResourceDetailPage />} />
                    <Route path="/admin/resources" element={<AdminResourcePage />} />

                    <Route path="/bookings/new" element={<CreateBookingPage />} />
                    <Route path="/bookings/my" element={<MyBookingsPage />} />
                    <Route path="/admin/bookings" element={<AdminBookingsPage />} />

                    <Route path="/admin" element={<AdminPage />} />
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