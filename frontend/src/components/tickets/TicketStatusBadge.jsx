const STATUS = {
  OPEN:        { cls: 'badge-blue',  label: 'Open' },
  IN_PROGRESS: { cls: 'badge-yellow', label: 'In Progress' },
  RESOLVED:    { cls: 'badge-green', label: 'Resolved' },
  CLOSED:      { cls: 'badge-slate', label: 'Closed' },
  REJECTED:    { cls: 'badge-red',   label: 'Rejected' },
};

export default function TicketStatusBadge({ status }) {
  const s = STATUS[status] || { cls: 'badge-slate', label: status };
  return <span className={s.cls}>{s.label}</span>;
}