import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "date", "time", "priority"],
  properties: {
    title: { type: "string", description: "Short action-oriented task title" },
    date: { type: "string", description: "YYYY-MM-DD or empty string if none" },
    time: { type: "string", description: "HH:MM 24h or empty string if none" },
    priority: { type: "string", enum: ["low", "medium", "high"] },
  },
};

export const extractTask = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ text: z.string().min(1).max(1000), today: z.string(), weekday: z.string() }).parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        Authorization: `Bearer ${key}`,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions: `You extract a single to-do task from a spoken sentence. Today is ${data.weekday}, ${data.today}. Resolve relative dates (tomorrow, next Friday) to YYYY-MM-DD. Time as 24h HH:MM. Use empty strings when not mentioned. Priority: high if urgent/important, low if casual, else medium. Title: concise, starts with a verb or gerund, no date/time words.`,
        input: [{ role: "user", content: data.text }],
        text: { format: { type: "json_schema", name: "task", strict: true, schema } },
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`AI request failed (${res.status})`);
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let out = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") out += ev.delta ?? "";
        } catch {
          /* skip */
        }
      }
    }
    const parsed = JSON.parse(out);
    return {
      title: String(parsed.title ?? ""),
      date: String(parsed.date ?? ""),
      time: String(parsed.time ?? ""),
      priority: (["low", "medium", "high"].includes(parsed.priority) ? parsed.priority : "medium") as
        | "low"
        | "medium"
        | "high",
    };
  });
