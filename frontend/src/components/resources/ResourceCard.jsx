import React from 'react';

const ResourceCard = ({ resource, onView, onEdit, onDelete }) => {

  // Color based on status
  const statusColor = resource.status === 'ACTIVE'
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';

  // Color based on type
  const typeColor = {
    LAB: 'bg-blue-100 text-blue-700',
    LECTURE_HALL: 'bg-purple-100 text-purple-700',
    MEETING_ROOM: 'bg-yellow-100 text-yellow-700',
    EQUIPMENT: 'bg-orange-100 text-orange-700'
  }[resource.type] || 'bg-gray-100 text-gray-700';

  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow border border-gray-100">
      
      {/* Top badges */}
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeColor}`}>
          {resource.type?.replace('_', ' ')}
        </span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>
          {resource.status}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-lg font-bold text-gray-800 mb-1">{resource.name}</h3>

      {/* Location */}
      <p className="text-sm text-gray-500 mb-1">
        📍 {resource.location}
      </p>

      {/* Capacity */}
      <p className="text-sm text-gray-500 mb-1">
        👥 Capacity: {resource.capacity}
      </p>

      {/* Availability */}
      {resource.availabilityWindows && (
        <p className="text-sm text-gray-500 mb-3">
          🕐 {resource.availabilityWindows}
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onView(resource.id)}
          className="flex-1 bg-blue-500 text-white text-sm py-1.5 rounded-lg hover:bg-blue-600 transition"
        >
          View
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(resource)}
            className="flex-1 bg-yellow-400 text-white text-sm py-1.5 rounded-lg hover:bg-yellow-500 transition"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(resource.id)}
            className="flex-1 bg-red-500 text-white text-sm py-1.5 rounded-lg hover:bg-red-600 transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;