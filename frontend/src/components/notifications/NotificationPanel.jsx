import { useEffect, useMemo, useState } from 'react';
import {
  deleteNotification,
  getNotifications,
  markNotificationAsRead,
} from '../../api/notificationApi';

const TYPE_STYLES = {
  BOOKING: 'bg-blue-50 text-blue-700 border-blue-100',
  TICKET: 'bg-amber-50 text-amber-700 border-amber-100',
  COMMENT: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.status === 'UNREAD').length,
    [notifications]
  );

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    const res = await markNotificationAsRead(id);
    setNotifications((items) =>
      items.map((item) => (item.id === id ? res.data.data : item))
    );
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    setNotifications((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
      >
        Notifications
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-5 font-semibold">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden z-30">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
            <button
              type="button"
              onClick={fetchNotifications}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No notifications yet</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border-b border-gray-50 last:border-b-0 ${
                    item.status === 'UNREAD' ? 'bg-slate-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold border rounded-full ${TYPE_STYLES[item.type]}`}>
                        {item.type}
                      </span>
                      <p className="mt-2 text-sm text-gray-800">{item.message}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {item.status === 'UNREAD' && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(item.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
