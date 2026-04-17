import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resourceApi } from '../../api/resourceApi';

const ResourceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await resourceApi.getById(id);
        setResource(data);
      } catch {
        navigate('/resources');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  if (!resource) return null;

  const statusColor = resource.status === 'ACTIVE'
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Back button */}
      <button
        onClick={() => navigate('/resources')}
        className="text-blue-500 text-sm mb-5 hover:underline"
      >
        ← Back to Resources
      </button>

      {/* Detail Card */}
      <div className="bg-white rounded-xl shadow-md p-6">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{resource.name}</h1>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusColor}`}>
            {resource.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium w-32">Type:</span>
            <span>{resource.type?.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-32">Location:</span>
            <span>📍 {resource.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-32">Capacity:</span>
            <span>👥 {resource.capacity} people</span>
          </div>
          {resource.availabilityWindows && (
            <div className="flex items-center gap-2">
              <span className="font-medium w-32">Availability:</span>
              <span>🕐 {resource.availabilityWindows}</span>
            </div>
          )}
          {resource.description && (
            <div className="flex items-start gap-2">
              <span className="font-medium w-32">Description:</span>
              <span>{resource.description}</span>
            </div>
          )}
        </div>

        {/* Book button */}
        <button
          className="mt-6 w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition font-medium"
          onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)}
        >
          Book This Resource
        </button>
      </div>
    </div>
  );
};

export default ResourceDetailPage;