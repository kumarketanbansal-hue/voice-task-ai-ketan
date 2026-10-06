import { useEffect, useState, useCallback } from "react";

export type Priority = "low" | "medium" | "high";

export interface TaskDraft {
  title: string;
  date: string; // YYYY-MM-DD or ""
  time: string; // HH:MM or ""
  priority: Priority;
}

export interface Task extends TaskDraft {
  id: string;
  completed: boolean;
  createdAt: number;
  notified?: boolean;
}

const KEY = "voice-task-ai:tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(tasks));
  }, [tasks, loaded]);

  const add = useCallback((d: TaskDraft) => {
    setTasks((t) => [
      { ...d, id: crypto.randomUUID(), completed: false, createdAt: Date.now() },
      ...t,
    ]);
  }, []);
  const toggle = useCallback((id: string) => {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, completed: !x.completed } : x)));
  }, []);
  const remove = useCallback((id: string) => {
    setTasks((t) => t.filter((x) => x.id !== id));
  }, []);

  const markNotified = useCallback((id: string) => {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, notified: true } : x)));
  }, []);

  return { tasks, add, toggle, remove, markNotified };
}

export function isValidDate(d: string) {
  if (!d) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  return !Number.isNaN(new Date(d + "T00:00:00").getTime());
}

export function isValidTime(t: string) {
  return !t || /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}

export function formatDue(task: TaskDraft) {
  if (!task.date && !task.time) return "No due date";
  let out = "";
  if (task.date && isValidDate(task.date)) {
    const d = new Date(task.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    out =
      diff === 0
        ? "Today"
        : diff === 1
          ? "Tomorrow"
          : diff === -1
            ? "Yesterday"
            : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }
  if (task.time && isValidTime(task.time)) {
    const [h, m] = task.time.split(":").map(Number);
    const t = new Date();
    t.setHours(h ?? 0, m ?? 0);
    out += (out ? " · " : "") + t.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return out || "No due date";
}

export function isOverdue(task: Task) {
  if (task.completed || !task.date || !isValidDate(task.date)) return false;
  const due = new Date(`${task.date}T${task.time || "23:59"}:00`);
  return due.getTime() < Date.now();
}

export function localToday() {
  const d = new Date();
  return toISO(d);
}

export function toISO(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Due moment; tasks with a date but no time ring at 09:00. */
export function dueAt(task: TaskDraft): Date | null {
  if (!task.date || !isValidDate(task.date)) return null;
  const d = new Date(`${task.date}T${task.time && isValidTime(task.time) ? task.time : "09:00"}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
