import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shareMuseum } from "@/lib/share";
import { recordMuseumEvent } from "@/lib/museum-stats";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
};

export function ShareButton({
  variant = "secondary",
  size = "sm",
  className,
  label = "Xでシェア",
}: Props) {
  const [status, setStatus] = useState<"idle" | "ok" | "copied">("idle");

  async function onShare() {
    try {
      const result = await shareMuseum();
      void recordMuseumEvent("share");
      if (result === "copied") {
        setStatus("copied");
      } else {
        setStatus("ok");
      }
      window.setTimeout(() => setStatus("idle"), 2200);
    } catch {
      // cancelled
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={onShare}
      aria-label="X（Twitter）でシェア"
    >
      {status === "copied" || status === "ok" ? (
        <Check className="h-4 w-4" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {size !== "icon" && (
        <span>
          {status === "copied" ? "コピーしました" : status === "ok" ? "開きました" : label}
        </span>
      )}
    </Button>
  );
}
