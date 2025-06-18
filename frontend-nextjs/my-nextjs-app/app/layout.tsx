import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Student Portal',
  description: 'Portal for students to manage formations and books',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="navbar">
          <div className="container">
            <a href="/" className="logo">Student Portal</a>
            <div className="nav-links">
              <a href="/formations">Formations</a>
              <a href="/books">Books</a>
              <a href="/login">Login</a>
            </div>
          </div>
        </nav>

        <main className="main-container">{children}</main>

        <ToastContainer position="bottom-right" />
      </body>
    </html>
  );
}