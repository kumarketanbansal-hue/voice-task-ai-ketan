import { useState } from "react";
import { Check, Pencil, X, Sparkles, Calendar, Clock } from "lucide-react";
import { formatDue, isValidDate, isValidTime, type Priority, type TaskDraft } from "@/lib/tasks";
import { PriorityBadge } from "./PriorityBadge";

export function ConfirmCard({
  draft,
  transcript,
  source,
  onConfirm,
  onCancel,
}: {
  draft: TaskDraft;
  transcript: string;
  source: "ai" | "fallback";
  onConfirm: (d: TaskDraft) => void;
  onCancel: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [d, setD] = useState(draft);
  const titleErr = !d.title.trim() ? "Title is required" : "";
  const dateErr = !isValidDate(d.date) ? "Invalid date" : "";
  const timeErr = !isValidTime(d.time) ? "Invalid time" : "";
  const invalid = !!(titleErr || dateErr || timeErr);

  return (
    <div className="card-surface animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-300 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Confirm task
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          {source === "ai" ? "AI extracted" : "Basic parsing"}
        </span>
      </div>
      <p className="mb-4 text-sm italic text-muted-foreground">"{transcript}"</p>

      {!editing ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold leading-snug">{d.title || <span className="text-destructive">No title</span>}</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDue(d)}
            </span>
            <PriorityBadge priority={d.priority} />
          </div>
          {(dateErr || timeErr) && <p className="text-xs text-destructive">{dateErr || timeErr} — please edit.</p>}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="field-label">Task</span>
            <input className="field" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} />
            {titleErr && <span className="text-xs text-destructive">{titleErr}</span>}
          </label>
          <label>
            <span className="field-label"><Calendar className="h-3 w-3" /> Date</span>
            <input type="date" className="field" value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} />
            {dateErr && <span className="text-xs text-destructive">{dateErr}</span>}
          </label>
          <label>
            <span className="field-label"><Clock className="h-3 w-3" /> Time</span>
            <input type="time" className="field" value={d.time} onChange={(e) => setD({ ...d, time: e.target.value })} />
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Priority</span>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setD({ ...d, priority: p })}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm capitalize transition ${d.priority === p ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </label>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <button disabled={invalid} onClick={() => onConfirm({ ...d, title: d.title.trim() })} className="btn-primary flex-1">
          <Check className="h-4 w-4" /> Confirm
        </button>
        <button onClick={() => setEditing((e) => !e)} className="btn-ghost">
          <Pencil className="h-4 w-4" /> {editing ? "Done" : "Edit"}
        </button>
        <button onClick={onCancel} className="btn-ghost text-muted-foreground">
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  );
}
