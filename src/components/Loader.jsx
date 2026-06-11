import React from "react";
import { cn } from "@/lib/utils";

const sizes = {
  page: "w-24 h-24",
  button: "w-5 h-5",
  inline: "w-10 h-10",
};

export default function Loader({ type = "inline", text, className }) {
  const size = sizes[type] || sizes.inline;

  if (type === "page") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
        <img src="/loader.gif" alt="Loading" className={cn("w-24 h-24", className)} />
        {text && (
          <p className="mt-4 text-sm text-white/80 font-medium animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  if (type === "button") {
    return (
      <img
        src="/loader.gif"
        alt="Loading"
        className={cn("w-5 h-5 shrink-0", className)}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <img src="/loader.gif" alt="Loading" className={cn(size, className)} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}