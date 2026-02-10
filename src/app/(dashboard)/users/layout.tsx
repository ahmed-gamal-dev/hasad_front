import type { ReactNode } from "react";

export default function UsersLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {/* <header style={{ marginBottom: "16px" }}>
        <h2>Users</h2>
      </header> */}
      {children}
    </section>
  );
}
