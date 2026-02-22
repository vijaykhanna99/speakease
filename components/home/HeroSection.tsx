'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Star, Shield, Mic, Ear, CheckCircle, Users, MapPin, Video } from 'lucide-react';

const primaryConcerns = [
  'Stuttering', 'Hearing Loss', 'Voice Disorders', 'Aphasia / Stroke',
  'Speech Delay', 'Tinnitus', 'Articulation', 'Cochlear Implant Rehab',
];

const otherConcerns = ['Anxiety', 'Back Pain', 'Autism (ASD)', 'ADHD'];

const specialties = [
  { icon: '🗣️', label: 'Speech Therapy',        count: '48 specialists', color: 'bg-brand-600 text-white', badge: 'Core' },
  { icon: '👂', label: 'Audiology',              count: '15 specialists', color: 'bg-blue-600 text-white',  badge: 'Core' },
  { icon: '🧠', label: 'Psychology',             count: '32 specialists', color: 'bg-white text-slate-700', badge: null },
  { icon: '🤲', label: 'Occupational Therapy',   count: '27 specialists', color: 'bg-white text-slate-700', badge: null },
  { icon: '🏃', label: 'Physiotherapy',          count: '19 specialists', color: 'bg-white text-slate-700', badge: null },
  { icon: '📚', label: 'Special Education',      count: '34 specialists', color: 'bg-white text-slate-700', badge: null },
];

const liveActivity = [
  { text: 'Session booked in Bangalore', time: '2m ago',  dot: '#14b8a6' },
  { text: 'Hearing assessment booked',   time: '5m ago',  dot: '#2563eb' },
  { text: 'New therapist joined — Pune', time: '12m ago', dot: '#a855f7' },
];

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const [activityIdx, setActivityIdx] = useState(0);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/find-therapist${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900" />
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, #14b8a6 0%, transparent 50%),
                            radial-gradient(circle at 70% 20%, #7c3aed 0%, transparent 40%),
                            radial-gradient(circle at 80% 80%, #f97316 0%, transparent 35%)`,
        }}
      />
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Content ── */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 mb-6">
              <Shield size={14} className="text-brand-400" />
              <span className="text-white/90 text-sm font-medium">India's #1 Speech & Hearing Care Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5">
              Expert care for{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-brand-400">speech</span>
                <span className="absolute bottom-0 left-0 right-0 h-3 bg-brand-400/20 rounded-full" />
              </span>
              {' '}&{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-brand-300">hearing</span>
                <span className="absolute bottom-0 left-0 right-0 h-3 bg-brand-300/20 rounded-full" />
              </span>
            </h1>

            <p className="text-lg text-white/70 mb-4 max-w-lg leading-relaxed">
              Find verified Speech-Language Pathologists and Audiologists — plus Psychologists,
              Physiotherapists, and more. Online or in-clinic. For all ages.
            </p>

            {/* Specialty badges */}
            <div className="flex gap-3 mb-7">
              <div className="flex items-center gap-2 bg-brand-600/30 border border-brand-500/50 rounded-xl px-3 py-2">
                <Mic size={14} className="text-brand-300" />
                <span className="text-white/90 text-sm font-semibold">Speech Therapy</span>
              </div>
              <div className="flex items-center gap-2 bg-brand-600/30 border border-brand-500/50 rounded-xl px-3 py-2">
                <Ear size={14} className="text-brand-300" />
                <span className="text-white/90 text-sm font-semibold">Audiology</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                <span className="text-white/70 text-sm">+6 more</span>
              </div>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative mb-5">
              <div className="flex bg-white rounded-2xl shadow-2xl shadow-brand-900/40 p-2 gap-2">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search: stuttering, hearing loss, voice disorder..."
                    className="flex-1 py-2 text-slate-800 placeholder:text-slate-400 text-sm bg-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-all active:scale-95 whitespace-nowrap text-sm"
                >
                  Find Therapist
                </button>
              </div>
            </form>

            {/* Quick chips */}
            <div className="mb-3">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">Speech & Hearing</p>
              <div className="flex flex-wrap gap-2">
                {primaryConcerns.map((c) => (
                  <Link key={c} href={`/find-therapist?q=${encodeURIComponent(c)}`}
                    className="text-xs bg-brand-600/30 hover:bg-brand-600/50 text-white/90 border border-brand-500/40 rounded-full px-3 py-1.5 transition-all">
                    {c}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">Also available</p>
              <div className="flex flex-wrap gap-2">
                {otherConcerns.map((c) => (
                  <Link key={c} href={`/find-therapist?q=${encodeURIComponent(c)}`}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/15 rounded-full px-3 py-1.5 transition-all">
                    {c}
                  </Link>
                ))}
              </div>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-5">
              <div className="flex -space-x-2">
                {['#0d9488','#7c3aed','#f97316','#ec4899'].map((color, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-brand-950 flex items-center justify-center text-white text-xs font-bold" style={{ background: color }}>
                    {['RK','SM','AP','NJ'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                  <span className="text-white/90 text-sm font-semibold ml-1">4.9</span>
                </div>
                <p className="text-white/60 text-xs">Trusted by 10,000+ patients across India</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Platform showcase (no doctor booking) ── */}
          <div className="relative hidden lg:block">

            {/* Main visual card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-white font-bold text-base">500+ Verified Specialists</p>
                  <p className="text-white/60 text-xs mt-0.5">Across 8 therapy disciplines · 50+ cities</p>
                </div>
                <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 rounded-xl px-3 py-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-300 text-xs font-semibold">Live</span>
                </div>
              </div>

              {/* Specialization grid — 2×3 */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {specialties.map((sp) => (
                  <div
                    key={sp.label}
                    className={`relative flex items-center gap-3 rounded-2xl px-3.5 py-3 ${
                      sp.badge
                        ? sp.color + ' shadow-sm'
                        : 'bg-white/10 border border-white/15'
                    }`}
                  >
                    <span className="text-xl shrink-0">{sp.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${sp.badge ? '' : 'text-white/90'}`}>
                        {sp.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${sp.badge ? 'opacity-80' : 'text-white/50'}`}>
                        {sp.count}
                      </p>
                    </div>
                    {sp.badge && (
                      <span className="absolute top-2 right-2 bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        {sp.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Trust strip */}
              <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 mb-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { value: 'RCI', label: 'Verified', icon: Shield },
                    { value: 'Online', label: '& In-Clinic', icon: Video },
                    { value: 'All', label: 'Ages', icon: Users },
                  ].map(({ value, label, icon: Icon }) => (
                    <div key={label} className="flex flex-col items-center gap-1">
                      <Icon size={14} className="text-brand-300" />
                      <p className="text-white font-bold text-sm">{value}</p>
                      <p className="text-white/50 text-xs">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live activity feed */}
              <div className="space-y-2">
                <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-2">Recent Activity</p>
                {liveActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.dot }} />
                    <p className="text-white/80 text-xs flex-1">{item.text}</p>
                    <span className="text-white/35 text-xs shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating stat — top right */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-3.5 shadow-xl border border-slate-100 z-20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
                  <MapPin size={13} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Available in</p>
                  <p className="text-xs font-bold text-slate-800">50+ cities</p>
                </div>
              </div>
            </div>

            {/* Floating stat — bottom left */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3.5 shadow-xl border border-slate-100 z-20">
              <div className="flex items-center gap-2">
                <CheckCircle size={15} className="text-green-500" />
                <div>
                  <p className="text-xs text-slate-400">Avg. booking time</p>
                  <p className="text-xs font-bold text-slate-800">Under 2 mins</p>
                </div>
              </div>
            </div>

          </div>
          {/* ── END RIGHT ── */}

        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60L60 50C120 40 240 20 360 16.7C480 13.3 600 26.7 720 33.3C840 40 960 40 1080 36.7C1200 33.3 1320 26.7 1380 23.3L1440 20V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
