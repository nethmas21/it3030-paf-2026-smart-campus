import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../../api/ticketApi';
import { approveBooking, getAllBookings, rejectBooking } from '../../api/bookingApi';
import { resourceApi } from '../../api/resourceApi';
import apiClient from '../../api/apiClient';
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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tone}`}>{value}</p>
      {detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [error, setError] = useState('');
  const [drawer, setDrawer] = useState({ open: false, type: '', record: null });
  const [bookingDecisionNote, setBookingDecisionNote] = useState('');
  const [bookingActionLoading, setBookingActionLoading] = useState(false);

  const loadAdminRecords = async () => {
    setLoading(true);
    setError('');

    try {
      const [allTickets, allBookings, allUsers, allResources] = await Promise.all([
        fetchAllPages(getTickets),
        fetchAllPages(getAllBookings),
        apiClient.get('/auth/users'),
        resourceApi.getAll(),
      ]);

      setTickets(allTickets || []);
      setBookings(allBookings || []);
      setUsers(allUsers?.data?.data || []);
      setResources(Array.isArray(allResources) ? allResources : allResources?.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load admin records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadAdminRecords();
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

  const resourceSummary = useMemo(
    () => ({
      total: resources.length,
      active: resources.filter((item) => item.status === 'ACTIVE').length,
      inactive: resources.filter((item) => item.status !== 'ACTIVE').length,
    }),
    [resources]
  );

  const bookingSummary = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((item) => item.status === 'PENDING').length,
      approved: bookings.filter((item) => item.status === 'APPROVED').length,
    }),
    [bookings]
  );

  const ticketSummary = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((item) => item.status === 'OPEN').length,
      inProgress: tickets.filter((item) => item.status === 'IN_PROGRESS').length,
      critical: tickets.filter((item) => item.priority === 'CRITICAL').length,
    }),
    [tickets]
  );

  const openDrawer = (type, record) => {
    setDrawer({ open: true, type, record });
    setBookingDecisionNote(record?.decisionReason || '');
  };

  const closeDrawer = () => {
    setDrawer({ open: false, type: '', record: null });
    setBookingDecisionNote('');
    setBookingActionLoading(false);
  };

  const syncUpdatedBooking = (updatedBooking) => {
    setBookings((current) =>
      current.map((booking) => (booking.id === updatedBooking.id ? updatedBooking : booking))
    );
    setDrawer((current) => ({ ...current, record: updatedBooking }));
  };

  const handleApproveFromDrawer = async () => {
    if (!drawer.record) return;

    setBookingActionLoading(true);
    try {
      const response = await approveBooking(drawer.record.id, {
        reason: bookingDecisionNote.trim() || 'Approved by admin',
      });
      syncUpdatedBooking(response.data.data);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to approve booking');
    } finally {
      setBookingActionLoading(false);
    }
  };

  const handleRejectFromDrawer = async () => {
    if (!drawer.record) return;

    const reason = bookingDecisionNote.trim();
    if (!reason) {
      alert('Please enter a rejection reason.');
      return;
    }

    setBookingActionLoading(true);
    try {
      const response = await rejectBooking(drawer.record.id, { reason });
      syncUpdatedBooking(response.data.data);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to reject booking');
    } finally {
      setBookingActionLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-2 text-xl font-bold text-gray-900">Access denied</h1>
        <p className="text-sm text-gray-500">You need ADMIN role to access this page.</p>
        <Link to="/admin" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Return to admin
        </Link>
      </div>
    );
  }

  return (
    <AdminShell
      eyebrow="Admin workspace"
      title="Enterprise records console"
      description="A broader operational view of users, tickets, bookings, and resources in a denser administrative workspace."
    >
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Users" value={users.length} detail="All registered accounts" />
        <MetricCard label="Tickets" value={ticketSummary.total} detail={`${ticketSummary.open} open, ${ticketSummary.critical} critical`} />
        <MetricCard label="Bookings" value={bookingSummary.total} detail={`${bookingSummary.pending} pending approvals`} />
        <MetricCard label="Resources" value={resourceSummary.total} detail={`${resourceSummary.active} active assets`} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
        {[
          ['tickets', `Tickets (${filteredTickets.length})`],
          ['bookings', `Bookings (${bookings.length})`],
          ['resources', `Resources (${resources.length})`],
          ['users', `Users (${users.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'tickets' && (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <input
              value={filters.search}
              onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
              placeholder="Search ticket ID, title, category, or creator"
              className="min-w-[260px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}
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
              onChange={(e) => setFilters((current) => ({ ...current, priority: e.target.value }))}
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
                        <div className="text-xs text-slate-400">{ticket.description?.slice(0, 72) || 'No description'}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{ticket.createdBy || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{ticket.category?.replace(/_/g, ' ') || '-'}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="px-4 py-3"><TicketStatusBadge status={ticket.status} /></td>
                      <td className="px-4 py-3 text-slate-600">{ticket.assignedTechnicianName || '-'}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(ticket.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3 text-xs font-medium">
                          <button type="button" onClick={() => openDrawer('ticket', ticket)} className="text-slate-700 hover:text-slate-950">
                            Inspect
                          </button>
                          <Link to={`/tickets/${ticket.id}`} className="text-slate-700 hover:text-slate-950">
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTickets.length === 0 && <div className="py-12 text-center text-slate-400">No tickets match the current filters.</div>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard label="Total bookings" value={bookingSummary.total} detail="Full booking record set" />
            <MetricCard label="Pending" value={bookingSummary.pending} tone="text-amber-600" detail="Awaiting review" />
            <MetricCard label="Approved" value={bookingSummary.approved} tone="text-emerald-600" detail="Confirmed reservations" />
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Requested By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Attendees</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-500">#{booking.id}</td>
                    <td className="px-4 py-3 text-slate-700">#{booking.resourceId}</td>
                    <td className="px-4 py-3 text-slate-600">{booking.requestedBy}</td>
                    <td className="px-4 py-3 text-slate-600">{booking.purpose || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{booking.bookingDate}</td>
                    <td className="px-4 py-3 text-slate-600">{booking.startTime} - {booking.endTime}</td>
                    <td className="px-4 py-3 text-slate-600">{booking.expectedAttendees ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        booking.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700'
                          : booking.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : booking.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-600'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => openDrawer('booking', booking)} className="text-xs font-medium text-slate-700 hover:text-slate-950">
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <div className="py-12 text-center text-slate-400">No booking records found.</div>}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard label="Total resources" value={resourceSummary.total} detail="All managed assets" />
            <MetricCard label="Active" value={resourceSummary.active} tone="text-emerald-600" detail="Currently available" />
            <MetricCard label="Inactive" value={resourceSummary.inactive} tone="text-slate-600" detail="Unavailable or archived" />
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Capacity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Availability</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-500">#{resource.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{resource.name}</div>
                      <div className="text-xs text-slate-400">{resource.description || 'No description'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{resource.type?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-slate-600">{resource.location || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{resource.capacity ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{resource.availabilityWindows || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        resource.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {resource.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => openDrawer('resource', resource)} className="text-xs font-medium text-slate-700 hover:text-slate-950">
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {resources.length === 0 && <div className="py-12 text-center text-slate-400">No resources found.</div>}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Role Change</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((account) => (
                <tr key={account.googleId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {account.picture ? (
                        <img src={account.picture} alt="" className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                          {account.name?.slice(0, 1) || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-900">{account.name}</div>
                        <div className="text-xs text-slate-400">{account.googleId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{account.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        account.role === 'ADMIN'
                          ? 'bg-slate-900 text-white'
                          : account.role === 'TECHNICIAN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {account.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={account.role}
                      onChange={async (e) => {
                        try {
                          await apiClient.patch(`/auth/users/${account.googleId}/role?role=${e.target.value}`);
                          setUsers((current) =>
                            current.map((item) =>
                              item.googleId === account.googleId ? { ...item, role: e.target.value } : item
                            )
                          );
                        } catch (err) {
                          alert('Failed to update role');
                        }
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-slate-300"
                    >
                      <option value="USER">USER</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => openDrawer('user', account)} className="text-xs font-medium text-slate-700 hover:text-slate-950">
                        Inspect
                      </button>
                      {account.googleId !== user?.id ? (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Delete user ${account.name} (${account.email})?`)) return;
                            try {
                              await apiClient.delete(`/auth/users/${account.googleId}`);
                              setUsers((current) => current.filter((u) => u.googleId !== account.googleId));
                            } catch (err) {
                              alert(err?.response?.data?.message || 'Failed to delete user');
                            }
                          }}
                          className="text-xs font-medium text-red-700 hover:text-red-900"
                        >
                          Delete
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">You</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <RecordDrawer
        open={drawer.open}
        onClose={closeDrawer}
        title={
          drawer.type === 'ticket'
            ? drawer.record?.title || 'Ticket'
            : drawer.type === 'booking'
              ? `Booking #${drawer.record?.id || ''}`
              : drawer.type === 'resource'
                ? drawer.record?.name || 'Resource'
                : drawer.record?.name || 'User'
        }
        subtitle={
          drawer.type === 'ticket'
            ? `Ticket #${drawer.record?.id || ''}`
            : drawer.type === 'booking'
              ? drawer.record?.requestedBy
              : drawer.type === 'resource'
                ? drawer.record?.location
                : drawer.record?.email
        }
      >
        {drawer.type === 'ticket' && drawer.record && (
          <>
            <DrawerField label="Status" value={<TicketStatusBadge status={drawer.record.status} />} />
            <DrawerField label="Priority" value={<PriorityBadge priority={drawer.record.priority} />} />
            <DrawerField label="Creator" value={drawer.record.createdBy} />
            <DrawerField label="Category" value={drawer.record.category?.replace(/_/g, ' ')} />
            <DrawerField label="Assigned technician" value={drawer.record.assignedTechnicianName} />
            <DrawerField label="Created at" value={new Date(drawer.record.createdAt).toLocaleString()} />
            <DrawerField label="Description" value={drawer.record.description} />
          </>
        )}

        {drawer.type === 'booking' && drawer.record && (
          <>
            <DrawerField label="Status" value={drawer.record.status} />
            <DrawerField label="Resource ID" value={`#${drawer.record.resourceId}`} />
            <DrawerField label="Requester" value={drawer.record.requestedBy} />
            <DrawerField label="Booking date" value={drawer.record.bookingDate} />
            <DrawerField label="Time window" value={`${drawer.record.startTime} - ${drawer.record.endTime}`} />
            <DrawerField label="Expected attendees" value={drawer.record.expectedAttendees} />
            <DrawerField label="Purpose" value={drawer.record.purpose} />
            <DrawerField label="Decision reason" value={drawer.record.decisionReason} />
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Admin action</p>
              <textarea
                value={bookingDecisionNote}
                onChange={(e) => setBookingDecisionNote(e.target.value)}
                rows={4}
                placeholder="Add approval note or rejection reason"
                className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              />
              {drawer.record.status === 'PENDING' ? (
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={handleApproveFromDrawer}
                    disabled={bookingActionLoading}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {bookingActionLoading ? 'Working...' : 'Approve Booking'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectFromDrawer}
                    disabled={bookingActionLoading}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {bookingActionLoading ? 'Working...' : 'Reject Booking'}
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">This booking has already been processed.</p>
              )}
            </div>
          </>
        )}

        {drawer.type === 'resource' && drawer.record && (
          <>
            <DrawerField label="Status" value={drawer.record.status} />
            <DrawerField label="Type" value={drawer.record.type?.replace(/_/g, ' ')} />
            <DrawerField label="Location" value={drawer.record.location} />
            <DrawerField label="Capacity" value={drawer.record.capacity} />
            <DrawerField label="Availability" value={drawer.record.availabilityWindows} />
            <DrawerField label="Description" value={drawer.record.description} />
            <DrawerField label="Created at" value={drawer.record.createdAt ? new Date(drawer.record.createdAt).toLocaleString() : '-'} />
          </>
        )}

        {drawer.type === 'user' && drawer.record && (
          <>
            <DrawerField label="Role" value={drawer.record.role} />
            <DrawerField label="Email" value={drawer.record.email} />
            <DrawerField label="Google ID" value={drawer.record.googleId} />
            <DrawerField
              label="Profile image"
              value={
                drawer.record.picture ? (
                  <img src={drawer.record.picture} alt="" className="h-16 w-16 rounded-full border border-slate-200 object-cover" />
                ) : (
                  'No image'
                )
              }
            />
          </>
        )}
      </RecordDrawer>
    </AdminShell>
  );
}
