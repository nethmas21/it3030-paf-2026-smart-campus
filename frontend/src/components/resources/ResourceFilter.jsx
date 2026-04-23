import React, { useState } from 'react';

// Member 1 - Peshan Pasindu
// ResourceFilter Component - Filter bar for campus resources

const ResourceFilter = ({ onFilter }) => {

  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [status, setStatus] = useState('');

  const handleSearch = () => {
    // Build filters object - only include non-empty values
    const filters = {};
    if (type) filters.type = type;
    if (location.trim()) filters.location = location.trim();
    if (minCapacity) filters.minCapacity = parseInt(minCapacity, 10);
    if (status) filters.status = status;
    onFilter(filters);
  };

  const handleReset = () => {
    setType('');
    setLocation('');
    setMinCapacity('');
    setStatus('');
    onFilter({});
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">🔍 Filter Resources</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {/* Type dropdown */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Types</option>
          <option value="LAB">Lab</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>

        {/* Location input */}
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {/* Min Capacity input */}
        <input
          type="number"
          value={minCapacity}
          onChange={(e) => setMinCapacity(e.target.value)}
          placeholder="Min capacity..."
          min="1"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {/* Status dropdown */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </div>

      {/* Search and Reset buttons */}
      <div className="flex gap-3 mt-3 items-center">
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-blue-600 transition font-medium"
        >
          🔍 Search
        </button>
        <button
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-red-500 transition"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ResourceFilter;