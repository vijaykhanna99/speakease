'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Calendar, CreditCard, Banknote, Star,
  MessageCircle, Settings, Bell, Video, Building2, Clock,
  CheckCircle, XCircle, AlertCircle, ChevronRight, Users,
  TrendingUp, ArrowUpRight, ArrowDownRight, Phone, Filter,
  Download, Send, Eye, MoreVertical, RefreshCw, Smartphone,
  Shield, IndianRupee, BarChart3, Plus, Edit3, Check, X,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getBookings, updateBookingStatus, cancelBooking, Booking } from '@/lib/auth';

const PAYMENTS = [
  { id: 'PAY001', booking: 'BK006', patient: 'Deepa Sharma',   date: 'Feb 15', amount: 800, platform: 96, net: 704, method: 'UPI',       status: 'settled'  },
  { id: 'PAY002', booking: 'BK007', patient: 'Arjun Menon',    date: 'Feb 12', amount: 800, platform: 96, net: 704, method: 'Card',      status: 'settled'  },
  { id: 'PAY003', booking: 'BK001', patient: 'Ravi K.',        date: 'Today',  amount: 800, platform: 96, net: 704, method: 'UPI',       status: 'pending'  },
  { id: 'PAY004', booking: 'BK002', patient: 'Meera S.',       date: 'Today',  amount: 800, platform: 96, net: 704, method: 'GPay',      status: 'pending'  },
  { id: 'PAY005', booking: 'BK008', patient: 'Priya Iyer',     date: 'Feb 10', amount: 800, platform: 0,  net: 800, method: 'Refunded',  status: 'refunded' },
];

const PAYOUTS = [
  { month: 'February 2025', sessions: 60, gross: 48000, deductions: 5760, net: 42240, status: 'upcoming', date: 'Mar 5, 2025' },
  { month: 'January 2025',  sessions: 52, gross: 41600, deductions: 4992, net: 36608, status: 'paid',     date: 'Feb 5, 2025' },
  { month: 'December 2024', sessions: 48, gross: 38400, deductions: 4608, net: 33792, status: 'paid',     date: 'Jan 5, 2025' },
  { month: 'November 2024', sessions: 44, gross: 35200, deductions: 4224, net: 30976, status: 'paid',     date: 'Dec 5, 2024' },
];

const REVIEWS = [
  { id: 1, patient: 'Ravi K.',    rating: 5, date: 'Feb 15', concern: 'Post-Stroke Aphasia',  text: 'Dr. Priya is outstanding. My speech recovery after stroke has been miraculous. She is patient, professional, and genuinely cares.', replied: false },
  { id: 2, patient: 'Meera S.',   rating: 5, date: 'Feb 10', concern: 'Voice Disorder',        text: 'Excellent therapist! Very thorough in her assessment and the exercises she gave me worked wonders for my voice fatigue.', replied: true, reply: 'Thank you so much, Meera! It was a pleasure working with you. Keep up the daily exercises!' },
  { id: 3, patient: 'Deepa S.',   rating: 4, date: 'Feb 5',  concern: 'Dysarthria',            text: 'Very knowledgeable and kind. Sessions are well-structured. Would love more home exercise materials.', replied: false },
  { id: 4, patient: 'Arjun M.',   rating: 5, date: 'Jan 28', concern: 'Language Delay',        text: 'My son has made incredible progress. Dr. Priya\'s approach is fantastic and he actually enjoys the sessions!', replied: true, reply: 'So happy to hear this! Arjun is a wonderful child. Keep practicing the games we discussed!' },
  { id: 5, patient: 'Suresh P.',  rating: 5, date: 'Jan 20', concern: 'Articulation',          text: 'After my stroke I lost confidence in speaking. Dr. Priya helped me regain it completely. 5 stars without hesitation.', replied: false },
];

const WHATSAPP_REMINDERS = [
  {
    id: 'r1', label: '24 Hours Before Session',
    template: 'Hi {{patient_name}}, this is a reminder that your session with Dr. Priya Sharma is scheduled for tomorrow at {{time}}. Join link: {{meet_link}} 😊',
    enabled: true, sent: 18, lastSent: '2 hrs ago',
  },
  {
    id: 'r2', label: '1 Hour Before Session',
    template: 'Your session with Dr. Priya Sharma starts in 1 hour! Click here to join: {{meet_link}}. Please ensure you\'re in a quiet place with good internet.',
    enabled: true, sent: 17, lastSent: '3 hrs ago',
  },
  {
    id: 'r3', label: 'After Session — Review Request',
    template: 'Thank you for your session with Dr. Priya Sharma today! We\'d love to hear your feedback. Rate your experience here: {{review_link}} 🙏',
    enabled: true, sent: 60, lastSent: 'Yesterday',
  },
  {
    id: 'r4', label: 'Booking Confirmation',
    template: 'Your session with Dr. Priya Sharma is confirmed! 📅 Date: {{date}} at {{time}}. Mode: {{mode}}. Booking ID: {{booking_id}}.',
    enabled: true, sent: 68, lastSent: '10 min ago',
  },
  {
    id: 'r5', label: 'Cancellation Notice',
    template: 'Your session scheduled for {{date}} at {{time}} has been cancelled. A full refund of ₹{{amount}} will be processed within 3–5 business days.',
    enabled: false, sent: 2, lastSent: '2 weeks ago',
  },
];

type Tab = 'overview' | 'bookings' | 'payments' | 'payouts' | 'reviews' | 'whatsapp';
type BookingStatus = 'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled';

const TABS: { id: Tab; label: string; icon: any; badge?: number }[] = [
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'bookings',  label: 'Bookings',  icon: Calendar,       badge: 2 },
  { id: 'payments',  label: 'Payments',  icon: CreditCard },
  { id: 'payouts',   label: 'Payouts',   icon: Banknote },
  { id: 'reviews',   label: 'Reviews',   icon: Star,           badge: 3 },
  { id: 'whatsapp',  label: 'WhatsApp',  icon: Smartphone },
];

/* ─── Main ─── */
export default function DoctorDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'doctor')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'doctor') return null;

  const doctorName = user.name;
  const firstName = doctorName.replace(/^Dr\.\s*/i, '').split(' ')[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Top header */}
        <div className="flex items-start justify-between py-6 flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Doctor Dashboard</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Good morning, {doctorName} 👩‍⚕️</h1>
            <p className="text-slate-500 text-sm mt-1">2 sessions today · Next: Ravi K. at 4:00 PM</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Bell size={17} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
              <Plus size={15} /> Block Leave
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Patients',    value: '287',     sub: '+12 this month',        icon: Users,       color: 'text-brand-600 bg-brand-50',   trend: 'up'   },
            { label: 'Feb Revenue',       value: '₹48,000', sub: '+18% vs Jan',            icon: TrendingUp,  color: 'text-green-600 bg-green-50',   trend: 'up'   },
            { label: 'Average Rating',    value: '4.9',     sub: '287 reviews',            icon: Star,        color: 'text-yellow-600 bg-yellow-50', trend: null   },
            { label: 'Sessions Today',    value: '2',       sub: '15 this week',           icon: Calendar,    color: 'text-purple-600 bg-purple-50', trend: null   },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={16} />
                </div>
                {stat.trend === 'up' && <ArrowUpRight size={14} className="text-green-500" />}
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">{stat.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  tab === t.id
                    ? 'text-brand-600 border-brand-600 bg-brand-50/50'
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                }`}>
                <t.icon size={15} />
                {t.label}
                {t.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {tab === 'overview'  && <OverviewTab  setTab={setTab} doctorId={user.id} />}
        {tab === 'bookings'  && <BookingsTab  doctorId={user.id} />}
        {tab === 'payments'  && <PaymentsTab  />}
        {tab === 'payouts'   && <PayoutsTab   />}
        {tab === 'reviews'   && <ReviewsTab   />}
        {tab === 'whatsapp'  && <WhatsAppTab  />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   OVERVIEW TAB
══════════════════════════════════════════ */
function OverviewTab({ setTab, doctorId }: { setTab: (t: Tab) => void; doctorId: string }) {
  const allBookings = getBookings().filter(b => b.doctorId === doctorId);
  const upcoming = allBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').slice(0, 4);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">

        {/* Next session */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white">
          <p className="text-brand-200 text-xs font-semibold uppercase tracking-widest mb-3">⚡ Next Session</p>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-xl">Ravi Krishnamurthy</h3>
              <p className="text-brand-200 text-sm">Post-Stroke Aphasia · Age 52</p>
              <div className="flex gap-2 mt-3">
                <span className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold"><Clock size={11} /> Today at 4:00 PM</span>
                <span className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold"><Video size={11} /> Online</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">View Notes</button>
              <button className="bg-white text-brand-700 font-bold px-4 py-2.5 rounded-xl hover:bg-brand-50 text-sm transition-colors">Start Session →</button>
            </div>
          </div>
        </div>

        {/* Today's schedule */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Today's Sessions</h2>
            <button onClick={() => setTab('bookings')} className="text-xs text-brand-600 font-semibold flex items-center gap-1 hover:text-brand-700">
              View All <ChevronRight size={13} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {upcoming.map(b => (
              <BookingRow key={b.id} booking={b} compact />
            ))}
          </div>
        </div>

        {/* Weekly heatmap */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">This Week</h3>
          <div className="grid grid-cols-7 gap-1.5">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
              const c = [3,4,2,3,2,1,0][i];
              return (
                <div key={day} className="text-center">
                  <p className="text-xs text-slate-400 mb-1.5">{day}</p>
                  <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold ${
                    c === 0 ? 'bg-slate-50 text-slate-300' : c <= 2 ? 'bg-brand-100 text-brand-700' : c <= 3 ? 'bg-brand-300 text-brand-900' : 'bg-brand-600 text-white'
                  }`}>
                    {c > 0 ? c : '—'}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">15 sessions · ₹12,000 earned this week</p>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Profile completeness */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Profile Health</h3>
            <span className="text-xs text-brand-600 font-semibold">95%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
            <div className="bg-brand-600 h-2 rounded-full" style={{ width: '95%' }} />
          </div>
          <div className="space-y-2">
            {[
              { label: 'Profile Photo', done: true },
              { label: 'Bio & Specializations', done: true },
              { label: 'Qualifications', done: true },
              { label: 'Availability Set', done: true },
              { label: 'Video Introduction', done: false },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                {item.done
                  ? <CheckCircle size={13} className="text-green-500" />
                  : <AlertCircle size={13} className="text-orange-400" />}
                <span className={item.done ? 'text-slate-600' : 'text-orange-600 font-medium'}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings quick view */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white">
          <p className="text-brand-200 text-xs font-semibold uppercase tracking-wider mb-2">February Earnings</p>
          <p className="text-3xl font-black mb-0.5">₹48,000</p>
          <p className="text-brand-300 text-xs mb-1">Net after deductions: <strong className="text-white">₹42,240</strong></p>
          <p className="text-brand-200 text-xs mb-4">Next payout: Mar 5, 2025</p>
          <button onClick={() => {}} className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors w-full">
            View Payout Details →
          </button>
        </div>

        {/* Recent reviews */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Latest Reviews</h3>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}
              <span className="text-xs font-bold text-slate-700 ml-1">4.9</span>
            </div>
          </div>
          <div className="space-y-3">
            {REVIEWS.slice(0, 2).map(r => (
              <div key={r.id} className="pb-3 last:pb-0 border-b border-slate-100 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-slate-700">{r.patient}</p>
                  <div className="flex">{Array.from({length:r.rating}).map((_,j) => <Star key={j} size={10} className="text-yellow-400 fill-yellow-400" />)}</div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{r.text}</p>
                {!r.replied && <p className="text-xs text-brand-600 font-medium mt-1 cursor-pointer">Reply →</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   BOOKINGS TAB
══════════════════════════════════════════ */
function BookingsTab({ doctorId }: { doctorId: string }) {
  const [filter, setFilter] = useState<BookingStatus>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);

  const reload = () => {
    const all = getBookings().filter(b => b.doctorId === doctorId);
    setBookings(all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  useEffect(() => { reload(); }, [doctorId]);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const doUpdate = (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    if (status === 'cancelled') cancelBooking(id, 'Declined by doctor', 'doctor');
    else updateBookingStatus(id, status);
    reload();
  };

  const counts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    d.setHours(0,0,0,0);
    if (d.getTime() === today.getTime()) return 'Today';
    if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {(['all','confirmed','pending','completed','cancelled'] as BookingStatus[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-all capitalize ${
                filter === f
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-300'
              }`}>
              {f}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === f ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Booking cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">No bookings found.</div>
        )}
        {filtered.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {b.patientName.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900">{b.patientName}</p>
                      {b.createdByAdmin && <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-semibold">Admin Created</span>}
                    </div>
                    <p className="text-sm text-slate-500">{b.concern}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={11}/>{fmtDate(b.date)}, {b.time}</span>
                  <span className={`flex items-center gap-1 font-medium ${b.mode === 'online' ? 'text-blue-600' : 'text-green-600'}`}>
                    {b.mode === 'online' ? <Video size={11}/> : <Building2 size={11}/>}
                    {b.mode === 'online' ? 'Online' : 'In-Clinic'}
                  </span>
                  <span className="flex items-center gap-1"><IndianRupee size={11}/>₹{b.amount}</span>
                  <span className="font-mono text-slate-300">{b.id}</span>
                </div>
                {b.status === 'cancelled' && b.cancelReason && (
                  <p className="text-xs text-red-500 mt-1">Cancelled: {b.cancelReason}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => doUpdate(b.id, 'confirmed')}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                      <Check size={12}/> Accept
                    </button>
                    <button onClick={() => doUpdate(b.id, 'cancelled')}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                      <X size={12}/> Decline
                    </button>
                  </>
                )}
                {b.status === 'confirmed' && b.mode === 'online' && (
                  <button className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                    <Video size={12}/> Start
                  </button>
                )}
                {b.status === 'confirmed' && (
                  <button onClick={() => doUpdate(b.id, 'completed')}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                    <CheckCircle size={12}/> Mark Done
                  </button>
                )}
                {b.status === 'completed' && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-3 py-2 rounded-xl">
                    <CheckCircle size={12}/> Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAYMENTS TAB
══════════════════════════════════════════ */
function PaymentsTab() {
  const total   = PAYMENTS.reduce((s, p) => s + (p.status !== 'refunded' ? p.amount : 0), 0);
  const pending = PAYMENTS.filter(p => p.status === 'pending').reduce((s, p) => s + p.net, 0);
  const settled = PAYMENTS.filter(p => p.status === 'settled').reduce((s, p) => s + p.net, 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Collected',  value: `₹${total.toLocaleString('en-IN')}`, sub: `${PAYMENTS.filter(p=>p.status!=='refunded').length} sessions`, color: 'text-slate-900' },
          { label: 'Pending Settlement', value: `₹${pending.toLocaleString('en-IN')}`, sub: '2 sessions today', color: 'text-yellow-700' },
          { label: 'Already Settled',  value: `₹${settled.toLocaleString('en-IN')}`, sub: 'In your bank', color: 'text-green-700' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className={`text-2xl font-bold mb-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-semibold text-slate-600">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Razorpay notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Shield size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Secured by Razorpay</p>
          <p className="text-xs text-blue-700 mt-0.5">All patient payments are collected via Razorpay (PCI-DSS Level 1). A 12% platform fee applies. Net amounts are settled within 2 business days.</p>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Transaction History</h3>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-colors">
            <Download size={13}/> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Booking ID','Patient','Date','Gross','Platform Fee','You Receive','Method','Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PAYMENTS.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">{p.booking}</td>
                  <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap">{p.patient}</td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{p.date}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">₹{p.amount}</td>
                  <td className="px-5 py-4 text-red-500">−₹{p.platform}</td>
                  <td className="px-5 py-4 font-bold text-green-700">₹{p.net}</td>
                  <td className="px-5 py-4">
                    <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-lg">{p.method}</span>
                  </td>
                  <td className="px-5 py-4">
                    <PaymentStatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAYOUTS TAB
══════════════════════════════════════════ */
function PayoutsTab() {
  const [showBankEdit, setShowBankEdit] = useState(false);

  return (
    <div className="space-y-5">
      {/* Bank account */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Linked Bank Account</h3>
          <button onClick={() => setShowBankEdit(!showBankEdit)}
            className="flex items-center gap-1.5 text-xs text-brand-600 font-semibold hover:text-brand-700">
            <Edit3 size={12}/> Edit
          </button>
        </div>
        {!showBankEdit ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Banknote size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">HDFC Bank</p>
              <p className="text-sm text-slate-500">A/C ending ••••4521 · IFSC: HDFC0001234</p>
              <p className="text-xs text-green-600 font-semibold mt-0.5 flex items-center gap-1"><CheckCircle size={11}/> Verified</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { label: 'Account Holder Name', placeholder: 'Dr. Priya Sharma' },
              { label: 'Bank Name',           placeholder: 'HDFC Bank' },
              { label: 'Account Number',      placeholder: '•••••••••4521' },
              { label: 'IFSC Code',           placeholder: 'HDFC0001234' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
                <input placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
            ))}
            <div className="col-span-2 flex gap-2 mt-1">
              <button onClick={() => setShowBankEdit(false)}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                Save Bank Details
              </button>
              <button onClick={() => setShowBankEdit(false)}
                className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payout schedule */}
      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 flex items-start gap-3">
        <RefreshCw size={15} className="text-brand-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-brand-800">Monthly Payout Cycle</p>
          <p className="text-xs text-brand-700 mt-0.5">Earnings are settled on the <strong>5th of every month</strong> for the previous month. Minimum payout: ₹500. Directly to your linked bank account.</p>
        </div>
      </div>

      {/* Payout history */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Payout History</h3>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
            <Download size={13}/> Download
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {PAYOUTS.map((p, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.status === 'paid' ? 'bg-green-50' : 'bg-brand-50'}`}>
                {p.status === 'paid'
                  ? <CheckCircle size={18} className="text-green-600" />
                  : <Clock size={18} className="text-brand-600" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-sm">{p.month}</p>
                <p className="text-xs text-slate-400">{p.sessions} sessions · Payout on {p.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">₹{p.net.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-400">after ₹{p.deductions.toLocaleString('en-IN')} fees</p>
              </div>
              <div>
                <span className={`text-xs font-bold px-2.5 py-1.5 rounded-xl ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'}`}>
                  {p.status === 'paid' ? '✓ Paid' : 'Upcoming'}
                </span>
              </div>
              {p.status === 'paid' && (
                <button className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <Download size={12}/> Receipt
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Earnings breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-bold text-slate-900 mb-4">February 2025 — Breakdown</h3>
        <div className="space-y-3">
          {[
            { label: 'Gross Earnings (60 sessions × ₹800)', value: '₹48,000', color: 'text-slate-900' },
            { label: 'Platform Fee (12%)',                   value: '−₹5,760', color: 'text-red-500' },
            { label: 'GST on Platform Fee (18%)',            value: '−₹1,036', color: 'text-red-400' },
            { label: 'Net Payout',                          value: '₹41,204', color: 'text-green-700', bold: true },
          ].map(row => (
            <div key={row.label} className={`flex justify-between text-sm ${row.bold ? 'pt-3 border-t border-slate-200 font-bold' : ''}`}>
              <span className="text-slate-500">{row.label}</span>
              <span className={`font-semibold ${row.color}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   REVIEWS TAB
══════════════════════════════════════════ */
function ReviewsTab() {
  const [replyOpen, setReplyOpen] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number,string>>({});
  const [submitted, setSubmitted] = useState<number[]>([]);
  const [filterStar, setFilterStar] = useState(0);

  const filtered = filterStar === 0 ? REVIEWS : REVIEWS.filter(r => r.rating === filterStar);
  const avg = (REVIEWS.reduce((s,r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);
  const dist = [5,4,3,2,1].map(n => ({ stars: n, count: REVIEWS.filter(r => r.rating === n).length }));

  return (
    <div className="space-y-5">
      {/* Rating summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-8 items-center">
          <div className="text-center shrink-0">
            <p className="text-6xl font-black text-slate-900">{avg}</p>
            <div className="flex justify-center gap-0.5 mt-2">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} className={i <= Math.round(Number(avg)) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'} />)}
            </div>
            <p className="text-xs text-slate-400 mt-1">{REVIEWS.length} reviews</p>
          </div>
          <div className="flex-1 w-full space-y-2">
            {dist.map(d => (
              <button key={d.stars} onClick={() => setFilterStar(filterStar === d.stars ? 0 : d.stars)}
                className={`flex items-center gap-3 w-full rounded-xl px-2 py-1 transition-colors ${filterStar === d.stars ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
                <span className="text-xs text-slate-500 w-3 text-right">{d.stars}</span>
                <Star size={11} className="text-yellow-400 fill-yellow-400 shrink-0" />
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${(d.count / REVIEWS.length) * 100}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-4">{d.count}</span>
              </button>
            ))}
          </div>
          <div className="text-center shrink-0">
            <p className="text-xs text-slate-500 mb-2">Unread replies</p>
            <p className="text-3xl font-bold text-brand-600">{REVIEWS.filter(r => !r.replied && !submitted.includes(r.id)).length}</p>
            <p className="text-xs text-slate-400 mt-1">Need a response</p>
          </div>
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {filtered.map(r => (
          <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${!r.replied && !submitted.includes(r.id) ? 'border-brand-200' : 'border-slate-100'}`}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm shrink-0">
                  {r.patient.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{r.patient}</p>
                  <p className="text-xs text-slate-400">{r.concern} · {r.date}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'} />)}
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mt-3 italic">"{r.text}"</p>

            {/* Existing reply */}
            {(r.replied || submitted.includes(r.id)) && (
              <div className="mt-3 ml-4 pl-3 border-l-2 border-brand-200 bg-brand-50/50 rounded-r-xl p-3">
                <p className="text-xs font-bold text-brand-700 mb-1">Your reply</p>
                <p className="text-xs text-slate-600">{r.reply ?? replies[r.id]}</p>
              </div>
            )}

            {/* Reply action */}
            {!r.replied && !submitted.includes(r.id) && (
              <div className="mt-3">
                {replyOpen === r.id ? (
                  <div className="space-y-2">
                    <textarea rows={2} placeholder="Write a professional, warm reply..."
                      value={replies[r.id] ?? ''}
                      onChange={e => setReplies({...replies, [r.id]: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none placeholder:text-slate-400" />
                    <div className="flex gap-2">
                      <button onClick={() => { setSubmitted(p => [...p, r.id]); setReplyOpen(null); }}
                        disabled={!replies[r.id]}
                        className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                        <Send size={11}/> Send Reply
                      </button>
                      <button onClick={() => setReplyOpen(null)}
                        className="text-xs text-slate-500 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setReplyOpen(r.id)}
                    className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold mt-1">
                    <MessageCircle size={12}/> Reply to this review
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   WHATSAPP TAB
══════════════════════════════════════════ */
function WhatsAppTab() {
  const [reminders, setReminders] = useState(WHATSAPP_REMINDERS);
  const [testSent, setTestSent] = useState<string | null>(null);

  const toggle = (id: string) =>
    setReminders(prev => prev.map(r => r.id === id ? {...r, enabled: !r.enabled} : r));

  const sendTest = (id: string) => {
    setTestSent(id);
    setTimeout(() => setTestSent(null), 2000);
  };

  const enabledCount = reminders.filter(r => r.enabled).length;

  return (
    <div className="space-y-5">
      {/* Status banner */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Smartphone size={18} className="text-green-600" />
          </div>
          <div>
            <p className="font-bold text-green-800 text-sm">WhatsApp Automation — Active</p>
            <p className="text-xs text-green-700">{enabledCount} of {reminders.length} reminders enabled · Powered by WATI</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Connected
        </div>
      </div>

      {/* Phone preview + reminders */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Reminder list — wider */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm px-1">Automated Reminders</h3>
          {reminders.map(r => (
            <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${r.enabled ? 'border-slate-100' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-slate-900 text-sm">{r.label}</p>
                    {r.enabled
                      ? <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full uppercase">On</span>
                      : <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase">Off</span>}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3 font-mono bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    {r.template}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Send size={10}/> {r.sent} sent</span>
                    <span className="flex items-center gap-1"><Clock size={10}/> Last: {r.lastSent}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {/* Toggle switch */}
                  <button onClick={() => toggle(r.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${r.enabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${r.enabled ? 'left-6' : 'left-0.5'}`} />
                  </button>
                  <button onClick={() => sendTest(r.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                      testSent === r.id
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}>
                    {testSent === r.id ? '✓ Sent!' : 'Test'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Phone mockup — narrower */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="font-bold text-slate-900 text-sm px-1">Preview</h3>
          <div className="bg-slate-800 rounded-[2.5rem] p-3 shadow-2xl border border-slate-700">
            <div className="bg-[#ECE5DD] rounded-[2rem] overflow-hidden" style={{ minHeight: 480 }}>
              {/* WhatsApp header */}
              <div className="bg-[#075E54] p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center text-white text-xs font-bold">SE</div>
                <div>
                  <p className="text-white text-sm font-bold">SpeakEase</p>
                  <p className="text-green-200 text-xs">Official Business Account</p>
                </div>
              </div>
              {/* Messages */}
              <div className="p-4 space-y-3">
                {[
                  { text: '✅ Booking Confirmed!\n\nYour session with Dr. Priya Sharma is confirmed!\n📅 Today at 4:00 PM\n📍 Online (Google Meet)\n🆔 Booking ID: BK001', time: '3:58 PM' },
                  { text: '⏰ Session Reminder\n\nYour session with Dr. Priya Sharma is in 1 hour!\nClick to join: meet.google.com/xyz\n\nPlease ensure you\'re in a quiet place 😊', time: '3:00 PM' },
                  { text: '⭐ How was your session?\n\nThank you for your session today! We\'d love your feedback. Rate Dr. Priya here: speakease.in/review/BK001', time: '5:10 PM' },
                ].map((msg, i) => (
                  <div key={i} className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-none p-3 max-w-[85%] shadow-sm">
                      <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{msg.text}</p>
                      <p className="text-[10px] text-slate-400 text-right mt-1">{msg.time} ✓✓</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2.5">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">This Month</p>
            {[
              { label: 'Messages Sent',    value: '247' },
              { label: 'Delivery Rate',   value: '98.4%' },
              { label: 'No-shows Reduced', value: '64%' },
            ].map(s => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="text-slate-500">{s.label}</span>
                <span className="font-bold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared helpers ─── */
function BookingRow({ booking: b, compact }: { booking: Booking; compact?: boolean }) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
        {b.patientName.split(' ').map(n=>n[0]).join('').slice(0,2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm truncate">{b.patientName}</p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
          <Clock size={10}/>{b.time}
          <span className={`flex items-center gap-0.5 font-medium ${b.mode === 'online' ? 'text-blue-600' : 'text-green-600'}`}>
            {b.mode === 'online' ? <Video size={10}/> : <Building2 size={10}/>} {b.mode}
          </span>
        </div>
      </div>
      <StatusBadge status={b.status} />
      {b.mode === 'online' && b.status === 'confirmed' && (
        <button className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shrink-0">
          Start
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending:   'bg-yellow-100 text-yellow-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
    settled:   'bg-green-100 text-green-700',
    refunded:  'bg-orange-100 text-orange-600',
  };
  const labels: Record<string, string> = {
    confirmed: '✓ Confirmed',
    pending:   '⏳ Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    settled:   '✓ Settled',
    refunded:  'Refunded',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${styles[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {labels[status] ?? status}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}
