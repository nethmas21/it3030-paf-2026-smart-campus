const PRIORITY_STYLES = {
  LOW:      'bg-slate-100  text-slate-600',
  MEDIUM:   'bg-orange-100 text-orange-700',
  HIGH:     'bg-red-100    text-red-700',
  CRITICAL: 'bg-red-600    text-white',
};

export default function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${style}`}>
      {priority}
    </span>
  );
}