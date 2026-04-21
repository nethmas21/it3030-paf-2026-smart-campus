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
  // Facilities
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
const GROUPS = [...new Set(CATEGORIES.map(c => c.group))];

// ── Validation helpers ────────────────────────────────────────────────────────

// Sri Lankan phone: 07X XXXXXXX (10 digits starting with 07)
const SL_PHONE_REGEX = /^(?:\+94|0)(7[0-9]{8})$/;

// Basic email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form) => {
  const errors = {};

  // Title — required, min 5, max 200
  if (!form.title.trim()) {
    errors.title = 'Title is required';
  } else if (form.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters';
  } else if (form.title.trim().length > 200) {
    errors.title = 'Title must not exceed 200 characters';
  }

  // Description — required, min 10
  if (!form.description.trim()) {
    errors.description = 'Description is required';
  } else if (form.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  // Category — required
  if (!form.category) {
    errors.category = 'Please select a category';
  }

  // Priority — required
  if (!form.priority) {
    errors.priority = 'Please select a priority';
  }

  // Location — optional but max 300
  if (form.location && form.location.length > 300) {
    errors.location = 'Location must not exceed 300 characters';
  }

  // Preferred contact — optional but must be valid SL phone or email
  if (form.preferredContact && form.preferredContact.trim()) {
    const contact = form.preferredContact.trim();
    const isPhone = SL_PHONE_REGEX.test(contact);
    const isEmail = EMAIL_REGEX.test(contact);
    if (!isPhone && !isEmail) {
      errors.preferredContact =
        'Enter a valid Sri Lankan phone (e.g. 0771234567) or email address';
    }
  }

  return errors;
};

export default function CreateTicketPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', category: '', priority: '',
    location: '', preferredContact: '',
  });
  const [files, setFiles]           = useState([]);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched]       = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Re-validate field on change if already touched
    if (touched[name]) {
      const newErrors = validate({ ...form, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: newErrors[name] || '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const newErrors = validate(form);
    setErrors((prev) => ({ ...prev, [name]: newErrors[name] || '' }));
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 3) {
      setErrors((prev) => ({ ...prev, files: 'Maximum 3 images allowed' }));
      return;
    }
    // Validate file types
    const invalidFiles = selected.filter(f => !f.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setErrors((prev) => ({ ...prev, files: 'Only image files are allowed' }));
      return;
    }
    // Validate file sizes (max 5MB each)
    const oversized = selected.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      setErrors((prev) => ({ ...prev, files: 'Each file must be less than 5MB' }));
      return;
    }
    setFiles(selected);
    setErrors((prev) => ({ ...prev, files: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      title: true, description: true, category: true,
      priority: true, location: true, preferredContact: true,
    });

    const errs = validate(form);
    if (Object.keys(errs).some(k => errs[k])) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title:            form.title.trim(),
        description:      form.description.trim(),
        category:         form.category,
        priority:         form.priority,
        location:         form.location.trim() || undefined,
        preferredContact: form.preferredContact.trim() || undefined,
      };

      const res = await createTicket(payload);
      const createdId = res.data.data.id;

      if (files.length > 0) {
        await uploadAttachments(createdId, files);
      }

      navigate(`/tickets/${createdId}`);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to create ticket. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition-all ${
      errors[field] && touched[field]
        ? 'border-red-400 focus:ring-red-100 focus:border-red-400'
        : 'border-gray-300 focus:ring-blue-100 focus:border-blue-400'
    }`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit your concern and we'll get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">

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
            onBlur={handleBlur}
            placeholder="e.g. Wrong grade for IT3040 final exam"
            className={getFieldClass('title')}
          />
          {errors.title && touched.title && (
            <p className="text-xs text-red-500 mt-1">⚠ {errors.title}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{form.title.length}/200 characters</p>
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
            onBlur={handleBlur}
            placeholder="Describe your issue in detail (minimum 10 characters)..."
            className={`${getFieldClass('description')} resize-none`}
          />
          {errors.description && touched.description && (
            <p className="text-xs text-red-500 mt-1">⚠ {errors.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{form.description.length} characters</p>
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
              onBlur={handleBlur}
              className={`${getFieldClass('category')} bg-white`}
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
            {errors.category && touched.category && (
              <p className="text-xs text-red-500 mt-1">⚠ {errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${getFieldClass('priority')} bg-white`}
            >
              <option value="">Select priority</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.priority && touched.priority && (
              <p className="text-xs text-red-500 mt-1">⚠ {errors.priority}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Block A, Room 203"
            className={getFieldClass('location')}
          />
          {errors.location && touched.location && (
            <p className="text-xs text-red-500 mt-1">⚠ {errors.location}</p>
          )}
        </div>

        {/* Preferred Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Contact <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            name="preferredContact"
            type="text"
            value={form.preferredContact}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 0771234567 or student@sliit.lk"
            className={getFieldClass('preferredContact')}
          />
          {errors.preferredContact && touched.preferredContact ? (
            <p className="text-xs text-red-500 mt-1">⚠ {errors.preferredContact}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              Enter a Sri Lankan phone number (e.g. 0771234567) or email address
            </p>
          )}
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachments <span className="text-gray-400 font-normal">(max 3 images, 5MB each)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {files.length > 0 && (
            <p className="text-xs text-green-600 mt-1">✓ {files.length} file(s) selected</p>
          )}
          {errors.files && (
            <p className="text-xs text-red-500 mt-1">⚠ {errors.files}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
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