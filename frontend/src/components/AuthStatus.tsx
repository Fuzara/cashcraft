// /components/AuthStatus.tsx
"use client";

import { useAuth } from "@/contexts/AuthProvider";

export default function AuthStatus() {
  const { principal, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      <p>Logged in as: {principal}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
