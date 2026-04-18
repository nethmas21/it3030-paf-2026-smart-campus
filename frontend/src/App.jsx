import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import TicketListPage   from './pages/tickets/TicketListPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import CreateTicketPage from './pages/tickets/CreateTicketPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Smart Campus</h1>
        <p className="text-sm text-gray-500 mb-8">Sign in to manage facilities and incidents</p>
        <a
          href="http://localhost:8081/oauth2/authorization/google"
          className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
          Continue with Google
        </a>
      </div>
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <a href="/tickets" className="text-base font-bold text-gray-900">Smart Campus</a>
      <div className="flex items-center gap-4">
        <a href="/tickets" className="text-sm text-gray-600 hover:text-gray-900">Tickets</a>
        <span className="text-sm text-gray-400">{user?.name}</span>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600">Sign out</button>
      </div>
    </nav>
  );
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
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
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/"               element={<Navigate to="/tickets" replace />} />
                  <Route path="/tickets"         element={<TicketListPage />} />
                  <Route path="/tickets/new"     element={<CreateTicketPage />} />
                  <Route path="/tickets/:id"     element={<TicketDetailPage />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}