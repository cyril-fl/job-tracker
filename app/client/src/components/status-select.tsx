import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusConfig = {
  pending: { label: 'Attente', variant: 'outline' as const },
  in_progress: { label: 'En cours', variant: 'default' as const },
  rejected: { label: 'Refusé', variant: 'destructive' as const },
  accepted: { label: 'Accepté', variant: 'secondary' as const },
} as const;

type Status = keyof typeof statusConfig;

interface StatusSelectProps {
  value: Status;
  onChange: (status: Status) => void;
}

export function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Status)}>
      <SelectTrigger className="w-[130px]">
        <SelectValue>
          <StatusBadge status={value} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(statusConfig) as [Status, (typeof statusConfig)[Status]][]).map(
          ([key, _config]) => (
            <SelectItem key={key} value={key}>
              <StatusBadge status={key} />
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
