import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetSettings } from "@workspace/api-client-react";
import logoImg from "@assets/image_1774764313293.png";

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: settings } = useGetSettings();

  const logoUrl = settings?.logoUrl || logoImg;
  const restName = settings?.restaurantNameAr || "صاج فحم ولحم";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/menu", label: "قائمة الطعام" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "glass py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors shadow-lg">
              <img src={logoUrl} alt={restName} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">{restName}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{restName}</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-all hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/menu"
              className="px-6 py-2.5 rounded-full font-bold bg-primary text-primary-foreground glow-primary hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              اطلب الآن
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full glass border-t border-white/5 py-4 px-4 flex flex-col gap-4 shadow-2xl md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-lg font-semibold text-center transition-colors ${
                  location === link.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-lg font-bold bg-primary text-primary-foreground text-center"
            >
              اطلب الآن
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
