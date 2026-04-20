import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  OPEN:        { bg: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  IN_PROGRESS: { bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  RESOLVED:    { bg: 'bg-green-500',  light: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  CLOSED:      { bg: 'bg-gray-400',   light: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200' },
  REJECTED:    { bg: 'bg-red-500',    light: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
};

const PRIORITY_COLORS = {
  LOW:      'bg-slate-100 text-slate-600',
  MEDIUM:   'bg-orange-100 text-orange-700',
  HIGH:     'bg-red-100 text-red-700',
  CRITICAL: 'bg-red-600 text-white',
};

const PRIORITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch up to 100 tickets for stats
        const res = await getTickets({ page: 0, size: 100 });
        setTickets(res.data.data.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const total = tickets.length;

  const byStatus = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'].map(s => ({
    status: s,
    count: tickets.filter(t => t.status === s).length,
    label: s.replace('_', ' '),
  }));

  const byPriority = PRIORITY_ORDER.map(p => ({
    priority: p,
    count: tickets.filter(t => t.priority === p).length,
  }));

  const byCategory = Object.entries(
    tickets.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Recent tickets
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Open rate
  const openCount     = tickets.filter(t => t.status === 'OPEN').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const openRate      = total > 0 ? Math.round((openCount / total) * 100) : 0;
  const resolvedRate  = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.name?.split(' ')[0]}! Here's your campus overview.
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New ticket
        </Link>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tickets"  value={total}         icon="📋" color="bg-white" />
        <StatCard label="Open"           value={openCount}     icon="🔓" color="bg-blue-50" textColor="text-blue-700" />
        <StatCard label="Resolved"       value={resolvedCount} icon="✅" color="bg-green-50" textColor="text-green-700" />
        <StatCard label="Resolution Rate" value={`${resolvedRate}%`} icon="📈" color="bg-purple-50" textColor="text-purple-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Status breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Tickets by Status</h2>
          <div className="space-y-3">
            {byStatus.map(({ status, count, label }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const c   = STATUS_COLORS[status];
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c.light} ${c.text} ${c.border}`}>
                      {label}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.bg} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Tickets by Priority</h2>
          <div className="space-y-3">
            {byPriority.map(({ priority, count }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${PRIORITY_COLORS[priority]}`}>
                      {priority}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Top categories */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Categories</h2>
          {byCategory.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No data yet</p>
          ) : (
            <div className="space-y-2">
              {byCategory.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{category.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent tickets */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Recent Tickets</h2>
            <Link to="/tickets" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {recentTickets.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No tickets yet</p>
          ) : (
            <div className="space-y-2">
              {recentTickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{ticket.title}</p>
                    <p className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLORS[ticket.status]?.light} ${STATUS_COLORS[ticket.status]?.text} ${STATUS_COLORS[ticket.status]?.border}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, textColor = 'text-gray-800' }) {
  return (
    <div className={`${color} rounded-xl border border-gray-100 shadow-sm p-5`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
    </div>
  );
}