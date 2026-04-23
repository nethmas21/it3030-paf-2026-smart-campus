import React, { useState, useEffect } from "react";



const ResourceForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "LAB",
    capacity: "",
    location: "",
    availabilityWindows: "",
    status: "ACTIVE",
    description: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // If editing, fill form with existing data
  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // Clear error when user types
    // Validate field on change and clear/set field-level error
    const fieldError = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // run full validation
    const allErrors = validateAll();
    setFieldErrors(allErrors);
    // If any errors exist, show first and abort
    if (Object.keys(allErrors).length) {
      setError(Object.values(allErrors)[0]);
      return;
    }
    setSubmitting(true);

    // Convert capacity to number and handle empty availability
    const payload = {
      ...formData,
      capacity: parseInt(formData.capacity, 10),
      availabilityWindows: formData.availabilityWindows || null,
    };
    
    // Basic client-side required validation so users get inline messages immediately
    const localErrors = {};
    if (!formData.name || !formData.name.toString().trim()) {
      localErrors.name = 'Resource Name is required';
    }
    if (!formData.location || !formData.location.toString().trim()) {
      localErrors.location = 'Location is required';
    }
    if (formData.capacity === '' || Number.isNaN(payload.capacity)) {
      localErrors.capacity = 'Capacity is required';
    } else if (payload.capacity < 1) {
      localErrors.capacity = 'Capacity must be at least 1';
    }

    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      setError(Object.values(localErrors)[0]);
      setSubmitting(false);
      return;
    }
    try {
      await onSubmit(payload);
    } catch (err) {
      // Prefer structured backend validation errors (fieldErrors)
      const resp = err.response?.data;
      if (resp?.fieldErrors && typeof resp.fieldErrors === 'object') {
        setFieldErrors(resp.fieldErrors);
        // show first field message as top-level error
        const first = Object.values(resp.fieldErrors)[0];
        setError(first || resp.message || "Validation failed");
      } else if (resp?.message) {
        setError(resp.message);
      } else {
        setError(err.message || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Client-side validation rules mirroring backend DTO ---
  const namePattern = /^(?=.*[a-zA-Z])[a-zA-Z0-9 ]+$/;
  // allow commas in location (e.g. "Block A, Floor 1")
  const locationPattern = /^(?=.*[a-zA-Z])[a-zA-Z0-9, ]+$/;
  const availabilityPattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$|^$/;

  const validateField = (fieldName, value) => {
    const v = value == null ? '' : value.toString().trim();
    switch (fieldName) {
      case 'name':
        if (!v) return 'Resource Name is required';
        if (v.length < 2 || v.length > 100) return 'Name must be between 2 and 100 characters';
        if (!namePattern.test(v)) return 'Resource name can only contain letters, numbers, and spaces - cannot be only numbers';
        return undefined;
      case 'location':
        if (!v) return 'Location is required';
        if (v.length < 2 || v.length > 200) return 'Location must be between 2 and 200 characters';
        if (!locationPattern.test(v)) return 'Location can only contain letters, numbers, spaces, and commas - cannot be only numbers';
        return undefined;
      case 'capacity':
        if (v === '') return 'Capacity is required';
        const n = parseInt(v, 10);
        if (Number.isNaN(n)) return 'Capacity must be a number';
        if (n < 1) return 'Capacity must be at least 1';
        if (n > 10000) return 'Capacity cannot exceed 10000';
        return undefined;
      case 'availabilityWindows':
        if (!v) return undefined; // optional
        if (!availabilityPattern.test(v)) return 'Availability format must be HH:MM-HH:MM (e.g. 08:00-18:00)';
        return undefined;
      case 'description':
        if (!v) return undefined;
        if (v.length > 500) return 'Description cannot exceed 500 characters';
        return undefined;
      default:
        return undefined;
    }
  };

  const validateAll = () => {
    const errors = {};
    Object.entries(formData).forEach(([k, val]) => {
      // only validate known fields we care about
      if (['name','location','capacity','availabilityWindows','description'].includes(k)) {
        const err = validateField(k, val);
        if (err) errors[k] = err;
      }
    });
    return errors;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Backend error message */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500 text-sm"></span>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Resource Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Resource Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g. Lab A101"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            fieldErrors.name ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
          }`}
        />
        {fieldErrors.name && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
            <span className="text-red-500 text-sm"></span>
            <p className="text-xs text-red-600">{fieldErrors.name}</p>
          </div>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type *
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="LAB">Lab</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
      </div>

      {/* Capacity & Location side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacity *
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            placeholder="e.g. 30"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              fieldErrors.capacity ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {fieldErrors.capacity && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
              <span className="text-red-500 text-sm"></span>
              <p className="text-xs text-red-600">{fieldErrors.capacity}</p>
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="e.g. Block A, Floor 1"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              fieldErrors.location ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {fieldErrors.location && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
              <span className="text-red-500 text-sm"></span>
              <p className="text-xs text-red-600">{fieldErrors.location}</p>
            </div>
          )}
        </div>
      </div>

      {/* Availability with format reminder */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Availability Hours
        </label>


        <input
          type="text"
          name="availabilityWindows"
          value={formData.availabilityWindows}
          onChange={handleChange}
          placeholder="e.g. 08:00-18:00"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            fieldErrors.availabilityWindows ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
          }`}
        />
        {fieldErrors.availabilityWindows && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
            <span className="text-red-500 text-sm mt-0.5"></span>
            <p className="text-xs text-red-600">{fieldErrors.availabilityWindows}</p>
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          placeholder="Optional description..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50"
        >
          {submitting
            ? "Saving..."
            : initialData
            ? "Update Resource"
            : "Create Resource"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
        >
          Cancel
        </button>
      </div>

    </form>
  );
};

export default ResourceForm;