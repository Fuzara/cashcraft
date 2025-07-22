"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Hero.module.css";
import { useAuth } from "@/contexts/AuthProvider";
import { useBackendActor } from "@/hooks/useActor";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const buttonRef = useRef(null);
  const bgRef = useRef(null);
  const router = useRouter();

  const { isAuthenticated, login, logout, principal } = useAuth();
  const actor = useBackendActor();

  const log = async (event: string, metadata = "") => {
    try {
      await actor?.track_event?.(event, metadata);
    } catch (e) {
      console.warn("Logging failed:", e);
    }
  };

  const handleLogin = async () => {
    await log("click_login", "Hero");
    await login();
  };

  const handleSignUp = async () => {
    await log("click_signup", "Hero");
    router.push("/signup");
  };

  const handleDashboardRedirect = async () => {
    await log("click_dashboard", `isAuthenticated: ${isAuthenticated}`);
    router.push(isAuthenticated ? "/dashboard" : "/login");
  };

  const handleLogout = async () => {
    await log("click_logout", "Hero");
    await logout();
  };

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

    // Log Hero section load
    if (actor) {
      log("view_hero", `principal: ${principal ?? "anonymous"}`);
    }
  }, [actor]);

  return (
    <section className={styles.hero}>
      <div ref={bgRef} className={styles.backgroundImage}></div>

      <div className={styles.topNav}>
        {!isAuthenticated ? (
          <>
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleSignUp}>Sign Up</button>
          </>
        ) : (
          <>
            <button onClick={handleDashboardRedirect}>Dashboard</button>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>

      <h1 ref={headingRef} className={styles.heading}>
        CashCraft helps you <span className={styles.highlight}>split</span>,{" "}
        <span className={styles.highlight}>track</span>, and{" "}
        <span className={styles.highlight}>grow</span> your money effortlessly
      </h1>

      <p ref={subheadingRef} className={styles.subheading}>
        A sleek, modern way to automate your finances, built for the modern African millennial.
      </p>

      <button
        ref={buttonRef}
        className={styles.cta}
        onClick={handleDashboardRedirect}
      >
        Go to Dashboard
      </button>
    </section>
  );
}
