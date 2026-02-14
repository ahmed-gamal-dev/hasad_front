import type { ReactNode } from 'react';

export default function ServiceReportLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <section>{children}</section>;
}
