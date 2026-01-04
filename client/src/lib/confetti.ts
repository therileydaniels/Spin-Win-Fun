import confetti from "canvas-confetti";

const LUXE_COLORS = ["#C9A9A6", "#7D8B74", "#3D5A6C", "#C4956A", "#B8A99A", "#6B7B8C", "#D4AF37"];

export function fireWinConfetti(): void {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 25, spread: 360, ticks: 80, zIndex: 9999 };

  function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: LUXE_COLORS,
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: LUXE_COLORS,
    });
  }, 250);
}

export function fireCenterBurst(): void {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { x: 0.5, y: 0.5 },
    colors: LUXE_COLORS,
    zIndex: 9999,
  });
}
