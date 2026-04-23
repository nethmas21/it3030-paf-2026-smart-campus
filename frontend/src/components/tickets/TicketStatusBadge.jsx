const STATUS_STYLES = {
  OPEN:        'bg-blue-100   text-blue-800   border-blue-200',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  RESOLVED:    'bg-green-100  text-green-800  border-green-200',
  CLOSED:      'bg-gray-100   text-gray-600   border-gray-200',
  REJECTED:    'bg-red-100    text-red-700    border-red-200',
};

const STATUS_LABELS = {
  OPEN:        'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED:    'Resolved',
  CLOSED:      'Closed',
  REJECTED:    'Rejected',
};

export default function TicketStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}