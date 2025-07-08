import { gsap } from "gsap";

export function fadeIn(target: Element | null, delay = 0.3, duration = 1) {
  if (!target) return;

  gsap.fromTo(
    target,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration, delay, ease: "power3.out" }
  );
}
