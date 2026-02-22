'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar, Clock, Video, Building2, Star, MessageCircle,
  Plus, Settings, User, ChevronRight, CheckCircle,
  BarChart3, BookOpen, XCircle,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getBookings, Booking } from '@/lib/auth';

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  d.setHours(0,0,0,0);
  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isUpcoming = (b: Booking) => b.status === 'confirmed' || b.status === 'pending';
const isPast     = (b: Booking) => b.status === 'completed' || b.status === 'cancelled';

const STATUS_STYLE: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};
const STATUS_LABEL: Record<string, string> = {
  confirmed: '✓ Confirmed',
  pending:   '⏳ Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const tabs = ['Upcoming', 'Past', 'All'] as const;

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past' | 'All'>('Upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const all = getBookings()
        .filter(b => b.patientId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(all);
    }
  }, [user]);

  if (loading || !user) return null;

  const filtered = bookings.filter(b => {
    if (activeTab === 'Upcoming') return isUpcoming(b);
    if (activeTab === 'Past')     return isPast(b);
    return true;
  });

  const upcomingList = bookings.filter(isUpcoming);
  const nextSession  = upcomingList[0];
  const thisMonth    = bookings.filter(b => {
    const d = new Date(b.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const uniqueDoctors = new Set(bookings.map(b => b.doctorId)).size;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Welcome header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Welcome back, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 mt-1">
              {upcomingList.length > 0
                ? `You have ${upcomingList.length} upcoming session${upcomingList.length > 1 ? 's' : ''}.`
                : 'No upcoming sessions. Book one below!'}
            </p>
          </div>
          <Link
            href="/find-therapist"
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
          >
            <Plus size={16} />
            Book New Session
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Sessions', value: bookings.length,     icon: Calendar,  color: 'text-brand-600 bg-brand-50'   },
                { label: 'This Month',     value: thisMonth.length,    icon: BarChart3, color: 'text-purple-600 bg-purple-50' },
                { label: 'Therapists',     value: uniqueDoctors,       icon: User,      color: 'text-coral-600 bg-coral-50'   },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon size={16} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Next session highlight */}
            {nextSession ? (
              <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-brand-200 text-sm font-medium mb-1">⚡ Next Session</p>
                    <h3 className="font-bold text-xl">{nextSession.doctorName}</h3>
                    <p className="text-brand-200 text-sm">{nextSession.doctorSpecialty}</p>
                    <p className="text-brand-300 text-xs mt-1">{nextSession.concern}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1.5 text-xs font-medium">
                        <Clock size={12} />
                        {fmtDate(nextSession.date)} at {nextSession.time}
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1.5 text-xs font-medium">
                        {nextSession.mode === 'online' ? <Video size={12} /> : <Building2 size={12} />}
                        {nextSession.mode === 'online' ? 'Online' : 'In-Clinic'}
                      </div>
                    </div>
                  </div>
                  {nextSession.mode === 'online' && (
                    <button className="bg-white text-brand-700 font-bold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors text-sm">
                      Join Session →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white text-center">
                <p className="text-brand-200 text-sm mb-3">No upcoming sessions</p>
                <Link href="/find-therapist" className="inline-block bg-white text-brand-700 font-bold px-6 py-2.5 rounded-xl hover:bg-brand-50 transition-colors text-sm">
                  Find a Therapist →
                </Link>
              </div>
            )}

            {/* Bookings list */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="font-bold text-slate-900 text-lg">My Sessions</h2>
              </div>

              <div className="flex border-b border-slate-100 mt-4 px-5">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 mr-2 ${
                      activeTab === tab ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent hover:text-slate-600'
                    }`}
                  >
                    {tab}
                    {tab === 'Upcoming' && upcomingList.length > 0 && (
                      <span className="ml-1.5 text-xs bg-brand-100 text-brand-700 font-bold px-1.5 py-0.5 rounded-full">{upcomingList.length}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <div className="py-12 text-center text-slate-400">
                    <Calendar size={32} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No {activeTab.toLowerCase()} sessions.</p>
                    {activeTab === 'Upcoming' && (
                      <Link href="/find-therapist" className="text-brand-600 text-sm font-semibold hover:underline mt-2 inline-block">Book one now →</Link>
                    )}
                  </div>
                )}
                {filtered.map((booking) => (
                  <div key={booking.id} className="p-5 flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
                    >
                      {booking.doctorName.split(' ').map(n => n[0]).join('').slice(1, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-slate-900">{booking.doctorName}</p>
                          <p className="text-xs text-slate-500">{booking.doctorSpecialty}</p>
                          <p className="text-xs text-brand-600 font-medium mt-0.5">{booking.concern}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[booking.status]}`}>
                          {STATUS_LABEL[booking.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {fmtDate(booking.date)}, {booking.time}
                        </span>
                        <span className="flex items-center gap-1">
                          {booking.mode === 'online' ? <Video size={11} /> : <Building2 size={11} />}
                          {booking.mode === 'online' ? 'Online' : 'In-Clinic'}
                        </span>
                        <span className="font-medium text-slate-700">₹{booking.amount}</span>
                      </div>
                      {booking.status === 'completed' && (
                        <button className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
                          <Star size={11} />
                          Leave a review
                        </button>
                      )}
                      {booking.status === 'cancelled' && booking.cancelReason && (
                        <p className="mt-1 text-xs text-red-500">Reason: {booking.cancelReason}</p>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-300 shrink-0">#{booking.id}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* My Profile */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">My Profile</h3>
                <button className="text-slate-400 hover:text-slate-600">
                  <Settings size={15} />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  {user.phone && <p className="text-xs text-slate-400">{user.phone}</p>}
                </div>
              </div>
              {bookings.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {Array.from(new Set(bookings.map(b => b.concern))).slice(0, 3).map(concern => (
                    <span key={concern} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700">
                      {concern}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: Plus,          label: 'Book New Session',   href: '/find-therapist', color: 'text-brand-600'  },
                  { icon: MessageCircle, label: 'Contact Support',     href: '#',              color: 'text-slate-600'  },
                  { icon: BookOpen,      label: 'Resources & Tips',    href: '#',              color: 'text-purple-600' },
                ].map((action) => (
                  <Link key={action.label} href={action.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <action.icon size={15} className={action.color} />
                    <span className="text-sm font-medium text-slate-700">{action.label}</span>
                    <ChevronRight size={13} className="ml-auto text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Wellness tip */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
              <p className="text-lg mb-2">💡</p>
              <h4 className="font-bold text-purple-900 text-sm mb-1">Therapy Tip</h4>
              <p className="text-xs text-purple-700 leading-relaxed">
                Consistency matters most. Even 10 minutes of daily practice between sessions can significantly accelerate your progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
