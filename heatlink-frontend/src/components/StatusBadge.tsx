import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import './StatusBadge.css';

export type StatusType = 'fast' | 'slow' | 'down' | 'unknown';

interface StatusBadgeProps {
  status: StatusType;
  latency?: number;
  className?: string;
}

export default function StatusBadge({ status, latency, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    fast: {
      label: 'Fast',
      icon: CheckCircle,
      className: 'status-fast',
      color: '#10B981',
    },
    slow: {
      label: 'Slow',
      icon: AlertCircle,
      className: 'status-slow',
      color: '#F59E0B',
    },
    down: {
      label: 'Down',
      icon: XCircle,
      className: 'status-down',
      color: '#EF4444',
    },
    unknown: {
      label: 'Unknown',
      icon: Clock,
      className: 'status-unknown',
      color: '#6B7280',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`status-badge ${config.className} ${className}`}>
      <Icon size={16} />
      <span className="status-label">{config.label}</span>
      {latency !== undefined && (
        <span className="status-latency">{latency}ms</span>
      )}
    </div>
  );
}
