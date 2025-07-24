"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./Features.module.css";

export default function Features() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className={styles.features}>
      <h2 className={styles.title}>How CashCraft Works</h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>💸 Split</h3>
          <p>Create wallets for rent, savings, fun and auto-allocate your income instantly.</p>
        </div>
        <div className={styles.card}>
          <h3>📊 Track</h3>
          <p>See exactly where your money goes with smart visual insights and logs.</p>
        </div>
        <div className={styles.card}>
          <h3>📈 Grow</h3>
          <p>Make informed decisions with AI-powered recommendations tailored to your spending habits.</p>
        </div>
      </div>
    </section>
  );
}
