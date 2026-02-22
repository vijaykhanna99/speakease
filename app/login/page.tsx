'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Stethoscope, User, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [tab, setTab] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Login failed.');
      return;
    }
    // Redirect based on role
    const stored = JSON.parse(sessionStorage.getItem('speakease_session') || 'null');
    if (stored?.role === 'admin') router.push('/admin');
    else if (stored?.role === 'doctor') router.push('/doctor-dashboard');
    else router.push('/dashboard');
  };

  const fillDemo = (type: 'patient' | 'doctor' | 'admin') => {
    const creds = {
      patient: { email: 'ravi@example.com', password: 'Patient@123' },
      doctor:  { email: 'dr.priya@speakease.in', password: 'Doctor@123' },
      admin:   { email: 'admin@speakease.in', password: 'Admin@123' },
    };
    setEmail(creds[type].email);
    setPassword(creds[type].password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center px-4 py-8 sm:py-16">

      {/* Background blobs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #14b8a6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 40%)' }}
      />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <span className="font-bold text-2xl text-white">Speak</span>
              <span className="font-bold text-2xl text-brand-400">Ease</span>
            </div>
          </Link>
          <p className="text-white/60 text-sm mt-2">India's #1 Speech & Hearing Care Platform</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Tab switcher */}
          <div className="flex border-b border-slate-100">
            {([
              { id: 'patient', label: 'I\'m a Patient', icon: User },
              { id: 'doctor',  label: 'I\'m a Doctor',  icon: Stethoscope },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setTab(id); setError(''); setEmail(''); setPassword(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all border-b-2 ${
                  tab === id ? 'text-brand-600 border-brand-600 bg-brand-50/50' : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-6">
              {tab === 'patient' ? 'Sign in to manage your bookings and sessions.' : 'Sign in to access your doctor dashboard.'}
            </p>

            {/* Demo credentials */}
            <div className="mb-5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 mb-2">Demo accounts — click to fill:</p>
              <div className="flex flex-wrap gap-2">
                {tab === 'patient' && (
                  <button onClick={() => fillDemo('patient')}
                    className="text-xs bg-brand-50 border border-brand-200 text-brand-700 px-2.5 py-1 rounded-lg font-medium hover:bg-brand-100 transition-colors">
                    Patient Demo
                  </button>
                )}
                {tab === 'doctor' && (
                  <button onClick={() => fillDemo('doctor')}
                    className="text-xs bg-brand-50 border border-brand-200 text-brand-700 px-2.5 py-1 rounded-lg font-medium hover:bg-brand-100 transition-colors">
                    Doctor Demo (Approved)
                  </button>
                )}
                <button onClick={() => fillDemo('admin')}
                  className="text-xs bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-1">
                  <Shield size={10} /> Admin Demo
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 bg-slate-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 bg-slate-50"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ArrowRight size={15} /> Sign In</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              {tab === 'patient' && (
                <p className="text-sm text-slate-500">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-brand-600 font-semibold hover:underline">Create one free</Link>
                </p>
              )}
              {tab === 'doctor' && (
                <p className="text-sm text-slate-500">
                  Want to join SpeakEase?{' '}
                  <Link href="/join-as-therapist" className="text-brand-600 font-semibold hover:underline">Register as a Doctor</Link>
                </p>
              )}
              <p className="text-xs text-slate-400">
                Admin?{' '}
                <button onClick={() => fillDemo('admin')} className="text-red-500 font-semibold hover:underline">
                  Use admin credentials above
                </button>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © 2025 SpeakEase · <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
        </p>
      </div>
    </div>
  );
}
