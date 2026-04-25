import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../../api/ticketApi';
import { resourceApi } from '../../api/resourceApi';
import { getAllBookings } from '../../api/bookingApi';

export default function DashboardPage() {
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

  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const approvedBookings = bookings.filter(b => b.status === 'APPROVED').length;
  const rejectedBookings = bookings.filter(b => b.status === 'REJECTED').length;

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
    .slice(0, 5);

  const tones = {
    slate: 'border-slate-200 bg-white text-slate-900',
    primary: 'border-primary-100 bg-primary-50/70 text-primary-700',
    accent: 'border-accent-100 bg-accent-50 text-accent-700',
    success: 'border-success-100 bg-success-50 text-success-700',
    warning: 'border-warning-100 bg-warning-50 text-warning-600',
    danger: 'border-danger-100 bg-danger-50 text-danger-700',
  };

  const StatCard = ({ label, value, tone = 'slate' }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border px-6 py-5 shadow-soft transition-all duration-200 hover:shadow-lifted hover:-translate-y-0.5 ${tones[tone]}`}
  >
    <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
      {label}
    </p>

    <p className="mt-3 text-3xl font-bold tracking-tight">
      {value}
    </p>
  </div>
);

 const SummaryCard = ({ title, manageTo, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition hover:shadow-card">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>

      <Link
        to={manageTo}
        className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition"
      >
        Manage →
      </Link>
    </div>

    {children}
  </div>
);

  const MiniMetric = ({ label, value, tone = 'slate' }) => (
  <div
    className={`rounded-xl border px-4 py-4 transition ${tones[tone]} hover:shadow-soft`}
  >
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-bold">{value}</p>
  </div>
);

  const ActionCard = ({ to, title, description }) => (
  <Link
    to={to}
    className="group rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-primary-200 hover:bg-primary-50/40 hover:shadow-card"
  >
    <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700">
      {title}
    </p>

    <p className="mt-2 text-xs text-slate-500">
      {description}
    </p>
  </Link>
);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 bg-slate-50 min-h-screen">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
          Admin overview
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Operations Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor tickets, resources, and booking activity across the Smart Campus platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total Tickets" value={totalTickets} tone="slate" />
        <StatCard label="Open Tickets" value={openTickets} tone="primary" />
        <StatCard label="Resources" value={totalResources} tone="accent" />
        <StatCard label="Pending Bookings" value={pendingBookings} tone="warning" />
      </div>

      {/* Summaries */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SummaryCard title="Tickets" manageTo="/admin">
          <div className="grid grid-cols-3 gap-3">
            <MiniMetric label="Open" value={openTickets} tone="primary" />
            <MiniMetric label="Progress" value={inProgressTickets} tone="warning" />
            <MiniMetric label="Resolved" value={resolvedTickets} tone="success" />
          </div>
        </SummaryCard>

        <SummaryCard title="Resources" manageTo="/admin/resources">
          <div className="grid grid-cols-3 gap-3">
            <MiniMetric label="Total" value={totalResources} tone="slate" />
            <MiniMetric label="Active" value={activeResources} tone="accent" />
            <MiniMetric label="Down" value={maintenanceResources} tone="danger" />
          </div>
        </SummaryCard>

        <SummaryCard title="Bookings" manageTo="/admin/bookings">
          <div className="grid grid-cols-3 gap-3">
            <MiniMetric label="Pending" value={pendingBookings} tone="warning" />
            <MiniMetric label="Approved" value={approvedBookings} tone="success" />
            <MiniMetric label="Rejected" value={rejectedBookings} tone="danger" />
          </div>
        </SummaryCard>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
          <p className="mt-1 text-xs text-slate-500">Jump directly to the main administrative workflows.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <ActionCard
            to="/admin"
            title="Manage Tickets"
            description="Review, inspect, and update incident reports."
          />
          <ActionCard
            to="/admin/resources"
            title="Manage Resources"
            description="Maintain rooms, labs, venues, and campus assets."
          />
          <ActionCard
            to="/admin/bookings"
            title="Manage Bookings"
            description="Approve, reject, and monitor booking requests."
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Recent Tickets</h3>
            <Link to="/admin" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <p className="text-sm text-slate-400">No recent tickets</p>
          ) : (
            <div className="space-y-2">
              {recentTickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50"
                >
                  <div className="min-w-0 pr-3">
                    <p className="truncate text-sm font-semibold text-slate-800">{ticket.title}</p>
                    <p className="text-xs text-slate-400">
                      {ticket.category?.replace(/_/g, ' ') || 'No category'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                    {ticket.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-sm text-slate-400">No recent bookings</p>
          ) : (
            <div className="space-y-2">
              {recentBookings.map(booking => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                >
                  <div className="min-w-0 pr-3">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      Resource #{booking.resourceId}
                    </p>
                    <p className="text-xs text-slate-400">
                      {booking.bookingDate} · {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}