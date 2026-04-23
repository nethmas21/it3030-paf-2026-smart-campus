import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resourceApi } from "../../api/resourceApi";
import { useAuth } from "../../context/AuthContext";
import ResourceCard from "../../components/resources/ResourceCard";
import ResourceFilter from "../../components/resources/ResourceFilter";
import ResourceForm from "../../components/resources/ResourceForm";

const ResourceListPage = () => {
  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  // Load all resources when page opens
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await resourceApi.getAll(filters);
      setResources(data);
      // Save all resources for counting
      if (Object.keys(filters).every((k) => !filters[k])) {
        setAllResources(data);
      }
    } catch (err) {
      setError("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters) => {
    loadResources(filters);
  };

  const handleCreate = async (formData) => {
    try {
      await resourceApi.create(formData);
      setMessage("✅ Resource created successfully!");
      setShowForm(false);
      loadResources();
    } catch (err) {
      setMessage("❌ Failed to create resource");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await resourceApi.update(editingResource.id, formData);
      setMessage("✅ Resource updated successfully!");
      setEditingResource(null);
      setShowForm(false);
      loadResources();
    } catch (err) {
      setMessage("❌ Failed to update resource");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?"))
      return;
    try {
      await resourceApi.delete(id);
      setMessage("✅ Resource deleted successfully!");
      loadResources();
    } catch (err) {
      setMessage("❌ Failed to delete resource");
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

  const handleView = (id) => {
    navigate(`/resources/${id}`);
  };

  // Count resources by type
  const typeCounts = allResources.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading resources...</div>
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Campus Resources</h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse available facilities and equipment
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingResource(null);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
          >
            + Add Resource
          </button>
        )}
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
              {editingResource ? "Edit Resource" : "Add New Resource"}
            </h2>
            <ResourceForm
              onSubmit={editingResource ? handleUpdate : handleCreate}
              initialData={editingResource}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Type Count Summary Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(typeCounts).map(([type, count]) => (
          <span
            key={type}
            className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100"
          >
            {type.replace("_", " ")}: {count}
          </span>
        ))}
      </div>

      {/* Filter Bar */}
      <ResourceFilter onFilter={handleFilter} />

      {/* Resource Count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {resources.length} resource{resources.length !== 1 ? "s" : ""}
      </p>

      {/* Resource Grid */}
      {resources.length === 0 ? (
        <div className="text-center text-gray-400 mt-16">
          <p className="text-5xl mb-3">🔍</p>
          <p className="text-gray-600 font-medium mb-1">
            No resources match your filters
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Try adjusting or clearing your search filters
          </p>
          <button
            onClick={() => loadResources()}
            className="bg-blue-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Clear Filters & Show All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onView={handleView}
              onEdit={isAdmin ? handleEdit : null}
              onDelete={isAdmin ? handleDelete : null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceListPage;
