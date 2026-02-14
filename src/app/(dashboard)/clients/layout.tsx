import type { ReactNode } from 'react';

export default function ClientsLayout({ children }: { children: ReactNode }) {
  return <section>{children}</section>;
}
