import React, { useEffect, useState } from 'react';
import { resourceApi } from '../../api/resourceApi';
import ResourceCard from '../../components/resources/ResourceCard';
import ResourceForm from '../../components/resources/ResourceForm';
import { useNavigate } from 'react-router-dom';

const AdminResourcePage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const data = await resourceApi.getAll();
      setResources(data);
    } catch {
      setMessage('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await resourceApi.create(formData);
      setMessage('✅ Resource created successfully!');
      setShowForm(false);
      loadResources();
    } catch {
      setMessage('❌ Failed to create resource');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await resourceApi.update(editingResource.id, formData);
      setMessage('✅ Resource updated successfully!');
      setEditingResource(null);
      setShowForm(false);
      loadResources();
    } catch {
      setMessage('❌ Failed to update resource');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await resourceApi.delete(id);
      setMessage('✅ Resource deleted successfully!');
      loadResources();
    } catch {
      setMessage('❌ Failed to delete resource');
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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Resources</h1>
          <p className="text-gray-500 text-sm mt-1">Admin panel — add, edit, delete resources</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingResource(null); }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
        >
          + Add Resource
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border">
          {message}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
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

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="text-center text-gray-400 mt-16">
          <p className="text-4xl mb-3">📭</p>
          <p>No resources yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onView={(id) => navigate(`/resources/${id}`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminResourcePage;