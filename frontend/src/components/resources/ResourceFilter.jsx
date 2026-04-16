import React, { useState } from 'react';

const ResourceFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    minCapacity: '',
    status: ''
  });

  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    onFilter(updated);
  };

  const handleReset = () => {
    const empty = { type: '', location: '', minCapacity: '', status: '' };
    setFilters(empty);
    onFilter(empty);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">🔍 Filter Resources</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Type filter */}
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Types</option>
          <option value="LAB">Lab</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>

        {/* Location filter */}
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleChange}
          placeholder="Location..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {/* Capacity filter */}
        <input
          type="number"
          name="minCapacity"
          value={filters.minCapacity}
          onChange={handleChange}
          placeholder="Min capacity..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {/* Status filter */}
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </div>

      {/* Reset button */}
      <button
        onClick={handleReset}
        className="mt-3 text-xs text-blue-500 hover:underline"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default ResourceFilter;