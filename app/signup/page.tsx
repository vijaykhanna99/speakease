'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const passwordStrength = (() => {
    const p = form.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const result = await signup(form.name, form.email, form.phone, form.password);
    setLoading(false);
    if (!result.success) { setError(result.error || 'Signup failed.'); return; }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #14b8a6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 40%)' }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <span className="font-bold text-2xl text-white">Speak</span>
              <span className="font-bold text-2xl text-brand-400">Ease</span>
            </div>
          </Link>
          <p className="text-white/60 text-sm mt-2">Create your patient account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-6">Book therapy sessions and track your progress.</p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Full Name" placeholder="Ravi Krishnamurthy" value={form.name} onChange={set('name')} icon={User} required />
            <InputField label="Email Address" placeholder="your@email.com" value={form.email} onChange={set('email')} icon={Mail} type="email" required />
            <InputField label="Mobile Number (WhatsApp)" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={set('phone')} icon={Phone} type="tel" />

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={e => set('password')(e.target.value)} placeholder="Create a strong password"
                  className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 bg-slate-50"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                      i <= passwordStrength
                        ? passwordStrength <= 1 ? 'bg-red-400' : passwordStrength <= 2 ? 'bg-yellow-400' : passwordStrength <= 3 ? 'bg-blue-400' : 'bg-green-400'
                        : 'bg-slate-200'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" required value={form.confirm}
                  onChange={e => set('confirm')(e.target.value)} placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 bg-slate-50 transition-colors ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                  }`}
                />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><ArrowRight size={15} /> Create Account</>
              }
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
            </p>
            <p className="text-sm text-slate-500">
              Are you a doctor?{' '}
              <Link href="/join-as-therapist" className="text-brand-600 font-semibold hover:underline">Register here</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © 2025 SpeakEase · <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
        </p>
      </div>
    </div>
  );
}

function InputField({
  label, placeholder, value, onChange, icon: Icon, type = 'text', required,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; icon: any; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type={type} required={required} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 bg-slate-50"
        />
      </div>
    </div>
  );
}
