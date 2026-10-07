import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bell, BellOff, CalendarDays, List, Loader2, Send, AudioLines } from "lucide-react";
import { MicButton } from "@/components/MicButton";
import { ConfirmCard } from "@/components/ConfirmCard";
import { TaskList } from "@/components/TaskList";
import { CalendarView } from "@/components/CalendarView";
import { AlarmBanner } from "@/components/AlarmBanner";
import { useAlarms } from "@/hooks/use-alarms";
import { useSpeech } from "@/hooks/use-speech";
import { extractTask } from "@/lib/extract.functions";
import { parseFallback } from "@/lib/parse-fallback";
import { isValidDate, isValidTime, localToday, useTasks, type TaskDraft } from "@/lib/tasks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voice Task AI — Voice-to-Action Assistant" },
      { name: "description", content: "Speak naturally and turn your voice into organized tasks with dates, times and priorities." },
      { property: "og:title", content: "Voice Task AI — Voice-to-Action Assistant" },
      { property: "og:description", content: "Speak naturally and turn your voice into organized tasks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

function Index() {
  const { tasks, add, toggle, remove, markNotified } = useTasks();
  const extract = useServerFn(extractTask);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [alarmsEnabled, setAlarmsEnabled] = useState(false);
  const [pending, setPending] = useState<{ draft: TaskDraft; transcript: string; source: "ai" | "fallback" } | null>(null);
  const alarms = useAlarms(tasks, markNotified, alarmsEnabled);

  const process = async (input: string) => {
    const t = input.trim();
    setNotice("");
    if (!t) return setNotice("Please say or type a task first.");
    setBusy(true);
    let draft: TaskDraft;
    let source: "ai" | "fallback" = "ai";
    try {
      const now = new Date();
      draft = await extract({
        data: { text: t, today: localToday(), weekday: now.toLocaleDateString("en-US", { weekday: "long" }) },
      });
      if (!draft.title.trim()) throw new Error("empty");
    } catch {
      draft = parseFallback(t);
      source = "fallback";
    }
    if (!isValidDate(draft.date)) draft.date = "";
    if (!isValidTime(draft.time)) draft.time = "";
    setPending({ draft, transcript: t, source });
    setText("");
    setBusy(false);
  };

  const speech = useSpeech((final) => {
    setText(final);
    process(final);
  });
  const listening = speech.status === "listening";

  const { open, done } = useMemo(() => {
    const sortKey = (x: (typeof tasks)[number]) => `${x.date || "9999"}${x.time || "99"}`;
    return {
      open: tasks
        .filter((t) => !t.completed)
        .sort((a, b) => sortKey(a).localeCompare(sortKey(b)) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]),
      done: tasks.filter((t) => t.completed),
    };
  }, [tasks]);

  const statusText =
    speech.status === "denied"
      ? "Microphone access was blocked. Allow it in your browser settings, or type below."
      : speech.status === "unsupported"
        ? "Voice input isn't supported in this browser. Type your task below."
        : speech.status === "error"
          ? "Couldn't hear you. Try again or type below."
          : listening
            ? "Listening… I’ll stop after two seconds of silence"
            : busy
              ? "Understanding your task…"
              : "Tap the mic and say something like “Remind me tomorrow at 5 pm to submit my assignment”";

  return (
    <div className="app-bg min-h-screen">
      <AlarmBanner
        tasks={alarms.ringing}
        onDone={(id) => {
          toggle(id);
          alarms.dismiss(id);
        }}
        onDismiss={alarms.dismiss}
      />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <header className="mb-6 flex items-center gap-3">
          <div className="mic-btn grid h-10 w-10 place-items-center rounded-xl text-primary-foreground">
            <AudioLines className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Voice Task AI</h1>
            <p className="text-xs text-muted-foreground">Voice-to-Action Assistant</p>
          </div>
          <div className="ml-auto text-right text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{open.length}</span> pending ·{" "}
            <span className="font-semibold text-foreground">{done.length}</span> done
          </div>
        </header>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
          <div className="flex rounded-lg bg-muted p-1" role="group" aria-label="Task view">
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" /> List
            </button>
            <button
              type="button"
              onClick={() => setView("calendar")}
              aria-pressed={view === "calendar"}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${view === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <CalendarDays className="h-4 w-4" /> Calendar
            </button>
          </div>

          <button
            type="button"
            onClick={async () => {
              setAlarmsEnabled(true);
              await alarms.requestPermission();
            }}
            disabled={alarmsEnabled}
            className={alarmsEnabled ? "btn-ghost" : "btn-primary"}
          >
            {alarmsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {alarmsEnabled
              ? alarms.perm === "granted"
                ? "Alarms enabled"
                : "In-app alarms enabled"
              : "Enable alarms"}
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-5 lg:sticky lg:top-8 lg:self-start">
            <div className="card-surface flex flex-col items-center px-6 py-10 text-center">
              <MicButton
                listening={listening}
                disabled={busy || speech.status === "unsupported"}
                onClick={() => (listening ? speech.stop() : speech.start())}
              />
              <p className={`mt-8 min-h-10 max-w-sm text-sm ${speech.status === "denied" || speech.status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                {busy && <Loader2 className="mr-1.5 inline h-4 w-4 animate-spin" />}
                {statusText}
              </p>
              {listening && speech.interim && <p className="mt-3 text-base font-medium">{speech.interim}</p>}

              <form
                className="mt-6 flex w-full gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  process(text);
                }}
              >
                <input
                  className="field flex-1"
                  placeholder="Or type a task…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={busy}
                />
                <button type="submit" disabled={busy} className="btn-primary px-4" aria-label="Create from text">
                  <Send className="h-4 w-4" />
                </button>
              </form>
              {notice && <p className="mt-2 text-xs text-destructive">{notice}</p>}
            </div>

            {pending && (
              <ConfirmCard
                key={pending.transcript + pending.draft.title}
                {...pending}
                onConfirm={(d) => {
                  add(d);
                  setPending(null);
                }}
                onCancel={() => setPending(null)}
              />
            )}
          </div>

          {view === "list" ? (
            <div className="space-y-8">
              <TaskList title="Pending" tasks={open} empty="No pending tasks. Speak one into existence." onToggle={toggle} onDelete={remove} />
              <TaskList title="Completed" tasks={done} empty="Completed tasks will appear here." onToggle={toggle} onDelete={remove} />
            </div>
          ) : (
            <CalendarView tasks={tasks} onToggle={toggle} onDelete={remove} />
          )}
        </div>
      </div>
    </div>
  );
}
