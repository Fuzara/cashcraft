"use client";

import { useEffect, useRef } from "react";
import { fadeIn } from "@/lib/animations";

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    fadeIn(titleRef.current);
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      background: "#f5f5f5",
    }}>
      <h1
        ref={titleRef}
        style={{
          fontSize: "3rem",
          fontWeight: "bold",
        }}
      >
        Welcome to CashCraft 🚀
      </h1>
    </main>
  );
}
