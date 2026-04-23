import { useEffect, useMemo, useState } from 'react';
import { approveBooking, getAllBookings, rejectBooking } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import AdminShell from '../../components/admin/AdminShell';

async function fetchAllBookingsPaged(status = '') {
  const first = await getAllBookings({ page: 0, size: 100, ...(status ? { status } : {}) });
  const firstPage = first?.data?.data;
  const content = firstPage?.content || [];
  const totalPages = firstPage?.totalPages || 1;

  if (totalPages <= 1) return content;

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getAllBookings({ page: index + 1, size: 100, ...(status ? { status } : {}) })
    )
  );

  return [
    ...content,
    ...remaining.flatMap((response) => response?.data?.data?.content || []),
  ];
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export default function AdminBookingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const records = await fetchAllBookingsPaged(status);
      setBookings(records);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(err?.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchBookings();
  }, [status, isAdmin]);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (!q) return true;
      return (
        String(booking.id).includes(q) ||
        String(booking.resourceId).includes(q) ||
        booking.requestedBy?.toLowerCase().includes(q) ||
        booking.purpose?.toLowerCase().includes(q)
      );
    });
  }, [bookings, search]);

  const handleApprove = async (id) => {
    try {
      await approveBooking(id, { reason: 'Approved by admin' });
      fetchBookings();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason');
    if (reason === null) return;

    try {
      await rejectBooking(id, { reason });
      fetchBookings();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to reject booking');
    }
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
      title="Booking approvals"
      description="Review the full booking ledger with denser controls for approvals, rejects, and search."
    >
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Total bookings</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{bookings.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Pending</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">
            {bookings.filter((item) => item.status === 'PENDING').length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Approved</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {bookings.filter((item) => item.status === 'APPROVED').length}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by booking, resource, requester, or purpose"
          className="min-w-[280px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button
          onClick={() => {
            setStatus('');
            setSearch('');
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-white"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Requester</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-500">#{booking.id}</td>
                  <td className="px-4 py-3 text-slate-700">#{booking.resourceId}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{booking.requestedBy}</td>
                  <td className="px-4 py-3 text-slate-600">{booking.purpose || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{booking.bookingDate}</td>
                  <td className="px-4 py-3 text-slate-600">{booking.startTime} - {booking.endTime}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{booking.decisionReason || '-'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-4 py-3">
                    {booking.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          className="text-xs font-medium text-red-700 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="py-12 text-center text-slate-400">No bookings match the current filters.</div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
