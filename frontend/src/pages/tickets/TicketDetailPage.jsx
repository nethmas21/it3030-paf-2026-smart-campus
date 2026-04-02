import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTicketById, updateTicketStatus,
  assignTechnician, deleteTicket,
} from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';
import TicketStatusBadge from '../../components/tickets/TicketStatusBadge';
import PriorityBadge from '../../components/tickets/PriorityBadge';
import CommentSection from '../../components/tickets/CommentSection';

const NEXT_STATUSES = {
  OPEN:        ['IN_PROGRESS','REJECTED'],
  IN_PROGRESS: ['RESOLVED','REJECTED'],
  RESOLVED:    ['CLOSED'],
  CLOSED:      [],
  REJECTED:    [],
};

export default function TicketDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const isAdmin   = user?.roles?.includes('ADMIN');
  const isTech    = user?.roles?.includes('TECHNICIAN') || isAdmin;

  const [ticket, setTicket]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Status update panel
  const [statusForm, setStatusForm] = useState({ status: '', resolutionNotes: '', rejectionReason: '' });
  const [statusLoading, setStatusLoading] = useState(false);

  // Assign technician panel
  const [assignForm, setAssignForm]     = useState({ technicianId: '', technicianName: '' });
  const [assignLoading, setAssignLoading] = useState(false);

  const loadTicket = async () => {
    try {
      const res = await getTicketById(id);
      setTicket(res.data.data);
    } catch (err) {
      setError(err.response?.status === 403 ? 'Access denied' : 'Ticket not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTicket(); }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusForm.status) return;
    setStatusLoading(true);
    try {
      await updateTicketStatus(id, statusForm);
      await loadTicket();
      setStatusForm({ status: '', resolutionNotes: '', rejectionReason: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    try {
      await assignTechnician(id, assignForm);
      await loadTicket();
      setAssignForm({ technicianId: '', technicianName: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign technician');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this ticket?')) return;
    try {
      await deleteTicket(id);
      navigate('/tickets');
    } catch {
      alert('Failed to delete ticket');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={() => navigate('/tickets')} className="mt-4 text-sm text-blue-600 hover:underline">
          Back to tickets
        </button>
      </div>
    );
  }

  const nextStatuses = NEXT_STATUSES[ticket.status] || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

      {/* Back */}
      <button onClick={() => navigate('/tickets')} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
        ← Back to tickets
      </button>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
              <TicketStatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
          </div>
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1 shrink-0"
            >
              Delete
            </button>
          )}
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-5">{ticket.description}</p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm border-t pt-4">
          <Detail label="Category"   value={ticket.category.replace('_',' ')} />
          <Detail label="Location"   value={ticket.location || '—'} />
          <Detail label="Contact"    value={ticket.preferredContact || '—'} />
          <Detail label="Reported by" value={ticket.createdBy} />
          <Detail label="Technician" value={ticket.assignedTechnicianName || 'Unassigned'} />
          <Detail label="Created"    value={new Date(ticket.createdAt).toLocaleString()} />
          {ticket.resolvedAt && (
            <Detail label="Resolved" value={new Date(ticket.resolvedAt).toLocaleString()} />
          )}
        </div>

        {ticket.resolutionNotes && (
          <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-700 mb-1">Resolution notes</p>
            <p className="text-sm text-green-800">{ticket.resolutionNotes}</p>
          </div>
        )}

        {ticket.rejectionReason && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-700 mb-1">Rejection reason</p>
            <p className="text-sm text-red-800">{ticket.rejectionReason}</p>
          </div>
        )}

        {/* Attachments */}
        {ticket.attachmentPaths?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Attachments</p>
            <div className="flex gap-2 flex-wrap">
              {ticket.attachmentPaths.map((path, i) => (
                <a
                  key={i}
                  href={`http://localhost:8081/uploads/${path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline border border-blue-100 rounded px-2 py-1 bg-blue-50"
                >
                  Attachment {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status update — Technician / Admin */}
      {isTech && nextStatuses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Update status</h2>
          <form onSubmit={handleStatusUpdate} className="space-y-3">
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm((p) => ({ ...p, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select new status</option>
              {nextStatuses.map((s) => (
                <option key={s} value={s}>{s.replace('_',' ')}</option>
              ))}
            </select>

            {statusForm.status === 'RESOLVED' && (
              <textarea
                placeholder="Resolution notes (required for resolved)"
                value={statusForm.resolutionNotes}
                onChange={(e) => setStatusForm((p) => ({ ...p, resolutionNotes: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {statusForm.status === 'REJECTED' && (
              <input
                type="text"
                placeholder="Rejection reason"
                value={statusForm.rejectionReason}
                onChange={(e) => setStatusForm((p) => ({ ...p, rejectionReason: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            <button
              type="submit"
              disabled={statusLoading || !statusForm.status}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {statusLoading ? 'Updating...' : 'Update status'}
            </button>
          </form>
        </div>
      )}

      {/* Assign technician — Admin only */}
      {isAdmin && !ticket.assignedTechnicianId && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Assign technician</h2>
          <form onSubmit={handleAssign} className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Technician ID"
              value={assignForm.technicianId}
              onChange={(e) => setAssignForm((p) => ({ ...p, technicianId: e.target.value }))}
              className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Technician name"
              value={assignForm.technicianName}
              onChange={(e) => setAssignForm((p) => ({ ...p, technicianName: e.target.value }))}
              className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={assignLoading || !assignForm.technicianId || !assignForm.technicianName}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignLoading ? 'Assigning...' : 'Assign'}
            </button>
          </form>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <CommentSection
          ticketId={id}
          comments={ticket.comments || []}
          onRefresh={loadTicket}
        />
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  );
}