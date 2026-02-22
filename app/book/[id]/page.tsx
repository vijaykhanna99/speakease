'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, CheckCircle, Video, Building2,
  User, MessageCircle, Phone, Lock, Shield, Clock,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { therapists } from '@/lib/data';
import { createBooking, getCurrentSession } from '@/lib/auth';

type Step = 1 | 2 | 3 | 4;

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getUpcomingDates(count: number) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const morningSlots   = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
const afternoonSlots = ['12:00 PM', '12:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'];
const eveningSlots   = ['4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '7:00 PM'];

const unavailableSlots = new Set(['9:30 AM', '10:30 AM', '12:30 PM', '3:00 PM', '5:00 PM']);

const bookingForOptions = ['Myself', 'My Child', 'My Parent / Elder', 'My Spouse / Partner', 'Someone else'];

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const therapist = therapists.find((t) => t.id === id);

  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<'online' | 'in-clinic'>('online');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientName: '',
    phone: '',
    age: '',
    bookingFor: 'Myself',
    concern: '',
  });
  const [bookingId, setBookingId] = useState('');

  const dates = getUpcomingDates(10);

  if (!therapist) {
    return <div className="p-8 text-center">Therapist not found.</div>;
  }

  const canProceed1 = selectedDate && selectedSlot;
  const canProceed2 = form.patientName && form.phone && form.age && form.concern;

  const handleConfirm = () => {
    const sessionUser = getCurrentSession();
    const doctorId = therapist.userId || `therapist_${therapist.id}`;
    const dateStr = selectedDate
      ? selectedDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const booking = createBooking({
      patientId: sessionUser?.id || 'guest',
      patientName: form.patientName,
      patientPhone: form.phone,
      doctorId,
      doctorName: therapist.name,
      doctorSpecialty: therapist.specializations[0],
      date: dateStr,
      time: selectedSlot!,
      mode,
      concern: form.concern,
      amount: therapist.fee,
      status: 'pending',
    });

    setBookingId(booking.id);
    setStep(4);
  };

  const stepLabels = ['Choose Slot', 'Your Details', 'Payment', 'Confirmed'];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        {/* Back */}
        <Link
          href={`/therapist/${therapist.id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to profile
        </Link>

        {/* Therapist mini card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
          >
            {therapist.name.split(' ').map(n => n[0]).join('').slice(1, 3)}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-slate-900">{therapist.name}</h2>
            <p className="text-sm text-slate-500">{therapist.title}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-slate-900">₹{therapist.fee}</p>
            <p className="text-xs text-slate-400">{therapist.sessionDuration} min session</p>
          </div>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center mb-8">
            {stepLabels.slice(0, 3).map((label, i) => {
              const sn = (i + 1) as Step;
              const isCompleted = step > sn;
              const isActive = step === sn;
              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        isCompleted ? 'bg-brand-600 text-white' : isActive ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <CheckCircle size={16} /> : sn}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${isActive ? 'text-brand-600' : 'text-slate-400'}`}>{label}</span>
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${step > sn ? 'bg-brand-600' : 'bg-slate-200'}`} />}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── STEP 1: Choose Slot ─── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="font-bold text-xl text-slate-900 mb-5">Choose consultation mode</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setMode('online')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${mode === 'online' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}
                >
                  <Video size={18} />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Online</p>
                    <p className="text-xs opacity-70">Google Meet link sent</p>
                  </div>
                </button>
                <button
                  onClick={() => setMode('in-clinic')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${mode === 'in-clinic' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}
                >
                  <Building2 size={18} />
                  <div className="text-left">
                    <p className="font-semibold text-sm">In-Clinic</p>
                    <p className="text-xs opacity-70">{therapist.city}</p>
                  </div>
                </button>
              </div>

              <h3 className="font-bold text-slate-900 mb-4">Select a date</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dates.map((date, i) => {
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      className={`shrink-0 flex flex-col items-center px-3.5 py-3 rounded-xl border-2 transition-all min-w-[60px] ${
                        isSelected ? 'border-brand-500 bg-brand-600 text-white' : 'border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50'
                      }`}
                    >
                      <span className={`text-xs font-medium ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {i === 0 ? 'Today' : weekDays[date.getDay()]}
                      </span>
                      <span className="text-lg font-bold mt-0.5">{date.getDate()}</span>
                      <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                        {months[date.getMonth()]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="mt-6 space-y-4">
                  {[
                    { label: '🌅 Morning', slots: morningSlots },
                    { label: '☀️ Afternoon', slots: afternoonSlots },
                    { label: '🌆 Evening', slots: eveningSlots },
                  ].map(({ label, slots }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slots.map((slot) => {
                          const unavailable = unavailableSlots.has(slot);
                          const isSelected = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              disabled={unavailable}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                                unavailable ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100' :
                                isSelected ? 'bg-brand-600 text-white shadow-sm' :
                                'bg-slate-50 text-slate-700 hover:bg-brand-50 hover:text-brand-700 border border-slate-200'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              disabled={!canProceed1}
              onClick={() => setStep(2)}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              Continue to Details <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ─── STEP 2: Patient Details ─── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="font-bold text-xl text-slate-900 mb-1">Patient details</h2>
              <p className="text-sm text-slate-500 mb-6">This helps your therapist prepare for the session.</p>

              <div className="space-y-4">
                {/* Who is this booking for? */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Booking for</label>
                  <div className="flex flex-wrap gap-2">
                    {bookingForOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setForm({ ...form, bookingFor: opt })}
                        className={`px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${
                          form.bookingFor === opt
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <FormField label="Patient's Full Name" icon={User} placeholder="Full name" value={form.patientName} onChange={(v) => setForm({ ...form, patientName: v })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="WhatsApp Number" icon={Phone} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
                  <FormField label="Patient Age" icon={User} placeholder="Age in years" value={form.age} onChange={(v) => setForm({ ...form, age: v })} type="number" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Primary Concern</label>
                  <div className="relative">
                    <MessageCircle size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <textarea
                      rows={3}
                      placeholder="e.g. I have difficulty speaking clearly after a stroke, looking for speech rehabilitation..."
                      value={form.concern}
                      onChange={(e) => setForm({ ...form, concern: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-4 rounded-xl hover:bg-slate-50 transition-colors text-sm">
                ← Back
              </button>
              <button
                disabled={!canProceed2}
                onClick={() => setStep(3)}
                className="flex-[2] bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                Continue to Payment <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Payment ─── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="font-bold text-xl text-slate-900 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <Row label="Therapist" value={therapist.name} />
                <Row label="Date & Time" value={`${selectedDate?.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}, ${selectedSlot}`} />
                <Row label="Mode" value={mode === 'online' ? '💻 Online (Google Meet)' : '🏥 In-Clinic'} />
                <Row label="Duration" value={`${therapist.sessionDuration} minutes`} />
                <Row label="Patient" value={`${form.patientName} (${form.age} yrs)`} />
                <Row label="Booking For" value={form.bookingFor} />
                <div className="border-t border-slate-100 pt-3 mt-1 space-y-1.5">
                  <Row label="Session Fee" value={`₹${therapist.fee}`} />
                  <Row label="Platform Fee" value="₹0" />
                  <Row label="GST (18%)" value={`₹${Math.round(therapist.fee * 0.18)}`} />
                  <div className="flex justify-between font-bold text-base pt-3 border-t border-slate-100 mt-2">
                    <span>Total</span>
                    <span className="text-brand-600">₹{therapist.fee + Math.round(therapist.fee * 0.18)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Payment Method</h3>
              <div className="space-y-2">
                {[
                  { id: 'upi', label: 'UPI (GPay, PhonePe, Paytm)', icon: '📱', popular: true },
                  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                  { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
                  { id: 'wallet', label: 'Wallet', icon: '👛' },
                ].map((m) => (
                  <label key={m.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer transition-all">
                    <input type="radio" name="payment" defaultChecked={m.popular} className="accent-brand-600" />
                    <span className="text-lg">{m.icon}</span>
                    <span className="font-medium text-sm text-slate-700">{m.label}</span>
                    {m.popular && <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Popular</span>}
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-4">
                <Lock size={11} />
                Secured by Razorpay · PCI-DSS Compliant · 100% Safe
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-4 rounded-xl hover:bg-slate-50 text-sm">← Back</button>
              <button onClick={handleConfirm} className="flex-[2] bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md">
                <Lock size={14} />
                Pay ₹{therapist.fee + Math.round(therapist.fee * 0.18)} & Confirm
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Confirmation ─── */}
        {step === 4 && (
          <div className="text-center">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
                🎉
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Session Confirmed!</h2>
              <p className="text-slate-500 mb-8 text-lg">
                You're all set. Confirmation sent to your WhatsApp.
              </p>

              <div className="bg-slate-50 rounded-2xl p-5 text-left mb-8 space-y-3 text-sm">
                <Row label="Booking ID" value={`#${bookingId}`} mono />
                <Row label="Therapist" value={therapist.name} />
                <Row label="Date & Time" value={`${selectedDate?.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}, ${selectedSlot}`} />
                <Row label="Mode" value={mode === 'online' ? '💻 Online' : '🏥 In-Clinic'} />
                <Row label="Patient" value={`${form.patientName} (${form.age} yrs)`} />
                <Row label="Amount Paid" value={`₹${therapist.fee + Math.round(therapist.fee * 0.18)}`} green />
              </div>

              {mode === 'online' && (
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm font-semibold text-brand-800 mb-1">📹 How to join your session</p>
                  <p className="text-xs text-brand-700 leading-relaxed">
                    A Google Meet link will be sent to your WhatsApp 30 minutes before the session. Ensure you are in a quiet place with stable internet.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard" className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                  View My Bookings
                </Link>
                <Link href="/find-therapist" className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
                  Find Another Therapist
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono, green }: { label: string; value?: string; mono?: boolean; green?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${mono ? 'font-mono bg-white px-3 py-1 rounded-lg border border-slate-200 text-slate-900' : green ? 'text-green-600' : 'text-slate-900'}`}>
        {value}
      </span>
    </div>
  );
}

function FormField({ label, icon: Icon, placeholder, value, onChange, type = 'text' }: {
  label: string; icon: any; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
