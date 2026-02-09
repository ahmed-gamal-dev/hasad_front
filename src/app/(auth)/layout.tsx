import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section style={{ padding: "24px" }}>
      <header style={{ marginBottom: "24px" }}>
        <h1>Auth</h1>
      </header>
      {children}
    </section>
  );
}
