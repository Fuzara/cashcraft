"use client";

import { useEffect } from "react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";

export default function Home() {
useEffect(() => {
    // TEMP: Auto login simulation
    localStorage.setItem("cc_logged_in", "true");
  }, []);

  return (
    <>
      <Hero />
      <Features />
    </>
  );
}
