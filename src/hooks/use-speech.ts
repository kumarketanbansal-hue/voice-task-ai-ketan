import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "listening" | "unsupported" | "denied" | "error";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useSpeech(onFinal: (text: string) => void) {
  const [status, setStatus] = useState<Status>("idle");
  const [interim, setInterim] = useState("");
  const recRef = useRef<any>(null);
  const finalRef = useRef("");
  const interimRef = useRef("");
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
    rec.lang = navigator.language || "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    finalRef.current = "";
    interimRef.current = "";
    setInterim("");
    rec.onresult = (e: any) => {
      let inter = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalRef.current += `${r[0].transcript} `;
        else inter += r[0].transcript;
      }
      interimRef.current = inter;
      setInterim(`${finalRef.current}${inter}`.trim());
    };
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setStatus("denied");
      else if (e.error === "no-speech" || e.error === "aborted") setStatus("idle");
      else setStatus("error");
    };
    rec.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
      const text = `${finalRef.current}${interimRef.current}`.trim();
      recRef.current = null;
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

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      setStatus("idle");
    }
  }, []);

  return { status, interim, start, stop, setStatus };
}
