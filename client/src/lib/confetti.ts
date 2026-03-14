import confetti from "canvas-confetti";
import { PRESET_COLORS } from "./wheelSegments";

export function fireWinConfetti(): (() => void) {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: PRESET_COLORS,
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: PRESET_COLORS,
    });
  }, 250);

  return () => clearInterval(interval);
}

export function fireCenterBurst(): void {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors: PRESET_COLORS,
    zIndex: 9999,
  });
}
