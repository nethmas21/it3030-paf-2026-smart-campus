import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  OPEN:        { cls: 'badge-blue',   bar: 'bg-primary-500', label: 'Open' },
  IN_PROGRESS: { cls: 'badge-yellow', bar: 'bg-warning-400', label: 'In Progress' },
  RESOLVED:    { cls: 'badge-green',  bar: 'bg-success-500', label: 'Resolved' },
  CLOSED:      { cls: 'badge-slate',  bar: 'bg-slate-300',   label: 'Closed' },
  REJECTED:    { cls: 'badge-red',    bar: 'bg-danger-500',  label: 'Rejected' },
};

const PRIORITY_CONFIG = {
  CRITICAL: { bar: 'bg-danger-600',  cls: 'priority-critical' },
  HIGH:     { bar: 'bg-danger-400',  cls: 'priority-high' },
  MEDIUM:   { bar: 'bg-warning-400', cls: 'priority-medium' },
  LOW:      { bar: 'bg-slate-300',   cls: 'priority-low' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTickets({ page: 0, size: 100 })
      .then(r => setTickets(r.data.data.content || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total         = tickets.length;
  const openCount     = tickets.filter(t => t.status === 'OPEN').length;
  const resolvedCount = tickets.filter(t => ['RESOLVED','CLOSED'].includes(t.status)).length;
  const resolvedRate  = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  const byStatus   = Object.entries(STATUS_CONFIG).map(([s, c]) => ({ ...c, status: s, count: tickets.filter(t => t.status === s).length }));
  const byPriority = ['CRITICAL','HIGH','MEDIUM','LOW'].map(p => ({ ...PRIORITY_CONFIG[p], priority: p, count: tickets.filter(t => t.priority === p).length }));
  const byCategory = Object.entries(tickets.reduce((a, t) => { a[t.category] = (a[t.category]||0)+1; return a; }, {})).sort((a,b) => b[1]-a[1]).slice(0, 6);
  const recent     = [...tickets].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);

  if (loading) return (
    <div className="page-wide">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_,i) => <div key={i} className="h-28 skeleton" />)}
      </div>
    </div>
  );

  return (
    <div className="page-wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name?.split(' ')[0]}</p>
        </div>
        <Link to="/tickets/new" className="btn-primary">New Ticket</Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tickets',    value: total,           color: 'text-slate-900' },
          { label: 'Open',             value: openCount,       color: 'text-primary-600' },
          { label: 'Resolved',         value: resolvedCount,   color: 'text-success-600' },
          { label: 'Resolution Rate',  value: `${resolvedRate}%`, color: 'text-accent-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={`stat-value ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Status breakdown */}
        <div className="card">
          <div className="card-header">
            <h3>Tickets by Status</h3>
            <span className="badge-slate">{total} total</span>
          </div>
          <div className="space-y-3.5">
            {byStatus.map(({ status, cls, bar, label, count }) => {
              const pct = total > 0 ? Math.round((count/total)*100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cls}>{label}</span>
                    <span className="text-sm font-bold text-slate-700">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="card">
          <div className="card-header">
            <h3>Tickets by Priority</h3>
            <span className="badge-slate">{total} total</span>
          </div>
          <div className="space-y-3.5">
            {byPriority.map(({ priority, cls, bar, count }) => {
              const pct = total > 0 ? Math.round((count/total)*100) : 0;
              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cls}>{priority}</span>
                    <span className="text-sm font-bold text-slate-700">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top categories */}
        <div className="card">
          <div className="card-header">
            <h3>Top Categories</h3>
          </div>
          {byCategory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
              </div>
              <p className="empty-title">No data yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {byCategory.map(([cat, count], i) => (
                <div key={cat} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-300 w-5 text-right">{i+1}</span>
                    <span className="text-sm text-slate-700 font-medium">{cat.replace(/_/g,' ')}</span>
                  </div>
                  <span className="badge-slate">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent tickets */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Tickets</h3>
            <Link to="/tickets" className="btn-link">View all</Link>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </div>
              <p className="empty-title">No tickets yet</p>
              <p className="empty-subtitle">Submit your first ticket</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recent.map(t => (
                <Link key={t.id} to={`/tickets/${t.id}`}
                  className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={STATUS_CONFIG[t.status]?.cls}>{STATUS_CONFIG[t.status]?.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}