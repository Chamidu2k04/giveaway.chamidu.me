"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  trigger?: boolean;
  mode?: "celebration" | "winner";
}

export function ConfettiEffect({ trigger = true, mode = "celebration" }: ConfettiEffectProps) {
  useEffect(() => {
    if (!trigger) return;

    if (mode === "celebration") {
      // Full celebration burst for thank-you page
      const end = Date.now() + 3 * 1000;
      const colors = ["#ff0000", "#ffd700", "#ffffff", "#ff4444", "#ffcc00"];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    } else {
      // Single burst for winner reveal
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ffd700", "#ff0000", "#ffffff"],
      });
    }
  }, [trigger, mode]);

  return null;
}
