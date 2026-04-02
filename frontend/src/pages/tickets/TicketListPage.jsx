import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';
import TicketStatusBadge from '../../components/tickets/TicketStatusBadge';
import PriorityBadge from '../../components/tickets/PriorityBadge';

const STATUSES   = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'];
const CATEGORIES = ['ELECTRICAL','PLUMBING','HVAC','IT_EQUIPMENT','FURNITURE','SECURITY','CLEANING','STRUCTURAL','OTHER'];
const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];

export default function TicketListPage() {
  const { user } = useAuth();
  const isAdmin  = user?.roles?.includes('ADMIN');

  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    status: '', category: '', priority: '',
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (filters.status)   params.status   = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.priority) params.priority = filters.priority;

      const res = await getTickets(params);
      setTickets(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [page, filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({ status: '', category: '', priority: '' });
    setPage(0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'All Tickets' : 'My Tickets'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin ? 'View and manage all incident tickets' : 'Track your submitted incidents'}
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New ticket
        </Link>
      </div>

      {/* Filters (admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>

          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
          </select>

          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          {(filters.status || filters.category || filters.priority) && (
            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-800 underline">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-medium">No tickets found</p>
          <p className="text-sm mt-1">Submit a new ticket to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <p className="font-medium text-gray-900 truncate">{ticket.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {ticket.category.replace('_',' ')} · {ticket.location || 'No location'}
                    {ticket.assignedTechnicianName && ` · Assigned to ${ticket.assignedTechnicianName}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <TicketStatusBadge status={ticket.status} />
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}