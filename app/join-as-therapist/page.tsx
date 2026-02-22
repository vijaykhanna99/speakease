'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle, Upload, ChevronRight, ChevronLeft,
  Stethoscope, Star, TrendingUp, Shield, Users, Clock,
  AlertCircle, Eye, EyeOff, Globe, Video, Building2,
  Phone, Mail, MapPin, Award, BookOpen, FileText,
  Calendar, IndianRupee, Languages,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { registerDoctor } from '@/lib/auth';

/* ─── Data ─── */
const SPECIALIZATIONS = [
  'Speech Therapy', 'Audiology', 'Psychology', 'Occupational Therapy',
  'Physiotherapy', 'Behavioral Therapy', 'Special Education',
  'Child Development', 'Developmental Pediatrics', 'Neurology',
  'Psychiatry', 'Neuropsychology',
];

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
  'Marathi', 'Bengali', 'Gujarati', 'Malayalam', 'Punjabi', 'Odia',
];

const AGE_GROUPS = [
  'Infants (0–1)', 'Toddlers (1–3)', 'Preschool (3–5)',
  'Children (6–12)', 'Teens (13–17)', 'Adults (18–60)', 'Seniors (60+)',
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BENEFITS = [
  { icon: TrendingUp, value: '₹30K–₹1.5L', label: 'Monthly earnings potential', color: 'text-brand-600 bg-brand-50' },
  { icon: Users,      value: '10,000+',     label: 'Patients on the platform',   color: 'text-purple-600 bg-purple-50' },
  { icon: Globe,      value: '50+ Cities',  label: 'Patient reach across India',  color: 'text-blue-600 bg-blue-50' },
  { icon: Clock,      value: '2 min',       label: 'Avg. session booking time',   color: 'text-coral-600 bg-coral-50' },
];

const STEPS = [
  { id: 1, label: 'Personal Info',    icon: Users },
  { id: 2, label: 'Qualifications',  icon: Award },
  { id: 3, label: 'Practice Setup',  icon: Building2 },
  { id: 4, label: 'Documents',       icon: FileText },
  { id: 5, label: 'Review',          icon: Eye },
];

const VERIFICATION_TIMELINE = [
  { step: 'Submitted',          desc: 'Your application has been received.',                done: true  },
  { step: 'Document Review',    desc: 'Our team verifies your uploaded certificates.',       done: false },
  { step: 'Registration Check', desc: 'RCI / MCI registration number is cross-verified.',   done: false },
  { step: 'Profile Approved',   desc: 'Your profile goes live — patients can book you!',    done: false },
];

type UploadState = 'idle' | 'uploading' | 'done';

/* ─── Main Component ─── */
export default function JoinAsTherapistPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  /* Form state */
  const [personal, setPersonal] = useState({
    firstName: '', lastName: '', email: '', phone: '', gender: '',
    city: '', state: '', pincode: '',
    password: '', confirmPassword: '',
  });
  const [submitError, setSubmitError] = useState('');

  const [professional, setProfessional] = useState({
    specializations: [] as string[],
    otherSpecialization: '',
    experience: '',
    regBody: 'RCI',
    regNumber: '',
    qualifications: [{ degree: '', institute: '', year: '' }],
    languages: ['English'],
    ageGroups: [] as string[],
    bio: '',
  });

  const [practice, setPractice] = useState({
    mode: 'both' as 'online' | 'in-clinic' | 'both',
    clinicName: '',
    clinicAddress: '',
    fee: '',
    sessionDuration: '45',
    availability: {} as Record<string, boolean>,
    startTime: '',
    endTime: '',
  });

  const [uploads, setUploads] = useState<Record<string, UploadState>>({
    photo: 'idle', degree: 'idle', regCert: 'idle', govId: 'idle', expCert: 'idle',
  });
  const [fileData, setFileData] = useState<Record<string, { dataUrl: string; name: string; type: string }>>({});

  /* Helpers */
  const toggleSpec  = (s: string) => setProfessional(p => ({
    ...p, specializations: p.specializations.includes(s)
      ? p.specializations.filter(x => x !== s) : [...p.specializations, s],
  }));

  const toggleLang  = (l: string) => setProfessional(p => ({
    ...p, languages: p.languages.includes(l)
      ? p.languages.filter(x => x !== l) : [...p.languages, l],
  }));

  const toggleAge   = (a: string) => setProfessional(p => ({
    ...p, ageGroups: p.ageGroups.includes(a)
      ? p.ageGroups.filter(x => x !== a) : [...p.ageGroups, a],
  }));

  const toggleDay   = (d: string) => setPractice(p => ({
    ...p, availability: { ...p.availability, [d]: !p.availability[d] },
  }));

  const handleFileUpload = (key: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum 5 MB per document.');
      return;
    }
    setUploads(u => ({ ...u, [key]: 'uploading' }));
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target!.result as string;
      setFileData(d => ({ ...d, [key]: { dataUrl, name: file.name, type: file.type } }));
      setUploads(u => ({ ...u, [key]: 'done' }));
    };
    reader.onerror = () => {
      setUploads(u => ({ ...u, [key]: 'idle' }));
      alert('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const canStep1 = personal.firstName && personal.lastName && personal.email && personal.phone && personal.city
    && personal.password.length >= 6 && personal.password === personal.confirmPassword;
  const canStep2 = professional.specializations.length > 0 && professional.regNumber && professional.experience && professional.bio;
  const canStep3 = practice.fee && Object.values(practice.availability).some(Boolean);
  const canStep4 = uploads.photo === 'done' && uploads.degree === 'done' && uploads.regCert === 'done';

  if (submitted) return <SubmittedScreen name={personal.firstName} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 pt-20 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* Left: value prop */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-5">
                <Stethoscope size={14} className="text-brand-400" />
                <span className="text-white/90 text-sm font-medium">Join India's fastest-growing therapy network</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Reach thousands of patients.<br />
                <span className="text-brand-400">Practice on your terms.</span>
              </h1>
              <p className="text-white/70 text-base leading-relaxed mb-7 max-w-lg">
                Register your profile, pass our verification, and start receiving bookings — online or in-clinic.
                We handle discovery, payments, and reminders. You focus on therapy.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {BENEFITS.map((b) => (
                  <div key={b.label} className="bg-white/10 border border-white/15 rounded-2xl p-4">
                    <div className={`w-8 h-8 rounded-xl ${b.color} flex items-center justify-center mb-2`}>
                      <b.icon size={14} />
                    </div>
                    <p className="text-white font-bold text-lg leading-none mb-1">{b.value}</p>
                    <p className="text-white/55 text-xs">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Process overview */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 space-y-3">
              <p className="text-white font-bold mb-4">How registration works</p>
              {[
                { n: '1', t: 'Fill your profile',     d: 'Personal, professional, and practice details' },
                { n: '2', t: 'Upload documents',      d: 'Degree certificates + RCI/MCI registration' },
                { n: '3', t: 'Admin verification',    d: 'Our team reviews & verifies — 24–48 hrs' },
                { n: '4', t: 'Go live & get booked',  d: 'Profile published, patients start booking you' },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{n}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t}</p>
                    <p className="text-white/50 text-xs">{d}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <Shield size={13} className="text-green-400" />
                <p className="text-white/60 text-xs">All data encrypted. Never shared publicly without approval.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Wave */}
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full">
          <path d="M0 40L1440 40L1440 20C1200 0 960 0 720 10C480 20 240 30 0 20Z" fill="#f8fafc"/>
        </svg>
      </div>

      {/* Form area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-16">

        {/* Step progress */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const isDone   = step > s.id;
              const isActive = step === s.id;
              const Icon     = s.icon;
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isDone   ? 'bg-brand-600 text-white'
                      : isActive ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                      : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isDone ? <CheckCircle size={18} /> : <Icon size={17} />}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${isActive ? 'text-brand-600' : isDone ? 'text-slate-500' : 'text-slate-300'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${step > s.id ? 'bg-brand-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── FORM ── */}
          <div className="lg:col-span-2">

            {/* ─── STEP 1: Personal Info ─── */}
            {step === 1 && (
              <FormCard title="Personal Information" subtitle="Your basic contact and location details.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name *" placeholder="Priya" value={personal.firstName} onChange={v => setPersonal({...personal, firstName: v})} />
                  <Field label="Last Name *" placeholder="Sharma" value={personal.lastName} onChange={v => setPersonal({...personal, lastName: v})} />
                </div>
                <Field label="Email Address *" placeholder="doctor@email.com" value={personal.email} onChange={v => setPersonal({...personal, email: v})} type="email" icon={Mail} />
                <Field label="Mobile Number (WhatsApp) *" placeholder="+91 XXXXX XXXXX" value={personal.phone} onChange={v => setPersonal({...personal, phone: v})} type="tel" icon={Phone} />
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                  <div className="flex gap-2">
                    {['Male', 'Female', 'Prefer not to say'].map(g => (
                      <button key={g} onClick={() => setPersonal({...personal, gender: g})}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${personal.gender === g ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Field label="City *" placeholder="Bangalore" value={personal.city} onChange={v => setPersonal({...personal, city: v})} icon={MapPin} />
                  </div>
                  <Field label="State" placeholder="Karnataka" value={personal.state} onChange={v => setPersonal({...personal, state: v})} />
                </div>

                {/* Account credentials */}
                <div className="border-t border-slate-200 pt-4 mt-2">
                  <p className="text-sm font-bold text-slate-700 mb-3">Create Your Account Password</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Password *" placeholder="Min. 6 characters" value={personal.password} onChange={v => setPersonal({...personal, password: v})} type="password" icon={EyeOff} />
                    <div>
                      <Field label="Confirm Password *" placeholder="Re-enter password" value={personal.confirmPassword} onChange={v => setPersonal({...personal, confirmPassword: v})} type="password" icon={EyeOff} />
                      {personal.confirmPassword && personal.password !== personal.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={11} /> Passwords do not match
                        </p>
                      )}
                      {personal.confirmPassword && personal.password === personal.confirmPassword && personal.password.length >= 6 && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle size={11} /> Passwords match
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">You will use this email + password to log in once your application is approved.</p>
                </div>

                <NavButtons
                  next={() => setStep(2)} nextDisabled={!canStep1}
                  nextLabel="Save & Continue"
                />
              </FormCard>
            )}

            {/* ─── STEP 2: Qualifications ─── */}
            {step === 2 && (
              <FormCard title="Professional Qualifications" subtitle="Your specializations, registration, and credentials.">

                {/* Specializations */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Specializations * <span className="text-slate-400 font-normal">(select all that apply)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map(s => (
                      <button key={s} onClick={() => toggleSpec(s)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${professional.specializations.includes(s) ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-300'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Registration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Regulatory Body *</label>
                    <select value={professional.regBody} onChange={e => setProfessional({...professional, regBody: e.target.value})}
                      className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 bg-slate-50">
                      {['RCI', 'MCI', 'INC', 'AOTA', 'Other'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Registration Number *" placeholder="e.g. RCI-12345" value={professional.regNumber} onChange={v => setProfessional({...professional, regNumber: v})} icon={Award} />
                  </div>
                </div>

                <Field label="Years of Experience *" placeholder="e.g. 8" value={professional.experience} onChange={v => setProfessional({...professional, experience: v})} type="number" />

                {/* Qualifications rows */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Educational Qualifications *</label>
                  <div className="space-y-3">
                    {professional.qualifications.map((q, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <input placeholder="Degree (e.g. M.Sc. SLP)" value={q.degree}
                          onChange={e => { const qs = [...professional.qualifications]; qs[i].degree = e.target.value; setProfessional({...professional, qualifications: qs}); }}
                          className="col-span-3 sm:col-span-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-400 bg-white" />
                        <input placeholder="Institution" value={q.institute}
                          onChange={e => { const qs = [...professional.qualifications]; qs[i].institute = e.target.value; setProfessional({...professional, qualifications: qs}); }}
                          className="col-span-2 sm:col-span-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-400 bg-white" />
                        <input placeholder="Year" value={q.year} type="number"
                          onChange={e => { const qs = [...professional.qualifications]; qs[i].year = e.target.value; setProfessional({...professional, qualifications: qs}); }}
                          className="col-span-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-400 bg-white" />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setProfessional({...professional, qualifications: [...professional.qualifications, { degree: '', institute: '', year: '' }]})}
                    className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-semibold">
                    + Add another qualification
                  </button>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Languages you consult in *</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(l => (
                      <button key={l} onClick={() => toggleLang(l)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${professional.languages.includes(l) ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-300'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age groups */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Age groups you treat</label>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUPS.map(a => (
                      <button key={a} onClick={() => toggleAge(a)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${professional.ageGroups.includes(a) ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-purple-300'}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Professional Bio * <span className="text-slate-400 font-normal">(shown on your profile)</span>
                  </label>
                  <textarea rows={4} placeholder="Describe your experience, approach, areas of expertise, and what patients can expect from a session with you..."
                    value={professional.bio} onChange={e => setProfessional({...professional, bio: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none placeholder:text-slate-400" />
                  <p className="text-xs text-slate-400 mt-1 text-right">{professional.bio.length} / 500 chars</p>
                </div>

                <NavButtons prev={() => setStep(1)} next={() => setStep(3)} nextDisabled={!canStep2} />
              </FormCard>
            )}

            {/* ─── STEP 3: Practice Setup ─── */}
            {step === 3 && (
              <FormCard title="Practice Setup" subtitle="How you work, what you charge, and when you're available.">

                {/* Mode */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Consultation Mode *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { v: 'online',    l: 'Online Only',    icon: Video,      desc: 'Video call sessions' },
                      { v: 'in-clinic', l: 'In-Clinic Only', icon: Building2,  desc: 'At your clinic / hospital' },
                      { v: 'both',      l: 'Both',           icon: Globe,      desc: 'Online + In-Clinic' },
                    ].map(({ v, l, icon: Icon, desc }) => (
                      <button key={v} onClick={() => setPractice({...practice, mode: v as any})}
                        className={`flex sm:flex-col items-center gap-3 sm:gap-1.5 p-3.5 rounded-xl border-2 text-sm font-semibold transition-all ${practice.mode === v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:border-brand-300'}`}>
                        <Icon size={18} />
                        <span>{l}</span>
                        <span className="text-xs font-normal opacity-60">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clinic details if in-clinic */}
                {(practice.mode === 'in-clinic' || practice.mode === 'both') && (
                  <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic / Hospital Details</p>
                    <Field label="Clinic / Hospital Name" placeholder="e.g. Apollo Speech Centre" value={practice.clinicName} onChange={v => setPractice({...practice, clinicName: v})} />
                    <Field label="Full Address" placeholder="Street, Area, City, PIN" value={practice.clinicAddress} onChange={v => setPractice({...practice, clinicAddress: v})} />
                  </div>
                )}

                {/* Fee & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Session Fee (₹) *</label>
                    <div className="relative">
                      <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="number" placeholder="e.g. 800" value={practice.fee}
                        onChange={e => setPractice({...practice, fee: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 placeholder:text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Session Duration</label>
                    <select value={practice.sessionDuration} onChange={e => setPractice({...practice, sessionDuration: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 bg-slate-50">
                      {['30', '45', '60', '90'].map(d => <option key={d} value={d}>{d} minutes</option>)}
                    </select>
                  </div>
                </div>

                {/* Weekly availability */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Weekly Availability * <span className="text-slate-400 font-normal">(days you accept bookings)</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {WEEK_DAYS.map(day => (
                      <button key={day} onClick={() => toggleDay(day)}
                        className={`w-14 py-3 rounded-xl border-2 text-sm font-bold transition-all ${practice.availability[day] ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 text-slate-500 hover:border-brand-300'}`}>
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Field label="Start Time" placeholder="e.g. 09:00" value={practice.startTime} onChange={v => setPractice({...practice, startTime: v})} type="time" />
                    <Field label="End Time" placeholder="e.g. 18:00" value={practice.endTime} onChange={v => setPractice({...practice, endTime: v})} type="time" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">You can set more granular availability after your profile is approved.</p>
                </div>

                <NavButtons prev={() => setStep(2)} next={() => setStep(4)} nextDisabled={!canStep3} />
              </FormCard>
            )}

            {/* ─── STEP 4: Documents ─── */}
            {step === 4 && (
              <FormCard title="Upload Documents" subtitle="Required for verification. Stored securely — never shown publicly.">

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Verification requires original documents</p>
                    <p className="text-xs text-amber-700 mt-0.5">Upload clear scans or photos. PDF, JPG, PNG accepted. Max 5MB per file.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'photo',   label: 'Profile Photo',                       required: true,  hint: 'Professional headshot, clear background', accept: 'image/*' },
                    { key: 'degree',  label: 'Degree Certificate(s)',               required: true,  hint: 'Highest relevant qualification — PDF or image', accept: '.pdf,image/*' },
                    { key: 'regCert', label: 'RCI / MCI Registration Certificate', required: true,  hint: 'Must match the registration number entered — PDF or image', accept: '.pdf,image/*' },
                    { key: 'expCert', label: 'Experience Certificate(s)',            required: false, hint: 'Letters from previous employers or work experience proof — PDF or image', accept: '.pdf,image/*' },
                    { key: 'govId',   label: 'Government-issued ID',                required: false, hint: 'Aadhar, PAN, Passport, or Driving License', accept: 'image/*,.pdf' },
                  ].map(({ key, label, required, hint, accept }) => {
                    const state = uploads[key] as UploadState;
                    const fd = fileData[key];
                    const isImg = fd?.type?.startsWith('image/');
                    return (
                      <div key={key} className={`rounded-xl border-2 p-4 transition-all ${state === 'done' ? 'border-green-300 bg-green-50' : state === 'uploading' ? 'border-brand-300 bg-brand-50' : 'border-dashed border-slate-200 bg-white hover:border-brand-300'}`}>
                        <div className="flex items-center gap-4">
                          {/* Thumbnail or icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${state === 'done' ? 'bg-green-100' : state === 'uploading' ? 'bg-brand-100' : 'bg-slate-100'}`}>
                            {state === 'done' && isImg
                              ? <img src={fd!.dataUrl} alt="preview" className="w-full h-full object-cover" />
                              : state === 'done'
                              ? <CheckCircle size={20} className="text-green-600" />
                              : state === 'uploading'
                              ? <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                              : <Upload size={20} className="text-slate-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">
                              {label}
                              {required && <span className="text-red-400 ml-1">*</span>}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
                            {state === 'done' && fd && (
                              <p className="text-xs text-green-600 font-semibold mt-1 truncate">✓ {fd.name}</p>
                            )}
                          </div>
                          {state === 'uploading' ? (
                            <span className="shrink-0 text-xs text-brand-600 font-semibold">Uploading…</span>
                          ) : state === 'done' ? (
                            <label className="shrink-0 text-xs text-slate-500 hover:text-brand-600 font-semibold cursor-pointer border border-slate-200 px-3 py-1.5 rounded-lg hover:border-brand-300 transition-colors">
                              Replace
                              <input type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(key, f); e.target.value = ''; }} />
                            </label>
                          ) : (
                            <label className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer">
                              Choose File
                              <input type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(key, f); e.target.value = ''; }} />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-600">Privacy guarantee</p>
                  <p>• Documents are encrypted at rest (AES-256)</p>
                  <p>• Only seen by our internal verification team</p>
                  <p>• Never shared with patients or third parties</p>
                </div>

                <NavButtons prev={() => setStep(3)} next={() => setStep(5)} nextDisabled={!canStep4} />
              </FormCard>
            )}

            {/* ─── STEP 5: Review ─── */}
            {step === 5 && (
              <FormCard title="Review Your Application" subtitle="Check everything before submitting. You can edit after submission too.">

                {/* Summary cards */}
                <ReviewSection icon={Users} title="Personal">
                  <ReviewRow label="Name"     value={`Dr. ${personal.firstName} ${personal.lastName}`} />
                  <ReviewRow label="Email"    value={personal.email} />
                  <ReviewRow label="Phone"    value={personal.phone} />
                  <ReviewRow label="Location" value={`${personal.city}${personal.state ? ', ' + personal.state : ''}`} />
                </ReviewSection>

                <ReviewSection icon={Award} title="Qualifications">
                  <ReviewRow label="Specializations" value={professional.specializations.join(', ') || '—'} />
                  <ReviewRow label="Registration"    value={`${professional.regBody}-${professional.regNumber}`} />
                  <ReviewRow label="Experience"      value={`${professional.experience} years`} />
                  <ReviewRow label="Languages"       value={professional.languages.join(', ')} />
                </ReviewSection>

                <ReviewSection icon={Building2} title="Practice">
                  <ReviewRow label="Mode"     value={practice.mode === 'both' ? 'Online & In-Clinic' : practice.mode} />
                  <ReviewRow label="Fee"      value={`₹${practice.fee} / session`} />
                  <ReviewRow label="Duration" value={`${practice.sessionDuration} minutes`} />
                  <ReviewRow label="Days"     value={Object.entries(practice.availability).filter(([,v]) => v).map(([k]) => k).join(', ') || '—'} />
                </ReviewSection>

                <ReviewSection icon={FileText} title="Documents">
                  {[
                    { key: 'photo',   label: 'Profile Photo' },
                    { key: 'degree',  label: 'Degree Certificate' },
                    { key: 'regCert', label: 'Registration Certificate' },
                    { key: 'expCert', label: 'Experience Certificate' },
                    { key: 'govId',   label: 'Government ID' },
                  ].map(({ key, label }) => (
                    <ReviewRow key={key} label={label} value={uploads[key] === 'done' ? `✓ ${fileData[key]?.name || 'Uploaded'}` : 'Not uploaded'} green={uploads[key] === 'done'} />
                  ))}
                </ReviewSection>

                {/* Terms */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1 accent-brand-600" defaultChecked />
                    <p className="text-xs text-slate-600 leading-relaxed">
                      I confirm that all information provided is accurate and authentic. I understand that providing false information will result in permanent removal from the platform.
                      I agree to the <span className="text-brand-600 underline">Terms of Service</span> and <span className="text-brand-600 underline">Therapist Code of Conduct</span>.
                    </p>
                  </label>
                </div>

                {submitError && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-red-700 text-sm">{submitError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(4)}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-4 rounded-xl hover:bg-slate-50 text-sm flex items-center justify-center gap-2">
                    <ChevronLeft size={15} /> Edit
                  </button>
                  <button onClick={() => {
                    setSubmitError('');
                    const result = registerDoctor(
                      `${personal.firstName} ${personal.lastName}`,
                      personal.email,
                      personal.phone,
                      personal.password,
                      {
                        specializations: professional.specializations,
                        registrationBody: professional.regBody,
                        registrationNumber: professional.regNumber,
                        experience: professional.experience,
                        qualifications: professional.qualifications.filter(q => q.degree || q.institute),
                        bio: professional.bio,
                        languages: professional.languages,
                        ageGroups: professional.ageGroups,
                        gender: personal.gender,
                        city: personal.city,
                        state: personal.state,
                        pincode: personal.pincode,
                        mode: practice.mode,
                        fee: practice.fee,
                        duration: practice.sessionDuration,
                        clinicName: practice.clinicName || undefined,
                        clinicAddress: practice.clinicAddress || undefined,
                        availability: Object.entries(practice.availability).filter(([, v]) => v).map(([k]) => k),
                        availabilityStart: practice.startTime || undefined,
                        availabilityEnd: practice.endTime || undefined,
                        docPhoto: uploads.photo === 'done',
                        docDegree: uploads.degree === 'done',
                        docRegCert: uploads.regCert === 'done',
                        docGovId: uploads.govId === 'done',
                        docExpCert: uploads.expCert === 'done',
                        docPhotoData: fileData.photo?.dataUrl,
                        docDegreeData: fileData.degree?.dataUrl,
                        docRegCertData: fileData.regCert?.dataUrl,
                        docGovIdData: fileData.govId?.dataUrl,
                        docExpCertData: fileData.expCert?.dataUrl,
                      }
                    );
                    if (result.success) setSubmitted(true);
                    else setSubmitError(result.error || 'Submission failed. Please try again.');
                  }}
                    className="flex-[2] bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-95">
                    Submit for Verification →
                  </button>
                </div>
              </FormCard>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="space-y-5">

            {/* Verification timeline */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <p className="font-bold text-slate-900 text-sm mb-4">Verification Process</p>
              <div className="space-y-4">
                {VERIFICATION_TIMELINE.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {i === 0 ? '✓' : i + 1}
                      </div>
                      {i < VERIFICATION_TIMELINE.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-1 ${i === 0 ? 'bg-brand-200' : 'bg-slate-100'}`} style={{ minHeight: 20 }} />
                      )}
                    </div>
                    <div className="pb-3">
                      <p className={`text-sm font-semibold ${i === 0 ? 'text-brand-700' : 'text-slate-600'}`}>{item.step}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock size={11} />
                  Typical approval time: <strong className="text-slate-700">24–48 hours</strong>
                </p>
              </div>
            </div>

            {/* What you get */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white">
              <p className="font-bold text-sm mb-3">After approval you get</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  'Public profile visible to 10,000+ patients',
                  'Booking management dashboard',
                  'Automatic WhatsApp reminders',
                  'Secure payment collection',
                  'Monthly payout to your bank',
                  'Patient reviews on your profile',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/90 text-xs">
                    <CheckCircle size={13} className="text-brand-300 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <p className="font-bold text-slate-900 text-sm mb-3">Need help registering?</p>
              <p className="text-xs text-slate-500 mb-3">Our onboarding team is available Mon–Sat, 9am–6pm.</p>
              <a href="tel:+918000123456" className="flex items-center gap-2 text-brand-600 font-semibold text-sm hover:text-brand-700">
                <Phone size={14} />
                +91 80001 23456
              </a>
              <a href="mailto:doctors@speakease.in" className="flex items-center gap-2 text-brand-600 font-semibold text-sm hover:text-brand-700 mt-2">
                <Mail size={14} />
                doctors@speakease.in
              </a>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ─── Sub-components ─── */

function FormCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = 'text', icon: Icon }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string; icon?: any;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          className={`w-full ${Icon ? 'pl-10' : 'px-4'} pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 placeholder:text-slate-400 bg-white`} />
      </div>
    </div>
  );
}

function NavButtons({ prev, next, nextDisabled, nextLabel = 'Save & Continue' }: {
  prev?: () => void; next?: () => void; nextDisabled?: boolean; nextLabel?: string;
}) {
  return (
    <div className="flex gap-3 pt-2">
      {prev && (
        <button onClick={prev} className="flex items-center gap-1.5 px-5 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-sm transition-colors">
          <ChevronLeft size={15} /> Back
        </button>
      )}
      {next && (
        <button onClick={next} disabled={nextDisabled}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate:400 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-95">
          {nextLabel} <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}

function ReviewSection({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-b border-slate-200">
        <Icon size={14} className="text-brand-600" />
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={`font-medium text-right ${green ? 'text-green-600' : 'text-slate-800'}`}>{value || '—'}</span>
    </div>
  );
}

/* ─── Success Screen ─── */
function SubmittedScreen({ name }: { name: string }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">🎉</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted, Dr. {name}!</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Thank you for registering on SpeakEase. Our verification team will review your credentials and get back to you within <strong>24–48 hours</strong>.
          </p>

          {/* Timeline */}
          <div className="text-left bg-slate-50 rounded-2xl p-5 mb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">What happens next</p>
            <div className="space-y-4">
              {[
                { label: 'Application received',     status: 'done',    icon: '✓', desc: 'Right now' },
                { label: 'Document verification',    status: 'pending', icon: '⏳', desc: 'Within 24 hours' },
                { label: 'RCI / MCI cross-check',   status: 'pending', icon: '🔍', desc: 'Within 48 hours' },
                { label: 'Profile goes live',        status: 'pending', icon: '🚀', desc: 'After approval' },
              ].map(({ label, status, icon, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${status === 'done' ? 'bg-green-100' : 'bg-slate-100'}`}>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${status === 'done' ? 'text-green-700' : 'text-slate-700'}`}>{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-left mb-6">
            <p className="text-sm font-semibold text-brand-800 mb-1">📧 Check your inbox</p>
            <p className="text-xs text-brand-700 leading-relaxed">
              We'll email you at each stage — document review, approval, and when your profile goes live.
              Also keep an eye on WhatsApp for updates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl text-sm text-center transition-colors">
              Back to Home
            </Link>
            <Link href="/find-therapist" className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl text-sm text-center hover:bg-slate-50 transition-colors">
              Browse Therapists
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
