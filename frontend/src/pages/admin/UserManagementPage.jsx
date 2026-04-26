import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import AdminShell from '../../components/admin/AdminShell';
import RecordDrawer, { DrawerField } from '../../components/admin/RecordDrawer';

export default function UserManagementPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Drawer state
  const [drawer, setDrawer] = useState({
    open: false,
    record: null,
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.get('/auth/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [isAdmin]);

  const handleRoleChange = async (googleId, newRole) => {
    try {
      await apiClient.patch(
        `/auth/users/${googleId}/role?role=${newRole}`
      );
      fetchUsers();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  // ✅ Drawer handlers
  const openDrawer = (user) => {
    setDrawer({ open: true, record: user });
  };

  const closeDrawer = () => {
    setDrawer({ open: false, record: null });
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Access denied</h1>
        <p className="text-sm text-gray-500">Admin only page</p>
      </div>
    );
  }

  return (
    <AdminShell
      eyebrow="Admin workspace"
      title="User Management"
      description="Manage system users and their roles"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.googleId} className="border-t hover:bg-gray-50">
                  
                  {/* USER */}
                  <td className="px-4 py-3 flex items-center gap-2">
                    {u.picture && (
                      <img
                        src={u.picture}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="font-medium">{u.name}</span>
                  </td>

                  {/* EMAIL */}
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>

                  {/* ROLE */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100">
                      {u.role}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3 flex items-center gap-3">

                    {/* ROLE CHANGE */}
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleRoleChange(u.googleId, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="USER">USER</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>

                    {/* VIEW BUTTON (OPEN DRAWER) */}
                    <button
                      onClick={() => openDrawer(u)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No users found
            </div>
          )}
        </div>
      )}

      {/* ✅ DRAWER (USER DETAILS PANEL) */}
      <RecordDrawer
        open={drawer.open}
        onClose={closeDrawer}
        title={drawer.record?.name}
        subtitle={drawer.record?.email}
      >
        {drawer.record && (
          <>
            <DrawerField label="Name" value={drawer.record.name} />
            <DrawerField label="Email" value={drawer.record.email} />
            <DrawerField label="Role" value={drawer.record.role} />
            <DrawerField label="Google ID" value={drawer.record.googleId} />
          </>
        )}
      </RecordDrawer>

    </AdminShell>
  );
}