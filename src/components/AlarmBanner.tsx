import { AlarmClock, Check, X } from "lucide-react";
import { formatDue, type Task } from "@/lib/tasks";

export function AlarmBanner({
  tasks,
  onDone,
  onDismiss,
}: {
  tasks: Task[];
  onDone: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  if (!tasks.length) return null;
  return (
    <div className="fixed inset-x-0 top-4 z-50 mx-auto flex max-w-md flex-col gap-2 px-4">
      {tasks.map((t) => (
        <div key={t.id} className="card-surface alarm-glow flex items-center gap-3 p-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mic-btn grid h-10 w-10 shrink-0 animate-pulse place-items-center rounded-full text-primary-foreground">
            <AlarmClock className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-primary">Reminder · {formatDue(t)}</p>
            <p className="truncate font-semibold">{t.title}</p>
          </div>
          <button onClick={() => onDone(t.id)} className="btn-primary px-3 py-2" aria-label="Mark done">
            <Check className="h-4 w-4" />
          </button>
          <button onClick={() => onDismiss(t.id)} className="btn-ghost px-3 py-2" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
