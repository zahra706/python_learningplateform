'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold no-underline">
          Mon App
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6">
          <NavLink href="/">Accueil</NavLink>
          <NavLink href="/about">À propos</NavLink>
          <NavLink href="/contact">Contact</NavLink>
          <NavLink href="/services">Services</NavLink>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-black text-white">
          <MobileLink href="/" onClick={() => setIsOpen(false)}>Accueil</MobileLink>
          <MobileLink href="/about" onClick={() => setIsOpen(false)}>À propos</MobileLink>
          <MobileLink href="/contact" onClick={() => setIsOpen(false)}>Contact</MobileLink>
          <MobileLink href="/services" onClick={() => setIsOpen(false)}>Services</MobileLink>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-gray-300 hover:text-white no-underline transition-colors duration-200"
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className="block text-gray-300 hover:text-white no-underline transition-colors duration-200"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
