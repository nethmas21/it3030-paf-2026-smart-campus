import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceApi } from '../../api/resourceApi';
import ResourceCard from '../../components/resources/ResourceCard';
import ResourceFilter from '../../components/resources/ResourceFilter';

const ResourceListPage = () => {
  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      if (Object.keys(filters).every(k => !filters[k])) {
        setAllResources(data);
      }
    } catch (err) {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters) => {
    loadResources(filters);
  };

  const handleView = (id) => {
    navigate(`/resources/${id}`);
  };

   // Count resources by type
  const typeCounts = allResources.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});


  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">Loading resources...</div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center mt-10">{error}</div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Campus Resources</h1>
        <p className="text-gray-500 text-sm mt-1">
          Browse available facilities and equipment
        </p>
      </div>

       {/* Type Count Summary Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(typeCounts).map(([type, count]) => (
          <span
            key={type}
            className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100"
          >
            {type.replace('_', ' ')}: {count}
          </span>
        ))}
      </div>
      

      {/* Filter Bar */}
      <ResourceFilter onFilter={handleFilter} />

      {/* Resource Count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {resources.length} resource{resources.length !== 1 ? 's' : ''}
      </p>

      {/* Resource Grid */}
      {resources.length === 0 ? (
        <div className="text-center text-gray-400 mt-16">
          <p className="text-4xl mb-3">📭</p>
          <p>No resources found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceListPage;