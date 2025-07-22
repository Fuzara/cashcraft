"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const buttonRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      headingRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 0.2 }
    );

    gsap.fromTo(
      subheadingRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 0.5 }
    );

    gsap.fromTo(
      buttonRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8, delay: 0.8 }
    );

    gsap.to(bgRef.current, {
      scrollTrigger: {
        trigger: bgRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      opacity: 0,
      ease: "none",
    });
  }, []);

  return (
    <section className={styles.hero}>
      <div ref={bgRef} className={styles.backgroundImage}></div>

      <h1 ref={headingRef} className={styles.heading}>
        CashCraft helps you <span className={styles.highlight}>split</span>,{" "}
        <span className={styles.highlight}>track</span>, and{" "}
        <span className={styles.highlight}>grow</span> your money effortlessly
      </h1>

      <p ref={subheadingRef} className={styles.subheading}>
        A sleek, modern way to automate your finances, built for the modern African millennial.
      </p>

      <button ref={buttonRef} className={styles.cta}>
        Download the App
      </button>
    </section>
  
  );
}
