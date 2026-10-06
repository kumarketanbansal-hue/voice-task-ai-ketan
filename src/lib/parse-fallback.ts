import { toISO, type Priority, type TaskDraft } from "./tasks";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/** Simple rule-based extraction used when AI is unavailable. */
export function parseFallback(text: string): TaskDraft {
  let s = text.trim();
  const lower = s.toLowerCase();
  const now = new Date();
  let date = "";
  let time = "";

  if (/\bday after tomorrow\b/.test(lower)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    date = toISO(d);
  } else if (/\btomorrow\b/.test(lower)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    date = toISO(d);
  } else if (/\b(today|tonight)\b/.test(lower)) {
    date = toISO(now);
  } else {
    const m = lower.match(/\b(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
    if (m) {
      const target = DAYS.indexOf(m[2] ?? "");
      const d = new Date(now);
      let diff = (target - d.getDay() + 7) % 7;
      if (diff === 0 || m[1]) diff += diff === 0 ? 7 : 0;
      d.setDate(d.getDate() + diff);
      date = toISO(d);
    }
  }

  const tm = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b/) || lower.match(/\bat\s+(\d{1,2}):(\d{2})\b/);
  if (tm) {
    let h = parseInt(tm[1] ?? "0", 10);
    const min = tm[2] ? parseInt(tm[2], 10) : 0;
    const ap = tm[3]?.replace(/\./g, "");
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    if (h < 24 && min < 60) time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  } else if (/\bnoon\b/.test(lower)) time = "12:00";
  else if (/\btonight\b/.test(lower)) time = "20:00";

  let priority: Priority = "medium";
  if (/\b(urgent|asap|important|critical|high priority|immediately)\b/.test(lower)) priority = "high";
  else if (/\b(low priority|whenever|sometime|no rush)\b/.test(lower)) priority = "low";

  s = s
    .replace(/^(please\s+)?(remind me|remember|i need|i have|don't forget|add a task|add task|create a task)\s*(to|that)?\s*/i, "")
    .replace(/\b(day after tomorrow|tomorrow|today|tonight|(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday))\b/gi, "")
    .replace(/\bat\s+\d{1,2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)?/gi, "")
    .replace(/\b\d{1,2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)/gi, "")
    .replace(/\b(urgent|asap|high priority|low priority|it's important|important)\b/gi, "")
    .replace(/^\s*(to|that)\s+/i, "")
    .replace(/\s+(on|by|at)\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[.,!\s]+$/, "")
    .trim();

  const title = s ? s.charAt(0).toUpperCase() + s.slice(1) : text.trim();
  return { title, date, time, priority };
}
