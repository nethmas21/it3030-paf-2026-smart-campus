import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "../../api/ticketApi";
import { getMyBookings } from "../../api/bookingApi";

export default function UserDashboard() {
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTickets({ page: 0, size: 100 }),
      getMyBookings({ page: 0, size: 100 }),
    ])
      .then(([ticketRes, bookingRes]) => {
        setTickets(ticketRes.data.data.content || []);
        setBookings(bookingRes.data.data.content || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === "OPEN").length;
  const inProgressTickets = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolvedTickets = tickets.filter(t => ["RESOLVED", "CLOSED"].includes(t.status)).length;

  const pendingBookings = bookings.filter(b => b.status === "PENDING").length;
  const approvedBookings = bookings.filter(b => b.status === "APPROVED").length;
  const rejectedBookings = bookings.filter(b => b.status === "REJECTED").length;

  // ✅ SAME COLOR SYSTEM AS ADMIN
  const tones = {
    slate: "border-slate-200 bg-white text-slate-900",
    primary: "border-primary-100 bg-primary-50 text-primary-700",
    accent: "border-accent-100 bg-accent-50 text-accent-700",
    success: "border-success-100 bg-success-50 text-success-700",
    warning: "border-warning-100 bg-warning-50 text-warning-600",
    danger: "border-danger-100 bg-danger-50 text-danger-700",
  };

  const StatCard = ({ label, value, tone = "slate" }) => (
    <div className={`rounded-xl border px-5 py-4 shadow-soft ${tones[tone]}`}>
      <p className="text-xs uppercase font-semibold tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );

  const Mini = ({ label, value, tone = "slate" }) => (
    <div className={`rounded-lg border p-3 ${tones[tone]}`}>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  if (loading) {
    return <div className="p-6 text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">

      {/* HEADER */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
          USER OVERVIEW
        </p>
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-sm text-slate-500">
          Track your tickets and bookings
        </p>
      </div>

      {/* CARDS */}
      <div className="mb-6 grid md:grid-cols-3 gap-4">
        <StatCard label="My Tickets" value={totalTickets} tone="slate" />
        <StatCard label="My Bookings" value={bookings.length} tone="accent" />
        <StatCard label="Pending" value={pendingBookings} tone="warning" />
      </div>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-2 gap-5 mb-6">

        <div className="border rounded-xl bg-white p-5 shadow-soft">
          <h3 className="font-semibold mb-3">My Tickets</h3>
          <div className="grid grid-cols-3 gap-3">
            <Mini label="Open" value={openTickets} tone="primary" />
            <Mini label="Progress" value={inProgressTickets} tone="warning" />
            <Mini label="Resolved" value={resolvedTickets} tone="success" />
          </div>
        </div>

        <div className="border rounded-xl bg-white p-5 shadow-soft">
          <h3 className="font-semibold mb-3">My Bookings</h3>
          <div className="grid grid-cols-3 gap-3">
            <Mini label="Pending" value={pendingBookings} tone="warning" />
            <Mini label="Approved" value={approvedBookings} tone="success" />
            <Mini label="Rejected" value={rejectedBookings} tone="danger" />
          </div>
        </div>

      </div>

      {/* ACTIONS */}
      <div className="border rounded-xl bg-white p-5 shadow-soft">
        <h3 className="font-semibold mb-3">Quick Actions</h3>

        <div className="grid md:grid-cols-2 gap-3">
          <Link
            className="p-4 border rounded-lg hover:bg-primary-50 transition"
            to="/tickets/new"
          >
            Create Ticket
          </Link>

          <Link
            className="p-4 border rounded-lg hover:bg-primary-50 transition"
            to="/bookings/my"
          >
            View My Bookings
          </Link>
        </div>
      </div>

    </div>
  );
}