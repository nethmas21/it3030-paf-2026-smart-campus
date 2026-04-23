import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceApi } from '../../api/resourceApi';
import ResourceForm from '../../components/resources/ResourceForm';
import AdminShell from '../../components/admin/AdminShell';

const AdminResourcePage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const data = await resourceApi.getAll();
      setResources(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setMessage('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesStatus = !statusFilter || resource.status === statusFilter;
      const matchesSearch =
        !q ||
        resource.name?.toLowerCase().includes(q) ||
        resource.location?.toLowerCase().includes(q) ||
        resource.type?.toLowerCase().includes(q) ||
        String(resource.id).includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [resources, search, statusFilter]);

  const handleCreate = async (formData) => {
    await resourceApi.create(formData);
    setMessage('Resource created successfully.');
    setShowForm(false);
    loadResources();
  };

  const handleUpdate = async (formData) => {
    await resourceApi.update(editingResource.id, formData);
    setMessage('Resource updated successfully.');
    setEditingResource(null);
    setShowForm(false);
    loadResources();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      await resourceApi.delete(id);
      setMessage('Resource deleted successfully.');
      loadResources();
    } catch {
      setMessage('Failed to delete resource');
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingResource(null);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <AdminShell
      eyebrow="Admin workspace"
      title="Resource management"
      description="A denser inventory view for campus assets with enterprise-style records, filtering, and edit controls."
    >
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Total resources</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{resources.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Active</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {resources.filter((item) => item.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Inactive</p>
          <p className="mt-2 text-3xl font-semibold text-slate-600">
            {resources.filter((item) => item.status !== 'ACTIVE').length}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, name, type, or location"
          className="min-w-[280px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="UNDER_MAINTENANCE">Under maintenance</option>
        </select>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingResource(null);
          }}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add Resource
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-screen w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </h2>
            <ResourceForm
              onSubmit={editingResource ? handleUpdate : handleCreate}
              initialData={editingResource}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredResources.map((resource) => (
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
                  <div className="flex gap-3 text-xs font-medium">
                    <button onClick={() => navigate(`/resources/${resource.id}`)} className="text-slate-700 hover:text-slate-950">
                      View
                    </button>
                    <button onClick={() => handleEdit(resource)} className="text-amber-700 hover:text-amber-900">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(resource.id)} className="text-red-700 hover:text-red-900">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredResources.length === 0 && (
          <div className="py-12 text-center text-slate-400">No resources match the current filters.</div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminResourcePage;
