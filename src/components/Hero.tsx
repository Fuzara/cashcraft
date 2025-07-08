"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";

export default function Hero() {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { duration: 1, ease: "power2.out" } });

    tl.from(titleRef.current, { x: -50, opacity: 0 })
      .from(subtitleRef.current, { x: -30, opacity: 0 }, "-=0.5")
      .from(buttonRef.current, { y: 20, opacity: 0 }, "-=0.5")
      .from(imageRef.current, { scale: 0.95, opacity: 0 }, "-=1");
  }, []);

  return (
    <section
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4rem 6rem",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        gap: "4rem",
        flexWrap: "wrap",
      }}
    >
      {/* Text Section */}
      <div style={{ maxWidth: "600px", flex: 1 }}>
        <h1 ref={titleRef} style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Welcome to CashCraft 🚀
        </h1>
        <p
          ref={subtitleRef}
          style={{ fontSize: "1.25rem", color: "#444", marginBottom: "2rem", lineHeight: 1.6 }}
        >
          Manage your finances smarter, faster, and easier — all in one place. Your money, your rules.
        </p>
        <button
          ref={buttonRef}
          style={{
            padding: "1rem 2rem",
            fontSize: "1rem",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Get Started
        </button>
      </div>

      {/* Image Section */}
      <div ref={imageRef} style={{ flex: 1, minWidth: "300px", textAlign: "center" }}>
        <Image
          src="/hero-img.jpg" // ✅ Replace with your actual image path inside public/
          alt="CashCraft Dashboard"
          width={500}
          height={400}
          style={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: "1rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        />
      </div>
    </section>
  );
}
