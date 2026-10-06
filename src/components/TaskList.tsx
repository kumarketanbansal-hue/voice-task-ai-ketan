import { Check, Trash2, Calendar } from "lucide-react";
import { formatDue, isOverdue, type Task } from "@/lib/tasks";
import { PriorityBadge } from "./PriorityBadge";

export function TaskList({
  title,
  tasks,
  empty,
  onToggle,
  onDelete,
}: {
  title: string;
  tasks: Task[];
  empty: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{empty}</div>
      ) : (
        <ul className="space-y-2.5">
          {tasks.map((t) => {
            const overdue = isOverdue(t);
            return (
              <li key={t.id} className="card-surface group flex items-center gap-3 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <button
                  onClick={() => onToggle(t.id)}
                  aria-label={t.completed ? "Mark as pending" : "Mark as completed"}
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${t.completed ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
                >
                  {t.completed && <Check className="h-3.5 w-3.5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-medium transition ${t.completed ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`inline-flex items-center gap-1 ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                      <Calendar className="h-3 w-3" />
                      {overdue ? "Overdue · " : ""}
                      {formatDue(t)}
                    </span>
                    {!t.completed && <PriorityBadge priority={t.priority} />}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(t.id)}
                  aria-label="Delete task"
                  className="rounded-lg p-2 text-muted-foreground opacity-100 transition hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
