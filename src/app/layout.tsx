import '../styles/globals.css';
import Providers from './providers';

export const metadata = {
  title: 'FieldOps HQ',
  description: 'Field Operations Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className='overflow-hidden p-0 m-0'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}