'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Phone, Stethoscope, User, LogOut, LayoutDashboard, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDoctorPage = pathname?.startsWith('/join-as-therapist');
  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push('/');
  };

  const dashboardHref = user?.role === 'doctor' ? '/doctor-dashboard'
    : user?.role === 'admin' ? '/admin'
    : '/dashboard';

  // Don't show normal header on admin pages
  if (isAdminPage && user?.role === 'admin') {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-bold text-white text-sm">SpeakEase</span>
              </Link>
              <div className="w-px h-4 bg-slate-600" />
              <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-lg px-2.5 py-1">
                <Shield size={11} className="text-red-400" />
                <span className="text-red-300 text-xs font-bold uppercase tracking-wide">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">{user.name}</span>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md border-b border-slate-100'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-100/80 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-bold text-lg leading-none">S</span>
            </div>
            <div>
              <span className="font-bold text-xl text-slate-900">Speak</span>
              <span className="font-bold text-xl text-brand-600">Ease</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavItem href="/find-therapist" label="Find Therapist" active={pathname === '/find-therapist'} />
            <NavItem href="/#specializations" label="Specializations" />
            <NavItem href="/#how-it-works" label="How It Works" />
            <NavItem href="/#about" label="About" />

            <div className="w-px h-5 bg-slate-200 mx-2" />

            <Link
              href="/join-as-therapist"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isDoctorPage
                  ? 'bg-brand-600 text-white'
                  : 'text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200'
              }`}
            >
              <Stethoscope size={14} />
              For Doctors
            </Link>
          </nav>

          {/* Desktop CTA / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              /* Logged-in user dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-xl px-3 py-2 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      {user.role === 'doctor' && (
                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          user.doctorStatus === 'approved' ? 'bg-green-100 text-green-700'
                          : user.doctorStatus === 'pending' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {user.doctorStatus === 'approved' ? 'Doctor · Verified' : user.doctorStatus === 'pending' ? 'Under Review' : 'Not Approved'}
                        </span>
                      )}
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-red-100 text-red-700">Admin</span>
                      )}
                    </div>
                    <Link href={dashboardHref} onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors">
                      <LayoutDashboard size={14} />
                      {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                    </Link>
                    <Link href="/find-therapist" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors">
                      <User size={14} />
                      Find Therapist
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged-out buttons */
              <>
                <a
                  href="tel:+918000123456"
                  className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-600 font-medium transition-colors"
                >
                  <Phone size={14} />
                  <span>+91 80001 23456</span>
                </a>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/find-therapist"
                  className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  Book Session
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-slate-100 py-4 space-y-1">
            {[
              { href: '/find-therapist', label: 'Find Therapist' },
              { href: '/#specializations', label: 'Specializations' },
              { href: '/#how-it-works', label: 'How It Works' },
              { href: '/#about', label: 'About' },
            ].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg font-medium transition-colors">
                {item.label}
              </Link>
            ))}

            <div className="px-4 pt-2 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 py-2 px-1">
                    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link href={dashboardHref} onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-brand-600 text-white px-5 py-3 rounded-xl font-semibold">
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-xl font-semibold">
                    <LogOut size={15} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/join-as-therapist" onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-brand-50 border border-brand-200 text-brand-700 px-5 py-3 rounded-xl font-semibold transition-colors">
                    <Stethoscope size={15} />
                    Register as a Doctor
                  </Link>
                  <Link href="/login" onClick={() => setOpen(false)}
                    className="block w-full text-center border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-semibold">
                    Sign In
                  </Link>
                  <Link href="/find-therapist" onClick={() => setOpen(false)}
                    className="block w-full bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-xl font-semibold text-center transition-colors">
                    Book a Session
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavItem({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link href={href}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
        active ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'
      }`}>
      {label}
    </Link>
  );
}
