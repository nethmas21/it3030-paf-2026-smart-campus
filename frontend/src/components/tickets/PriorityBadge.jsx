const PRIORITY = {
  LOW:      'priority-low',
  MEDIUM:   'priority-medium',
  HIGH:     'priority-high',
  CRITICAL: 'priority-critical',
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={PRIORITY[priority] || 'priority-low'}>
      {priority}
    </span>
  );
}