import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../../api/ticketApi';
import { resourceApi } from '../../api/resourceApi';
import { getAllBookings } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTickets({ page: 0, size: 100 }),
      resourceApi.getAll(),
      getAllBookings({ page: 0, size: 100 }),
    ])
      .then(([ticketRes, resourceRes, bookingRes]) => {
        setTickets(ticketRes.data.data.content || []);
        setResources(resourceRes || []);
        setBookings(bookingRes.data.data.content || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length;

  const totalResources = resources.length;
  const activeResources = resources.filter(r => r.status === 'ACTIVE' || r.status === 'AVAILABLE').length;
  const maintenanceResources = resources.filter(r =>
    ['OUT_OF_SERVICE', 'MAINTENANCE'].includes(r.status)
  ).length;

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const approvedBookings = bookings.filter(b => b.status === 'APPROVED').length;
  const rejectedBookings = bookings.filter(b => b.status === 'REJECTED').length;

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="page-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  const StatCard = ({ label, value, icon, color }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className={`stat-value ${color}`}>{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="page-wide">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {user?.name?.split(' ')[0]} — here is your Smart Campus overview
          </p>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tickets" value={totalTickets} icon="🎫" color="text-slate-900" />
        <StatCard label="Open Tickets" value={openTickets} icon="📌" color="text-primary-600" />
        <StatCard label="Resources" value={totalResources} icon="🏫" color="text-blue-600" />
        <StatCard label="Pending Bookings" value={pendingBookings} icon="⏳" color="text-warning-600" />
      </div>

      {/* Module summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Tickets */}
        <div className="card">
          <div className="card-header">
            <h3>Tickets Summary</h3>
            <Link to="/admin" className="btn-link">Manage</Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-blue-600 font-semibold">Open</p>
              <p className="text-2xl font-bold text-blue-700">{openTickets}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3">
              <p className="text-xs text-yellow-600 font-semibold">Progress</p>
              <p className="text-2xl font-bold text-yellow-700">{inProgressTickets}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-green-600 font-semibold">Resolved</p>
              <p className="text-2xl font-bold text-green-700">{resolvedTickets}</p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="card">
          <div className="card-header">
            <h3>Resources Summary</h3>
            <Link to="/admin/resources" className="btn-link">Manage</Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 font-semibold">Total</p>
              <p className="text-2xl font-bold text-slate-800">{totalResources}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-blue-600 font-semibold">Active</p>
              <p className="text-2xl font-bold text-blue-700">{activeResources}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs text-red-600 font-semibold">Unavailable</p>
              <p className="text-2xl font-bold text-red-700">{maintenanceResources}</p>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="card">
          <div className="card-header">
            <h3>Bookings Summary</h3>
            <Link to="/admin/bookings" className="btn-link">Manage</Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-yellow-50 rounded-xl p-3">
              <p className="text-xs text-yellow-600 font-semibold">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">{pendingBookings}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-green-600 font-semibold">Approved</p>
              <p className="text-2xl font-bold text-green-700">{approvedBookings}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs text-red-600 font-semibold">Rejected</p>
              <p className="text-2xl font-bold text-red-700">{rejectedBookings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-6">
        <div className="card-header">
          <h3>Quick Actions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin" className="p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition">
            <p className="font-bold text-purple-700">🎫 Manage Tickets</p>
            <p className="text-sm text-purple-500 mt-1">Review and update incident tickets</p>
          </Link>

          <Link to="/admin/resources" className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition">
            <p className="font-bold text-blue-700">🏫 Manage Resources</p>
            <p className="text-sm text-blue-500 mt-1">Add, edit, and monitor campus resources</p>
          </Link>

          <Link to="/admin/bookings" className="p-4 rounded-xl bg-green-50 hover:bg-green-100 transition">
            <p className="font-bold text-green-700">📅 Manage Bookings</p>
            <p className="text-sm text-green-500 mt-1">Approve or reject booking requests</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent Tickets */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Tickets</h3>
            <Link to="/admin" className="btn-link">View all</Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">No recent tickets</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{ticket.title}</p>
                    <p className="text-xs text-slate-400">
                      {ticket.category?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span className="badge-slate">{ticket.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Bookings</h3>
            <Link to="/admin/bookings" className="btn-link">View all</Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">No recent bookings</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentBookings.map(booking => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Resource #{booking.resourceId}
                    </p>
                    <p className="text-xs text-slate-400">
                      {booking.bookingDate} · {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  <span className="badge-slate">{booking.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}