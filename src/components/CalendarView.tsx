import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toISO, type Task } from "@/lib/tasks";
import { TaskList } from "./TaskList";

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOT = { high: "bg-priority-high", medium: "bg-priority-medium", low: "bg-priority-low" };

export function CalendarView({
  tasks,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const today = toISO(new Date());
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(today);

  const byDate = useMemo(() => {
    const m = new Map<string, Task[]>();
    tasks.forEach((t) => t.date && m.set(t.date, [...(m.get(t.date) ?? []), t]));
    return m;
  }, [tasks]);

  const cells = useMemo(() => {
    const start = new Date(cursor);
    start.setDate(1 - start.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const shift = (n: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));
  const dayTasks = (byDate.get(selected) ?? []).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
  const label = new Date(selected + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      <div className="card-surface p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">
            {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-1">
            <button onClick={() => shift(-1)} className="btn-ghost px-2 py-1.5" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); setSelected(today); }} className="btn-ghost px-3 py-1.5 text-xs">Today</button>
            <button onClick={() => shift(1)} className="btn-ghost px-2 py-1.5" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase text-muted-foreground">
          {WEEK.map((w) => <div key={w} className="py-1">{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d) => {
            const iso = toISO(d);
            const items = byDate.get(iso) ?? [];
            const inMonth = d.getMonth() === cursor.getMonth();
            const isSel = iso === selected;
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-sm transition ${
                  isSel ? "mic-btn text-primary-foreground" : iso === today ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-muted"
                } ${inMonth ? "" : "opacity-35"}`}
              >
                {d.getDate()}
                <span className="flex h-1.5 gap-0.5">
                  {items.slice(0, 3).map((t) => (
                    <span key={t.id} className={`h-1.5 w-1.5 rounded-full ${isSel ? "bg-primary-foreground" : t.completed ? "bg-muted-foreground/40" : DOT[t.priority]}`} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <TaskList title={label} tasks={dayTasks} empty="Nothing scheduled this day." onToggle={onToggle} onDelete={onDelete} />
    </div>
  );
}
