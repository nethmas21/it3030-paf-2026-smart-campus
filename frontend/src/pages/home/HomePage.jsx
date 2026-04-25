import { useAuth } from '../../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          What would you like to do today?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-5">
        <a href="/tickets/new" className="card hover:shadow-lg transition p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Create Ticket</h2>
          <p className="text-sm text-slate-500">Report an issue quickly</p>
        </a>

        <a href="/resources" className="card hover:shadow-lg transition p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Browse Resources</h2>
          <p className="text-sm text-slate-500">View labs, rooms, facilities</p>
        </a>

        <a href="/bookings/my" className="card hover:shadow-lg transition p-5">
          <h2 className="font-semibold text-slate-800 mb-1">My Bookings</h2>
          <p className="text-sm text-slate-500">Manage your reservations</p>
        </a>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Need something?</h3>
          <ul className="text-sm text-slate-600 space-y-2">
            <li><a href="/tickets" className="hover:underline">View all tickets</a></li>
            <li><a href="/bookings/new" className="hover:underline">Book a resource</a></li>
            <li><a href="/resources" className="hover:underline">Explore resources</a></li>
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Support</h3>
          <p className="text-sm text-slate-500">
            If something isn’t working, create a ticket and our team will help you.
          </p>
        </div>
      </div>
    </div>
  );
}