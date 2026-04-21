import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';
import TicketStatusBadge from '../../components/tickets/TicketStatusBadge';
import PriorityBadge from '../../components/tickets/PriorityBadge';

const STATUSES   = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'];
const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];
const CATEGORIES = [
  'EXAM_ISSUE','GRADE_ISSUE','LECTURE_ISSUE','TIMETABLE_ISSUE','MODULE_ISSUE','ASSIGNMENT_ISSUE',
  'REGISTRATION','STUDENT_RECORD','FEE_PAYMENT',
  'IT_EQUIPMENT','NETWORK','ELECTRICAL','PLUMBING','HVAC','CLASSROOM','LABORATORY','LIBRARY','SECURITY','CLEANING','OTHER'
];

const STATS = [
  { label: 'Open',        status: 'OPEN',        cls: 'text-primary-600 bg-primary-50 border-primary-200' },
  { label: 'In Progress', status: 'IN_PROGRESS',  cls: 'text-warning-600 bg-warning-50 border-warning-100' },
  { label: 'Resolved',    status: 'RESOLVED',     cls: 'text-success-600 bg-success-50 border-success-100' },
  { label: 'Closed',      status: 'CLOSED',       cls: 'text-slate-500 bg-slate-50 border-slate-200' },
  { label: 'Rejected',    status: 'REJECTED',     cls: 'text-danger-600 bg-danger-50 border-danger-100' },
];

export default function TicketListPage() {
  const { user }  = useAuth();
  const isAdmin   = user?.roles?.includes('ADMIN');

  const [tickets, setTickets]         = useState([]);
  const [allTickets, setAllTickets]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [search, setSearch]           = useState('');
  const [filters, setFilters]         = useState({ status: '', category: '', priority: '' });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
      const res = await getTickets(params);
      setAllTickets(res.data.data.content);
      setTickets(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch { setError('Failed to load tickets'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, [page, filters]);

  useEffect(() => {
    if (!search.trim()) { setTickets(allTickets); return; }
    const q = search.toLowerCase();
    setTickets(allTickets.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().replace(/_/g,' ').includes(q)
    ));
  }, [search, allTickets]);

  const stats = STATS.map(s => ({ ...s, count: allTickets.filter(t => t.status === s.status).length }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'All Tickets' : 'My Tickets'}</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Manage all campus incident reports' : 'Track your submitted issues'}
          </p>
        </div>
        <Link to="/tickets/new" className="btn-primary">New Ticket</Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {stats.map(s => (
          <div key={s.status} className={`rounded-xl border px-4 py-3 text-center ${s.cls}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-semibold mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          placeholder="Search tickets by title, description, location or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Filters — admin only */}
      {isAdmin && (
        <div className="card-sm mb-4 flex flex-wrap gap-3 items-center">
          <select className="select w-auto" value={filters.status}
            onChange={e => { setFilters(p => ({...p, status: e.target.value})); setPage(0); }}>
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
          <select className="select w-auto" value={filters.category}
            onChange={e => { setFilters(p => ({...p, category: e.target.value})); setPage(0); }}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
          </select>
          <select className="select w-auto" value={filters.priority}
            onChange={e => { setFilters(p => ({...p, priority: e.target.value})); setPage(0); }}>
            <option value="">All priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {(filters.status || filters.category || filters.priority || search) && (
            <button onClick={() => { setFilters({status:'',category:'',priority:''}); setSearch(''); setPage(0); }}
              className="text-xs font-semibold text-danger-600 hover:text-danger-700">
              Clear filters
            </button>
          )}
        </div>
      )}

      {error && <div className="alert-error mb-4">{error}</div>}

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_,i) => <div key={i} className="h-[72px] skeleton" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p className="empty-title">No tickets found</p>
            <p className="empty-subtitle">{search ? 'Try a different search term' : 'Create your first ticket to get started'}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map(ticket => (
            <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="card-hover block">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-300">#{ticket.id}</span>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate">{ticket.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ticket.category?.replace(/_/g,' ')}
                    {ticket.location ? ` · ${ticket.location}` : ''}
                    {ticket.assignedTechnicianName ? ` · ${ticket.assignedTechnicianName}` : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <TicketStatusBadge status={ticket.status} />
                  <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0} className="btn-secondary btn-sm">Previous</button>
          <span className="text-sm text-slate-500 font-medium">Page {page+1} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page===totalPages-1} className="btn-secondary btn-sm">Next</button>
        </div>
      )}
    </div>
  );
}