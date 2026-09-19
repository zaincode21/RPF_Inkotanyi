import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#vision', label: 'Vision' },
    { href: '#policy', label: 'Policy' },
    { href: '#contact', label: 'Contact' },
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`nav ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="container flex justify-between items-center" style={{ height: '100%' }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="nav__logo"
          onClick={(e) => scrollToSection(e, '#home')}
        >
          <BrandLogo size="md" />
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="nav__links hidden md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className="nav__link"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="nav__actions hidden md:flex">
          <button
            onClick={(e) => scrollToSection(e, '#policy')}
            className="btn btn--red btn--sm"
          >
            <span>Get Started</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: isScrolled ? 'var(--text-on-dark)' : 'var(--text-primary)' }}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-ink border-t border-white/5 overflow-hidden"
          >
            <nav className="flex flex-col p-6 gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="nav__link"
                  style={{ textAlign: 'left', fontSize: '14px' }}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={(e) => scrollToSection(e, '#policy')}
                className="btn btn--red"
                style={{ width: '100%' }}
              >
                <span>Get Started</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
