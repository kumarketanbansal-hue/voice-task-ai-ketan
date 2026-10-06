import { useCallback, useEffect, useRef, useState } from "react";
import { dueAt, type Task } from "@/lib/tasks";

type Perm = "default" | "granted" | "denied" | "unsupported";

function beep(ctx: AudioContext) {
  const now = ctx.currentTime;
  [0, 0.25, 0.5].forEach((off) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, now + off);
    g.gain.exponentialRampToValueAtTime(0.3, now + off + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + off + 0.2);
    o.connect(g).connect(ctx.destination);
    o.start(now + off);
    o.stop(now + off + 0.22);
  });
}

/** Rings for pending tasks whose due time has arrived while the app is open. */
export function useAlarms(tasks: Task[], markNotified: (id: string) => void) {
  const [ringing, setRinging] = useState<Task[]>([]);
  const [perm, setPerm] = useState<Perm>("default");
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setPerm(typeof Notification === "undefined" ? "unsupported" : (Notification.permission as Perm));
    // Unlock audio on first interaction (browsers block autoplay).
    const unlock = () => {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      ctxRef.current.resume();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    ctxRef.current.resume();
    if (typeof Notification === "undefined") return;
    setPerm((await Notification.requestPermission()) as Perm);
  }, []);

  // Check due tasks every 10s.
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const due = tasks.filter((t) => {
        const d = dueAt(t);
        // Ring if due within the last 12h (missed while closed) and not yet rung.
        return !t.completed && !t.notified && d && d.getTime() <= now && now - d.getTime() < 12 * 3600_000;
      });
      if (!due.length) return;
      due.forEach((t) => {
        markNotified(t.id);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification("⏰ Task reminder", { body: t.title, tag: t.id, requireInteraction: true });
          } catch {
            /* some mobile browsers disallow constructor */
          }
        }
      });
      setRinging((r) => [...r, ...due.filter((d) => !r.some((x) => x.id === d.id))]);
    };
    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, [tasks, markNotified]);

  // Repeat sound while something is ringing.
  useEffect(() => {
    if (!ringing.length) return;
    const play = () => ctxRef.current && beep(ctxRef.current);
    play();
    const id = setInterval(play, 2500);
    return () => clearInterval(id);
  }, [ringing.length]);

  const dismiss = useCallback((id: string) => setRinging((r) => r.filter((x) => x.id !== id)), []);

  return { ringing, dismiss, perm, requestPermission };
}
