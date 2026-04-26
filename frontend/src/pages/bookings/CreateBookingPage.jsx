import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../api/bookingApi';
import { resourceApi } from '../../api/resourceApi';

export default function CreateBookingPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: ''
  });

  const [resources, setResources] = useState([]);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchActiveResources();
  }, []);

  const fetchActiveResources = async () => {
    try {
      setResourceLoading(true);
      setError('');

      const data = await resourceApi.getAll({ status: 'ACTIVE' });
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load resources');
    } finally {
      setResourceLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!form.resourceId) {
      setError('Please select a resource');
      return false;
    }

    if (!form.bookingDate) {
      setError('Please select a booking date');
      return false;
    }

    if (form.bookingDate < today) {
      setError('Booking date cannot be in the past');
      return false;
    }

    if (!form.startTime || !form.endTime) {
      setError('Please select start time and end time');
      return false;
    }

    if (form.startTime >= form.endTime) {
      setError('Start time must be before end time');
      return false;
    }

    if (!form.purpose.trim()) {
      setError('Please enter the booking purpose');
      return false;
    }

    if (!form.expectedAttendees || Number(form.expectedAttendees) < 1) {
      setError('Expected attendees must be at least 1');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        resourceId: Number(form.resourceId),
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose.trim(),
        expectedAttendees: Number(form.expectedAttendees)
      };

      await createBooking(payload);

      setSuccess('Booking request submitted successfully');

      setTimeout(() => {
        navigate('/bookings/my');
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const selectedResource = resources.find(
    resource => String(resource.id) === String(form.resourceId)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Booking</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit a booking request for an active campus resource
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5"
      >
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource
          </label>

          <select
            name="resourceId"
            value={form.resourceId}
            onChange={handleChange}
            required
            disabled={resourceLoading || resources.length === 0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {resourceLoading ? 'Loading resources...' : 'Select a resource'}
            </option>

            {resources.map(resource => (
              <option key={resource.id} value={resource.id}>
                {resource.name} - {resource.type} - {resource.location}
                {resource.capacity ? ` - Capacity ${resource.capacity}` : ''}
              </option>
            ))}
          </select>

          {!resourceLoading && resources.length === 0 && (
            <p className="text-sm text-red-600 mt-1">
              No active resources available for booking.
            </p>
          )}
        </div>

        {selectedResource && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800">
            <p className="font-medium">{selectedResource.name}</p>
            <p className="mt-1">
              Type: {selectedResource.type} | Location: {selectedResource.location}
              {selectedResource.capacity ? ` | Capacity: ${selectedResource.capacity}` : ''}
            </p>
            {selectedResource.availabilityWindows && (
              <p className="mt-1">
                Availability: {selectedResource.availabilityWindows}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Date
            </label>
            <input
              type="date"
              name="bookingDate"
              value={form.bookingDate}
              onChange={handleChange}
              min={today}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose
          </label>
          <textarea
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            required
            rows="4"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Why are you requesting this booking?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Attendees
          </label>
          <input
            type="number"
            name="expectedAttendees"
            value={form.expectedAttendees}
            onChange={handleChange}
            required
            min="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter expected attendee count"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || resourceLoading || resources.length === 0}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Booking'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/bookings/my')}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}