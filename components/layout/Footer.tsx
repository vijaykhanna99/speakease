import Link from 'next/link';
import { Phone, Mail, MapPin, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Top CTA Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to start your therapy journey?
          </h2>
          <p className="text-brand-100 mb-6 text-lg">
            Join 10,000+ patients who found the right therapist on SpeakEase
          </p>
          <Link
            href="/find-therapist"
            className="inline-block bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
          >
            Find a Therapist Now →
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-white">
                Speak<span className="text-brand-400">Ease</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              India's most trusted platform connecting patients of all ages with verified speech therapists, psychologists, physiotherapists, and more.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 flex items-center justify-center transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Specializations</h3>
            <ul className="space-y-2.5 text-sm">
              {['Speech Therapy', 'Audiology', 'Psychology', 'Physiotherapy', 'Occupational Therapy', 'Behavioral Therapy', 'Special Education'].map((s) => (
                <li key={s}>
                  <Link href={`/find-therapist?spec=${s}`} className="hover:text-brand-400 transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Patients */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">For Patients</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Find a Therapist', href: '/find-therapist' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Online Therapy', href: '/find-therapist?mode=online' },
                { label: 'Conditions We Treat', href: '#conditions' },
                { label: 'Resources & Articles', href: '#resources' },
                { label: 'Patient Community', href: '#community' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-brand-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="mt-0.5 text-brand-400 shrink-0" />
                <span>+91 80001 23456<br /><span className="text-xs text-slate-500">Mon–Sat 9am–6pm</span></span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="mt-0.5 text-brand-400 shrink-0" />
                <span>hello@speakease.in</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 text-brand-400 shrink-0" />
                <span>Bangalore · Mumbai · Chennai · Hyderabad · Delhi</span>
              </li>
            </ul>
            <div className="mt-5 p-3.5 bg-slate-800 rounded-xl">
              <p className="text-xs text-slate-400 mb-2">Are you a therapist?</p>
              <Link
                href="/join-as-therapist"
                className="text-brand-400 hover:text-brand-300 font-semibold text-sm transition-colors"
              >
                Join our network →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2025 SpeakEase Health Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
