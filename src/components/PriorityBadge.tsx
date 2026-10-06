import type { Priority } from "@/lib/tasks";

const styles: Record<Priority, string> = {
  high: "bg-priority-high/12 text-priority-high",
  medium: "bg-priority-medium/12 text-priority-medium",
  low: "bg-priority-low/12 text-priority-low",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[priority]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}
