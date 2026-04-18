import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, uploadAttachments } from '../../api/ticketApi';

const CATEGORIES = [
  // Academic
  { value: 'EXAM_ISSUE',       label: '📝 Exam Issue',         group: 'Academic' },
  { value: 'GRADE_ISSUE',      label: '📊 Grade Issue',        group: 'Academic' },
  { value: 'LECTURE_ISSUE',    label: '👨‍🏫 Lecture Issue',      group: 'Academic' },
  { value: 'TIMETABLE_ISSUE',  label: '🗓️ Timetable Issue',    group: 'Academic' },
  { value: 'MODULE_ISSUE',     label: '📚 Module Issue',       group: 'Academic' },
  { value: 'ASSIGNMENT_ISSUE', label: '📄 Assignment Issue',   group: 'Academic' },
  // Administrative
  { value: 'REGISTRATION',     label: '📋 Registration',       group: 'Administrative' },
  { value: 'STUDENT_RECORD',   label: '🪪 Student Record',     group: 'Administrative' },
  { value: 'FEE_PAYMENT',      label: '💳 Fee & Payment',      group: 'Administrative' },
  // IT & Facilities
  { value: 'IT_EQUIPMENT',     label: '💻 IT Equipment',       group: 'Facilities' },
  { value: 'NETWORK',          label: '📶 Network / WiFi',     group: 'Facilities' },
  { value: 'ELECTRICAL',       label: '⚡ Electrical',         group: 'Facilities' },
  { value: 'PLUMBING',         label: '🚰 Plumbing',           group: 'Facilities' },
  { value: 'HVAC',             label: '❄️ AC / Heating',       group: 'Facilities' },
  { value: 'CLASSROOM',        label: '🏫 Classroom',          group: 'Facilities' },
  { value: 'LABORATORY',       label: '🔬 Laboratory',         group: 'Facilities' },
  { value: 'LIBRARY',          label: '📖 Library',            group: 'Facilities' },
  { value: 'SECURITY',         label: '🔒 Security',           group: 'Facilities' },
  { value: 'CLEANING',         label: '🧹 Cleaning',           group: 'Facilities' },
  { value: 'OTHER',            label: '❓ Other',              group: 'Other' },
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// Group categories for dropdown
const GROUPS = [...new Set(CATEGORIES.map(c => c.group))];

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '', priority: '',
    location: '', preferredContact: '', resourceId: '',
  });
  const [files, setFiles]           = useState([]);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 3) {
      setErrors((prev) => ({ ...prev, files: 'Maximum 3 images allowed' }));
      return;
    }
    setFiles(selected);
    setErrors((prev) => ({ ...prev, files: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category)           errs.category    = 'Category is required';
    if (!form.priority)           errs.priority    = 'Priority is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const payload = {
        title:            form.title,
        description:      form.description,
        category:         form.category,
        priority:         form.priority,
        location:         form.location || undefined,
        preferredContact: form.preferredContact || undefined,
        resourceId:       form.resourceId ? Number(form.resourceId) : undefined,
      };

      const res = await createTicket(payload);
      const createdId = res.data.data.id;

      if (files.length > 0) {
        await uploadAttachments(createdId, files);
      }

      navigate(`/tickets/${createdId}`);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to create ticket' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit your concern and we'll get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Wrong grade for IT3040 final exam"
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your issue in detail..."
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Category + Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.category ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">Select category</option>
              {GROUPS.map(group => (
                <optgroup key={group} label={group}>
                  {CATEGORIES.filter(c => c.group === group).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.priority ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">Select priority</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.priority && <p className="text-xs text-red-500 mt-1">{errors.priority}</p>}
          </div>
        </div>

        {/* Location + Contact */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Block A, Room 203"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred contact</label>
            <input
              name="preferredContact"
              type="text"
              value={form.preferredContact}
              onChange={handleChange}
              placeholder="Phone or email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachments <span className="text-gray-400 font-normal">(max 3 images)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {files.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{files.length} file(s) selected</p>
          )}
          {errors.files && <p className="text-xs text-red-500 mt-1">{errors.files}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}