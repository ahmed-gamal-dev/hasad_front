import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <section style={{ padding: "24px" }}>
      <header style={{ marginBottom: "24px" }}>
        <h1>Dashboard</h1>
      </header>
      {children}
    </section>
  );
}
