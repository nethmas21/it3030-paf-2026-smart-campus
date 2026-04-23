import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminSections = [
  {
    label: 'Overview',
    items: [
      {
        to: '/admin',
        title: 'Operations',
        description: 'Tickets, user roles, and admin activity',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h6V5H4v8Zm10 6h6v-6h-6v6Zm0-14v4h6V5h-6Zm-10 14h6V9H4v10Z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        to: '/admin/resources',
        title: 'Resources',
        description: 'Rooms, labs, venues, and assets',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
          </svg>
        ),
      },
      {
        to: '/admin/bookings',
        title: 'Bookings',
        description: 'Approvals, rejects, and queue review',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
          </svg>
        ),
      },
    ],
  },
];

function isActivePath(currentPath, targetPath) {
  if (targetPath === '/admin') return currentPath === '/admin';
  return currentPath.startsWith(targetPath);
}

export default function AdminShell({ eyebrow = 'Admin workspace', title, description, children }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">Administration</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Campus control</h2>
            <p className="mt-1 text-sm text-slate-300">Operational tools for approvals, resources, and service flow.</p>
          </div>

          <div className="px-3 py-3">
            {adminSections.map((section) => (
              <div key={section.label} className="mb-4 last:mb-0">
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {section.label}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActivePath(location.pathname, item.to);

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-start gap-3 rounded-lg px-3 py-3 transition-colors ${
                          active
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            active
                              ? 'border-slate-700 bg-slate-800 text-slate-100'
                              : 'border-slate-200 bg-slate-50 text-slate-500'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-sm font-semibold ${active ? 'text-white' : 'text-slate-800'}`}>
                            {item.title}
                          </span>
                          <span className={`mt-0.5 block text-xs leading-5 ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-medium text-slate-500">Signed in as</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-slate-500">{user?.email || 'Admin access'}</p>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{eyebrow}</p>
          <div className="mt-2 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>
            </div>
          </div>
          <div className="pt-6">{children}</div>
        </div>
      </section>
    </div>
  );
}
