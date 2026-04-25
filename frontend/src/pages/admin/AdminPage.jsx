import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';
import TicketStatusBadge from '../../components/tickets/TicketStatusBadge';
import PriorityBadge from '../../components/tickets/PriorityBadge';
import AdminShell from '../../components/admin/AdminShell';
import RecordDrawer, { DrawerField } from '../../components/admin/RecordDrawer';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

async function fetchAllPages(fetchPage, extraParams = {}) {
  const first = await fetchPage({ page: 0, size: 100, ...extraParams });
  const firstPage = first?.data?.data;
  const content = firstPage?.content || [];
  const totalPages = firstPage?.totalPages || 1;

  if (totalPages <= 1) return content;

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchPage({ page: index + 1, size: 100, ...extraParams })
    )
  );

  return [
    ...content,
    ...remaining.flatMap((response) => response?.data?.data?.content || []),
  ];
}

function MetricCard({ label, value, tone = 'text-slate-900', detail }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-semibold ${tone}`}>{value}</p>
      {detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [error, setError] = useState('');
  const [drawer, setDrawer] = useState({ open: false, record: null });

  const loadTickets = async () => {
    setLoading(true);
    setError('');

    try {
      const allTickets = await fetchAllPages(getTickets);
      setTickets(allTickets || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadTickets();
  }, [isAdmin]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = !filters.status || ticket.status === filters.status;
      const matchesPriority = !filters.priority || ticket.priority === filters.priority;

      const q = filters.search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        ticket.title?.toLowerCase().includes(q) ||
        ticket.category?.toLowerCase().includes(q) ||
        String(ticket.id).includes(q) ||
        ticket.createdBy?.toLowerCase().includes(q);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tickets, filters]);

  const ticketSummary = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((item) => item.status === 'OPEN').length,
      inProgress: tickets.filter((item) => item.status === 'IN_PROGRESS').length,
      resolved: tickets.filter((item) => item.status === 'RESOLVED').length,
      rejected: tickets.filter((item) => item.status === 'REJECTED').length,
      critical: tickets.filter((item) => item.priority === 'CRITICAL').length,
    }),
    [tickets]
  );

  const openDrawer = (ticket) => {
    setDrawer({ open: true, record: ticket });
  };

  const closeDrawer = () => {
    setDrawer({ open: false, record: null });
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-2 text-xl font-bold text-gray-900">Access denied</h1>
        <p className="text-sm text-gray-500">You need ADMIN role to access this page.</p>
      </div>
    );
  }

  return (
    <AdminShell
      eyebrow="Admin workspace"
      title="Ticket management"
      description="Manage campus incident reports, review priorities, inspect details, and track ticket progress."
    >
      {/* Ticket Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Tickets" value={ticketSummary.total} detail="All ticket records" />
        <MetricCard label="Open" value={ticketSummary.open} tone="text-blue-600" detail="Needs attention" />
        <MetricCard label="In Progress" value={ticketSummary.inProgress} tone="text-amber-600" detail="Being handled" />
        <MetricCard label="Resolved" value={ticketSummary.resolved} tone="text-emerald-600" detail="Completed issues" />
        <MetricCard label="Rejected" value={ticketSummary.rejected} tone="text-red-600" detail="Rejected reports" />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <input
          value={filters.search}
          onChange={(e) =>
            setFilters((current) => ({ ...current, search: e.target.value }))
          }
          placeholder="Search ticket ID, title, category, or creator"
          className="min-w-[260px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        />

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((current) => ({ ...current, status: e.target.value }))
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) =>
            setFilters((current) => ({ ...current, priority: e.target.value }))
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>

        <button
          onClick={() => setFilters({ status: '', priority: '', search: '' })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-white"
        >
          Reset
        </button>
      </div>

      {/* Ticket Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Creator</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Technician</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-500">#{ticket.id}</td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{ticket.title}</div>
                    <div className="text-xs text-slate-400">
                      {ticket.description?.slice(0, 72) || 'No description'}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-600">{ticket.createdBy || '-'}</td>

                  <td className="px-4 py-3 text-slate-600">
                    {ticket.category?.replace(/_/g, ' ') || '-'}
                  </td>

                  <td className="px-4 py-3">
                    <PriorityBadge priority={ticket.priority} />
                  </td>

                  <td className="px-4 py-3">
                    <TicketStatusBadge status={ticket.status} />
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {ticket.assignedTechnicianName || '-'}
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => openDrawer(ticket)}
                        className="text-slate-700 hover:text-slate-950"
                      >
                        Inspect
                      </button>

                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-slate-700 hover:text-slate-950"
                      >
                        Open
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTickets.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              No tickets match the current filters.
            </div>
          )}
        </div>
      )}

      {/* Ticket Drawer */}
      <RecordDrawer
        open={drawer.open}
        onClose={closeDrawer}
        title={drawer.record?.title || 'Ticket'}
        subtitle={`Ticket #${drawer.record?.id || ''}`}
      >
        {drawer.record && (
          <>
            <DrawerField label="Status" value={<TicketStatusBadge status={drawer.record.status} />} />
            <DrawerField label="Priority" value={<PriorityBadge priority={drawer.record.priority} />} />
            <DrawerField label="Creator" value={drawer.record.createdBy} />
            <DrawerField label="Category" value={drawer.record.category?.replace(/_/g, ' ')} />
            <DrawerField label="Assigned technician" value={drawer.record.assignedTechnicianName} />
            <DrawerField
              label="Created at"
              value={drawer.record.createdAt ? new Date(drawer.record.createdAt).toLocaleString() : '-'}
            />
            <DrawerField label="Description" value={drawer.record.description} />
          </>
        )}
      </RecordDrawer>
    </AdminShell>
  );
}