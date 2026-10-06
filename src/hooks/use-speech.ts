import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "listening" | "unsupported" | "denied" | "error";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useSpeech(onFinal: (text: string) => void) {
  const [status, setStatus] = useState<Status>("idle");
  const [interim, setInterim] = useState("");
  const recRef = useRef<any>(null);
  const finalRef = useRef("");
  const cbRef = useRef(onFinal);
  cbRef.current = onFinal;

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setStatus("unsupported");
  }, []);

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return setStatus("unsupported");
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    finalRef.current = "";
    setInterim("");
    rec.onresult = (e: any) => {
      let fin = "";
      let inter = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) fin += r[0].transcript;
        else inter += r[0].transcript;
      }
      finalRef.current = fin;
      setInterim(fin + inter);
    };
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setStatus("denied");
      else if (e.error === "no-speech" || e.error === "aborted") setStatus("idle");
      else setStatus("error");
    };
    rec.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
      const text = finalRef.current.trim();
      if (text) cbRef.current(text);
    };
    recRef.current = rec;
    try {
      rec.start();
      setStatus("listening");
    } catch {
      setStatus("error");
    }
  }, []);

  const stop = useCallback(() => recRef.current?.stop(), []);

  return { status, interim, start, stop, setStatus };
}
