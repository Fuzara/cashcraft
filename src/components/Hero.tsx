"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Hero = () => {
  const headlineRef = useRef(null);
  const subtextRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(headlineRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
    .fromTo(subtextRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
      "-=0.5"
    )
    .fromTo(buttonRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.5"
    );
  }, []);

  return (
    <section style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
      textAlign: "center",
      backgroundColor: "#f5f5f5",
    }}>
      <h1 ref={headlineRef} style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        Welcome to CashCraft 💸
      </h1>
      <p ref={subtextRef} style={{ fontSize: "1.2rem", maxWidth: "600px", marginBottom: "2rem" }}>
        Manage your finances smarter, better, faster. Track expenses, set goals, and grow wealth.
      </p>
      <button
        ref={buttonRef}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          backgroundColor: "#111",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#111")}
      >
        Get Started
      </button>
    </section>
  );
};

export default Hero;
