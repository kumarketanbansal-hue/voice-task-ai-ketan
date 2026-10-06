import { Mic, Square } from "lucide-react";

export function MicButton({
  listening,
  disabled,
  onClick,
}: {
  listening: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="relative grid place-items-center">
      {listening && (
        <>
          <span className="mic-ring absolute h-28 w-28 rounded-full" />
          <span className="mic-ring absolute h-28 w-28 rounded-full [animation-delay:0.6s]" />
        </>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={listening ? "Stop listening" : "Start speaking"}
        className="mic-btn relative grid h-28 w-28 place-items-center rounded-full text-primary-foreground transition-transform duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
      >
        {listening ? <Square className="h-9 w-9 fill-current" /> : <Mic className="h-11 w-11" />}
      </button>
    </div>
  );
}
