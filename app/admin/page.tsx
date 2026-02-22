'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Clock, CheckCircle, XCircle, Eye, Shield,
  Search, X, Check, AlertCircle, Stethoscope, MapPin,
  Phone, Mail, Award, RefreshCw, Calendar, Plus,
  Video, Building2, IndianRupee, FileText,
  TrendingUp, TrendingDown, Ban, BarChart3,
  Activity, Star, Download, ChevronRight,
  Percent, Wallet, PieChart, Globe, ZoomIn,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getApplications, approveApplication, rejectApplication,
  DoctorApplication, getUsers, User as AuthUser,
  getBookings, cancelBooking, createBooking,
  Booking, BookingStatus,
} from '@/lib/auth';
import Header from '@/components/layout/Header';

type AdminTab = 'dashboard' | 'applications' | 'bookings' | 'new-booking' | 'revenue' | 'users';

const PLATFORM_FEE_PCT = 12; // %

/* ─── Helpers ─── */
const fmt = (n: number) => n.toLocaleString('en-IN');
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const relTime = (iso: string) => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d > 0) return `${d}d ago`; if (h > 0) return `${h}h ago`; if (m > 0) return `${m}m ago`; return 'Just now';
};
const isToday = (iso: string) => { const d = new Date(iso); const t = new Date(); return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate(); };
const monthLabel = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

const STATUS_CHIP: Record<BookingStatus, string> = {
  confirmed: 'bg-blue-400/10 border-blue-400/30 text-blue-300',
  pending:   'bg-yellow-400/10 border-yellow-400/30 text-yellow-300',
  completed: 'bg-green-400/10 border-green-400/30 text-green-300',
  cancelled: 'bg-red-400/10 border-red-400/30 text-red-300',
};
const APP_STATUS_CHIP = { pending: 'bg-yellow-400/10 border-yellow-400/30 text-yellow-300', approved: 'bg-green-400/10 border-green-400/30 text-green-300', rejected: 'bg-red-400/10 border-red-400/30 text-red-300' };

/* ══════════════════════════════════════════
   SHARED MODALS
══════════════════════════════════════════ */
function ReviewModal({ app, action, onConfirm, onClose }: { app: DoctorApplication; action: 'approve' | 'reject'; onConfirm: (note: string) => void; onClose: () => void }) {
  const [note, setNote] = useState(action === 'approve' ? 'Credentials verified. Registration number confirmed.' : '');
  const isA = action === 'approve';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className={`px-6 py-5 border-b ${isA ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isA ? 'bg-green-500' : 'bg-red-500'}`}>{isA ? <Check size={18} className="text-white" /> : <X size={18} className="text-white" />}</div>
              <div><h3 className={`font-bold ${isA ? 'text-green-900' : 'text-red-900'}`}>{isA ? 'Approve Application' : 'Reject Application'}</h3><p className="text-sm text-slate-500">{app.name}</p></div>
            </div>
            <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1.5">
            <p><span className="font-semibold text-slate-600">Specialty:</span> {app.specializations.join(', ')}</p>
            <p><span className="font-semibold text-slate-600">Registration:</span> {app.registrationBody} — {app.registrationNumber}</p>
            <p><span className="font-semibold text-slate-600">Location:</span> {app.city}, {app.state}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{isA ? 'Approval Note (sent to doctor)' : 'Rejection Reason *'}</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 resize-none ${isA ? 'border-slate-200 focus:border-green-400 focus:ring-green-100' : 'border-slate-200 focus:border-red-400 focus:ring-red-100'}`} placeholder={isA ? 'e.g. All credentials verified.' : 'Please provide a reason...'} />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm">Cancel</button>
            <button onClick={() => onConfirm(note)} disabled={!isA && !note} className={`flex-1 py-3 text-white rounded-xl font-semibold text-sm disabled:opacity-50 ${isA ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>{isA ? 'Approve & Notify' : 'Reject & Notify'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ booking, onConfirm, onClose }: { booking: Booking; onConfirm: (r: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const presets = ['Doctor unavailable', 'Patient requested cancellation', 'Scheduling conflict', 'Technical issue', 'Duplicate booking'];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center"><Ban size={18} className="text-white" /></div>
            <div><h3 className="font-bold text-red-900">Cancel Appointment</h3><p className="text-sm text-slate-500">{booking.patientName} · {booking.doctorName}</p></div>
          </div>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1">
            <p><span className="font-semibold text-slate-600">Patient:</span> {booking.patientName} · {booking.patientPhone}</p>
            <p><span className="font-semibold text-slate-600">Doctor:</span> {booking.doctorName}</p>
            <p><span className="font-semibold text-slate-600">Date:</span> {fmtDate(booking.date)} at {booking.time}</p>
            <p><span className="font-semibold text-slate-600">Amount:</span> ₹{booking.amount} (refund will be processed)</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Select reason:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {presets.map(p => <button key={p} onClick={() => setReason(p)} className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${reason === p ? 'bg-red-500 text-white border-red-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-red-300'}`}>{p}</button>)}
            </div>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="Or type a custom reason..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm">Keep Booking</button>
            <button onClick={() => reason && onConfirm(reason)} disabled={!reason} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50">Cancel & Notify</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DOCUMENT VIEWER MODAL
══════════════════════════════════════════ */
function DocViewerModal({ title, dataUrl, fileName, onClose }: {
  title: string; dataUrl: string; fileName?: string; onClose: () => void;
}) {
  const isImage = dataUrl.startsWith('data:image/');
  const isPdf   = dataUrl.startsWith('data:application/pdf');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <p className="font-bold text-slate-900">{title}</p>
            {fileName && <p className="text-xs text-slate-400 mt-0.5">{fileName}</p>}
          </div>
          <div className="flex items-center gap-3">
            <a href={dataUrl} download={fileName || title} className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors">
              <Download size={12} /> Download
            </a>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <X size={16} className="text-slate-600" />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 flex items-center justify-center min-h-0">
          {isImage && (
            <img src={dataUrl} alt={title} className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
          )}
          {isPdf && (
            <iframe src={dataUrl} title={title} className="w-full rounded-lg shadow-md" style={{ height: '75vh' }} />
          )}
          {!isImage && !isPdf && (
            <div className="text-center py-12">
              <FileText size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-4">Preview not available for this file type.</p>
              <a href={dataUrl} download={fileName || title} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Download to view
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DASHBOARD TAB
══════════════════════════════════════════ */
function DashboardTab({ onNavigate }: { onNavigate: (t: AdminTab) => void }) {
  const bookings = getBookings();
  const applications = getApplications();
  const users = getUsers();

  const patients    = users.filter(u => u.role === 'patient');
  const doctors     = users.filter(u => u.role === 'doctor' && u.doctorStatus === 'approved');
  const pending     = applications.filter(a => a.status === 'pending');
  const todaySess   = bookings.filter(b => isToday(b.date) && (b.status === 'confirmed' || b.status === 'pending'));
  const thisWeek    = bookings.filter(b => (Date.now() - new Date(b.date).getTime()) < 7 * 86400000 && b.status !== 'cancelled');
  const grossRev    = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.amount, 0);
  const platFees    = Math.round(grossRev * PLATFORM_FEE_PCT / 100);
  const completionR = bookings.length ? Math.round(bookings.filter(b => b.status === 'completed').length / bookings.length * 100) : 0;
  const cancelRate  = bookings.length ? Math.round(bookings.filter(b => b.status === 'cancelled').length / bookings.length * 100) : 0;

  // Top doctors by booking count
  const doctorBookingMap: Record<string, { name: string; count: number; revenue: number; specialty: string }> = {};
  bookings.filter(b => b.status !== 'cancelled').forEach(b => {
    if (!doctorBookingMap[b.doctorId]) doctorBookingMap[b.doctorId] = { name: b.doctorName, count: 0, revenue: 0, specialty: b.doctorSpecialty };
    doctorBookingMap[b.doctorId].count++;
    doctorBookingMap[b.doctorId].revenue += b.amount;
  });
  const topDoctors = Object.values(doctorBookingMap).sort((a, b) => b.count - a.count).slice(0, 5);

  // Top concerns
  const concernMap: Record<string, number> = {};
  bookings.filter(b => b.status !== 'cancelled').forEach(b => { concernMap[b.concern] = (concernMap[b.concern] || 0) + 1; });
  const topConcerns = Object.entries(concernMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxConcern  = topConcerns[0]?.[1] || 1;

  // Recent activity (last 8 bookings by createdAt)
  const recentActivity = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  // New registrations this week
  const newPatients = patients.filter(p => (Date.now() - new Date(p.createdAt).getTime()) < 7 * 86400000).length;
  const newDoctors  = applications.filter(a => (Date.now() - new Date(a.submittedAt).getTime()) < 7 * 86400000).length;

  // City distribution from bookings
  const cityMap: Record<string, number> = {};
  applications.filter(a => a.status === 'approved').forEach(a => { cityMap[a.city] = (cityMap[a.city] || 0) + 1; });
  bookings.filter(b => b.status !== 'cancelled').forEach(b => {
    const app = applications.find(a => a.userId === b.doctorId);
    if (app) cityMap[app.city] = (cityMap[app.city] || 0) + 1;
  });
  const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Stats — 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Approved Doctors',  value: doctors.length,      icon: Stethoscope, color: 'text-brand-400 bg-brand-400/10 border-brand-400/20' },
          { label: 'Patients',           value: patients.length,     icon: Users,       color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
          { label: "Today's Sessions",   value: todaySess.length,    icon: Calendar,    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
          { label: 'Sessions This Week', value: thisWeek.length,     icon: Activity,    color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
          { label: 'Pending Apps',       value: pending.length,      icon: Clock,       color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', alert: pending.length > 0 },
          { label: 'Gross Revenue',      value: `₹${fmt(grossRev)}`, icon: IndianRupee, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
        ].map(s => (
          <div key={s.label} className={`bg-slate-900 border rounded-2xl p-4 ${s.alert ? 'border-yellow-500/40' : 'border-slate-800'}`}>
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-2.5 ${s.color}`}><s.icon size={14} /></div>
            <p className="text-xl font-bold text-white leading-none">{s.value}</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-tight">{s.label}</p>
            {s.alert && <p className="text-[10px] text-yellow-400 mt-1">⚠ Action needed</p>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Platform Health */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><BarChart3 size={14} className="text-brand-400" /> Platform Health</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Completion Rate', value: completionR, suffix: '%', color: 'bg-green-500' },
                { label: 'Cancellation Rate', value: cancelRate, suffix: '%', color: cancelRate > 20 ? 'bg-red-500' : 'bg-yellow-500' },
                { label: 'Approval Rate', value: applications.length ? Math.round(applications.filter(a=>a.status==='approved').length/applications.length*100) : 0, suffix: '%', color: 'bg-brand-500' },
                { label: 'Platform Fee', value: PLATFORM_FEE_PCT, suffix: '%', color: 'bg-purple-500', static: true },
              ].map(m => (
                <div key={m.label} className="bg-slate-800 rounded-xl p-4">
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-2xl font-bold text-white">{m.value}</span>
                    <span className="text-sm text-slate-400 mb-0.5">{m.suffix}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                    <div className={`h-1.5 rounded-full ${m.color}`} style={{ width: `${Math.min(m.value, 100)}%` }} />
                  </div>
                  <p className="text-xs text-slate-400">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Activity size={14} className="text-brand-400" /> Recent Bookings</h3>
              <button onClick={() => onNavigate('bookings')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold">View all <ChevronRight size={12} /></button>
            </div>
            <div className="divide-y divide-slate-800">
              {recentActivity.map(b => (
                <div key={b.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center text-brand-400 text-xs font-bold shrink-0">
                    {b.patientName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{b.patientName}</p>
                    <p className="text-xs text-slate-500 truncate">{b.concern} · {b.doctorName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_CHIP[b.status]}`}>{b.status}</span>
                    <p className="text-[10px] text-slate-600 mt-0.5">{relTime(b.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Concerns */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><PieChart size={14} className="text-brand-400" /> Most Booked Conditions</h3>
            <div className="space-y-3">
              {topConcerns.map(([concern, count]) => (
                <div key={concern} className="flex items-center gap-3">
                  <p className="text-sm text-slate-300 w-40 truncate shrink-0">{concern}</p>
                  <div className="flex-1 bg-slate-800 rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${(count / maxConcern) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 w-6 text-right shrink-0">{count}</span>
                </div>
              ))}
              {topConcerns.length === 0 && <p className="text-slate-500 text-sm">No booking data yet.</p>}
            </div>
          </div>

        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Pending Applications — action required */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={13} className="text-yellow-400" /> Pending Applications
                {pending.length > 0 && <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>}
              </h3>
              <button onClick={() => onNavigate('applications')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold">Review <ChevronRight size={12} /></button>
            </div>
            {pending.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400">All applications reviewed!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {pending.slice(0, 4).map(app => (
                  <div key={app.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shrink-0">{app.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{app.name}</p>
                      <p className="text-xs text-slate-500 truncate">{app.specializations[0]} · {app.city}</p>
                    </div>
                    <p className="text-[10px] text-yellow-400 shrink-0">{relTime(app.submittedAt)}</p>
                  </div>
                ))}
                {pending.length > 4 && <div className="px-4 py-2.5 text-center"><p className="text-xs text-slate-500">+{pending.length - 4} more</p></div>}
              </div>
            )}
          </div>

          {/* Top Doctors */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Star size={13} className="text-yellow-400" /> Top Doctors</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {topDoctors.length === 0 && <p className="text-slate-500 text-sm px-4 py-4">No booking data yet.</p>}
              {topDoctors.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs font-bold text-slate-500 w-4 shrink-0">#{i+1}</span>
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{d.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{d.name}</p>
                    <p className="text-xs text-slate-500 truncate">{d.specialty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-white">{d.count} sessions</p>
                    <p className="text-[10px] text-green-400">₹{fmt(d.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* City Coverage */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Globe size={13} className="text-brand-400" /> City Coverage</h3>
            <div className="space-y-2">
              {topCities.map(([city, count]) => (
                <div key={city} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{city}</span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{count}</span>
                </div>
              ))}
              {topCities.length === 0 && <p className="text-slate-500 text-sm">No location data yet.</p>}
            </div>
          </div>

          {/* This week registrations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><TrendingUp size={13} className="text-green-400" /> New This Week</h3>
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-white">{newPatients}</p>
                <p className="text-xs text-slate-400 mt-0.5">Patients</p>
              </div>
              <div className="flex-1 bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-white">{newDoctors}</p>
                <p className="text-xs text-slate-400 mt-0.5">Applications</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   APPLICATIONS TAB
══════════════════════════════════════════ */
function ApplicationsTab({ refresh }: { refresh: () => void }) {
  const [applications, setApplications] = useState<DoctorApplication[]>([]);
  const [filterTab, setFilterTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modal, setModal] = useState<{ app: DoctorApplication; action: 'approve' | 'reject' } | null>(null);
  const [docViewer, setDocViewer] = useState<{ title: string; dataUrl: string; fileName?: string } | null>(null);

  useEffect(() => { setApplications(getApplications()); }, []);
  const reload = () => { setApplications(getApplications()); refresh(); };

  const counts = { all: applications.length, pending: applications.filter(a=>a.status==='pending').length, approved: applications.filter(a=>a.status==='approved').length, rejected: applications.filter(a=>a.status==='rejected').length };
  const filtered = applications
    .filter(a => filterTab === 'all' || a.status === filterTab)
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase()) || a.specializations.join(' ').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const handleConfirm = (note: string) => {
    if (!modal) return;
    if (modal.action === 'approve') approveApplication(modal.app.id, note);
    else rejectApplication(modal.app.id, note);
    setModal(null); reload();
  };

  return (
    <>
      {/* Filter + search */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex gap-1.5">
          {(['pending','approved','rejected','all'] as const).map(t => (
            <button key={t} onClick={() => setFilterTab(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 transition-all ${filterTab === t ? t==='pending' ? 'bg-yellow-400 text-black' : t==='approved' ? 'bg-green-500 text-white' : t==='rejected' ? 'bg-red-500 text-white' : 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              {t} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filterTab===t?'bg-black/20':'bg-slate-700 text-slate-300'}`}>{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctor, email, city, specialty..." className="pl-8 pr-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-xl text-xs outline-none focus:border-brand-500 w-72" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-700">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              {['Doctor', 'Specialization', 'Registration', 'Location', 'Experience', 'Fee', 'Submitted', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-12 text-slate-500">No applications found.</td></tr>}
            {filtered.map(app => (
              <>
                <tr key={app.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shrink-0">{app.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-white">{app.name}</p>
                        <p className="text-xs text-slate-500">{app.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><p className="text-xs text-slate-300 max-w-[140px]">{app.specializations.slice(0,2).join(', ')}{app.specializations.length>2 && ` +${app.specializations.length-2}`}</p></td>
                  <td className="px-4 py-3.5"><p className="text-xs font-mono text-slate-300">{app.registrationBody}</p><p className="text-xs text-slate-500">{app.registrationNumber}</p></td>
                  <td className="px-4 py-3.5"><p className="text-xs text-slate-300">{app.city}, {app.state}</p></td>
                  <td className="px-4 py-3.5 text-sm text-slate-300">{app.experience}y</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-white">₹{app.fee}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">{relTime(app.submittedAt)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${APP_STATUS_CHIP[app.status]}`}>{app.status}</span>
                    {app.status === 'approved' && <p className="text-[10px] text-slate-600 mt-0.5">{app.reviewedAt ? fmtDate(app.reviewedAt) : ''}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    {app.status === 'pending' && (
                      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setModal({ app, action: 'reject' })} className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1.5 rounded-lg font-semibold hover:bg-red-400/20">Reject</button>
                        <button onClick={() => setModal({ app, action: 'approve' })} className="text-xs text-white bg-green-500 hover:bg-green-600 px-2.5 py-1.5 rounded-lg font-semibold">Approve</button>
                      </div>
                    )}
                    {app.status !== 'pending' && <Eye size={14} className="text-slate-600" />}
                  </td>
                </tr>
                {/* Expanded row — full application detail */}
                {expanded === app.id && (
                  <tr className="border-b border-slate-700 bg-slate-800/10">
                    <td colSpan={9} className="px-6 py-5">
                      <div className="space-y-4">

                        {/* Row 1: Contact · Registration · Practice · Documents */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">

                          {/* Contact */}
                          <div className="bg-slate-800 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Contact Info</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2"><Mail size={11} className="text-slate-500 shrink-0" /><span className="text-xs text-slate-300 break-all">{app.email}</span></div>
                              <div className="flex items-center gap-2"><Phone size={11} className="text-slate-500 shrink-0" /><span className="text-xs text-slate-300">{app.phone}</span></div>
                              <div className="flex items-start gap-2"><MapPin size={11} className="text-slate-500 shrink-0 mt-0.5" /><span className="text-xs text-slate-300">{app.city}, {app.state}{app.pincode ? ` – ${app.pincode}` : ''}</span></div>
                              {app.gender && <p className="text-xs text-slate-500">Gender: <span className="text-slate-300">{app.gender}</span></p>}
                            </div>
                          </div>

                          {/* Registration */}
                          <div className="bg-slate-800 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Registration</p>
                            <p className="text-sm font-bold text-brand-400 font-mono">{app.registrationBody}</p>
                            <p className="text-xs text-slate-300 mt-1 break-all">{app.registrationNumber}</p>
                            <p className="text-xs text-slate-500 mt-2">{app.experience} years experience</p>
                          </div>

                          {/* Practice setup */}
                          <div className="bg-slate-800 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Practice Setup</p>
                            <div className="flex items-center gap-2 mb-2">
                              {app.mode === 'online' ? <Video size={11} className="text-blue-400" /> : app.mode === 'in-clinic' ? <Building2 size={11} className="text-purple-400" /> : <Globe size={11} className="text-brand-400" />}
                              <span className="text-xs text-slate-300 capitalize">{app.mode === 'both' ? 'Online & In-Clinic' : app.mode}</span>
                            </div>
                            <p className="text-sm font-bold text-white mb-2">₹{app.fee} <span className="text-xs text-slate-500 font-normal">/ {app.duration} min</span></p>
                            {app.clinicName && <p className="text-xs text-slate-300 font-semibold">{app.clinicName}</p>}
                            {app.clinicAddress && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{app.clinicAddress}</p>}
                          </div>

                          {/* Documents */}
                          <div className="bg-slate-800 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Documents Submitted</p>
                            <div className="space-y-2.5">
                              {[
                                { uploaded: app.docPhoto,   dataUrl: app.docPhotoData,   label: 'Profile Photo',           required: true  },
                                { uploaded: app.docDegree,  dataUrl: app.docDegreeData,  label: 'Degree Certificate',       required: true  },
                                { uploaded: app.docRegCert, dataUrl: app.docRegCertData, label: 'Registration Certificate', required: true  },
                                { uploaded: app.docExpCert, dataUrl: app.docExpCertData, label: 'Experience Certificate',   required: false },
                                { uploaded: app.docGovId,   dataUrl: app.docGovIdData,   label: 'Government ID',            required: false },
                              ].map(({ uploaded, dataUrl, label, required }) => (
                                <div key={label} className="flex items-center gap-2">
                                  <span className={`text-xs font-bold shrink-0 w-3 ${uploaded ? 'text-green-400' : required ? 'text-red-400' : 'text-slate-600'}`}>
                                    {uploaded ? '✓' : '✗'}
                                  </span>
                                  <span className={`text-xs flex-1 ${uploaded ? 'text-slate-300' : required ? 'text-red-400' : 'text-slate-600'}`}>
                                    {label}{required && !uploaded ? ' (missing)' : ''}
                                  </span>
                                  {uploaded && dataUrl ? (
                                    <button
                                      onClick={() => setDocViewer({ title: label, dataUrl, fileName: label })}
                                      className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-brand-400 hover:text-brand-300 bg-brand-400/10 hover:bg-brand-400/20 border border-brand-400/20 px-2 py-1 rounded-lg transition-colors"
                                    >
                                      <ZoomIn size={9} /> View
                                    </button>
                                  ) : uploaded ? (
                                    <span className="shrink-0 text-[10px] text-slate-600 italic">no preview</span>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Education · Availability & Reach · Bio */}
                        <div className="grid md:grid-cols-3 gap-3">

                          {/* Education */}
                          <div className="bg-slate-800 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Educational Qualifications</p>
                            {app.qualifications && app.qualifications.length > 0 ? (
                              <div className="space-y-2.5">
                                {app.qualifications.map((q, i) => (
                                  <div key={i} className="bg-slate-900 rounded-lg p-3">
                                    <p className="text-sm font-semibold text-white leading-snug">{q.degree || '—'}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{q.institute || '—'}</p>
                                    {q.year && <p className="text-[10px] text-slate-600 mt-0.5">Graduated {q.year}</p>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic">No education records submitted.</p>
                            )}
                          </div>

                          {/* Availability & Reach */}
                          <div className="bg-slate-800 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Availability & Reach</p>
                            {app.availability && app.availability.length > 0 ? (
                              <div className="mb-3">
                                <p className="text-[10px] text-slate-500 uppercase mb-1.5">Available days</p>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                                    <span key={d} className={`text-[10px] px-2 py-1 rounded-lg font-bold ${app.availability?.includes(d) ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-slate-900 text-slate-700 border border-slate-700'}`}>{d}</span>
                                  ))}
                                </div>
                                {(app.availabilityStart || app.availabilityEnd) && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock size={10} className="text-slate-500" />
                                    <p className="text-xs text-slate-400">{app.availabilityStart || '?'} – {app.availabilityEnd || '?'}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic mb-3">No availability data.</p>
                            )}
                            <div className="border-t border-slate-700 pt-3 space-y-2">
                              <div><p className="text-[10px] text-slate-500 uppercase mb-1">Languages</p><p className="text-xs text-slate-300">{app.languages.join(', ')}</p></div>
                              <div><p className="text-[10px] text-slate-500 uppercase mb-1">Age groups treated</p><p className="text-xs text-slate-300">{app.ageGroups.join(', ')}</p></div>
                            </div>
                          </div>

                          {/* Bio + Admin Note */}
                          <div className="bg-slate-800 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Professional Bio</p>
                            <p className="text-xs text-slate-300 leading-relaxed">{app.bio}</p>
                            {app.adminNote && (
                              <div className="mt-4 pt-3 border-t border-slate-700">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Admin Note</p>
                                <p className="text-xs text-slate-400 italic">"{app.adminNote}"</p>
                                {app.reviewedAt && <p className="text-[10px] text-slate-600 mt-1">Reviewed: {fmtDate(app.reviewedAt)}</p>}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Row 3: Specializations tag cloud */}
                        <div className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Specializations</p>
                          {app.specializations.map(s => (
                            <span key={s} className="text-xs px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 font-semibold">{s}</span>
                          ))}
                        </div>

                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
      {modal && <ReviewModal app={modal.app} action={modal.action} onConfirm={handleConfirm} onClose={() => setModal(null)} />}
      {docViewer && <DocViewerModal title={docViewer.title} dataUrl={docViewer.dataUrl} fileName={docViewer.fileName} onClose={() => setDocViewer(null)} />}
    </>
  );
}

/* ══════════════════════════════════════════
   BOOKINGS TAB
══════════════════════════════════════════ */
function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [cancelModal, setCancelModal] = useState<Booking | null>(null);

  const reload = () => setBookings(getBookings().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  useEffect(() => { reload(); }, []);

  const counts = { all: bookings.length, confirmed: bookings.filter(b=>b.status==='confirmed').length, pending: bookings.filter(b=>b.status==='pending').length, completed: bookings.filter(b=>b.status==='completed').length, cancelled: bookings.filter(b=>b.status==='cancelled').length };
  const filtered = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => !search || [b.patientName, b.doctorName, b.concern, b.id, b.patientPhone].some(s => s?.toLowerCase().includes(search.toLowerCase())));

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {(['all','confirmed','pending','completed','cancelled'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 transition-all ${filter===s ? s==='confirmed' ? 'bg-blue-500 text-white' : s==='pending' ? 'bg-yellow-400 text-black' : s==='completed' ? 'bg-green-500 text-white' : s==='cancelled' ? 'bg-red-500 text-white' : 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              {s} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter===s?'bg-black/20':'bg-slate-700 text-slate-300'}`}>{counts[s]}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, doctor, concern, ID, phone..." className="pl-8 pr-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-xl text-xs outline-none focus:border-brand-500 w-72" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-700">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              {['ID','Patient','Phone','Doctor','Date','Time','Mode','Concern','₹','Status','Action'].map(h => (
                <th key={h} className="text-left px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={11} className="text-center py-12 text-slate-500">No bookings found.</td></tr>}
            {filtered.map(b => (
              <tr key={b.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                <td className="px-3 py-3.5 text-xs font-mono text-slate-500">{b.id}</td>
                <td className="px-3 py-3.5">
                  <p className="text-sm font-semibold text-white">{b.patientName}</p>
                  {b.createdByAdmin && <span className="text-[9px] bg-brand-500/20 text-brand-400 px-1 py-0.5 rounded font-bold">ADMIN</span>}
                </td>
                <td className="px-3 py-3.5 text-xs text-slate-400 whitespace-nowrap">{b.patientPhone}</td>
                <td className="px-3 py-3.5">
                  <p className="text-xs font-semibold text-white">{b.doctorName}</p>
                  <p className="text-[10px] text-slate-500">{b.doctorSpecialty}</p>
                </td>
                <td className="px-3 py-3.5 text-xs text-slate-300 whitespace-nowrap">{fmtDate(b.date)}</td>
                <td className="px-3 py-3.5 text-xs text-slate-300 whitespace-nowrap">{b.time}</td>
                <td className="px-3 py-3.5">
                  <span className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded w-fit ${b.mode==='online' ? 'text-blue-300 bg-blue-400/10' : 'text-purple-300 bg-purple-400/10'}`}>
                    {b.mode==='online' ? <Video size={9}/> : <Building2 size={9}/>} {b.mode==='online'?'Online':'Clinic'}
                  </span>
                </td>
                <td className="px-3 py-3.5 max-w-[120px]"><p className="text-xs text-slate-300 truncate">{b.concern}</p></td>
                <td className="px-3 py-3.5 text-sm font-bold text-white">₹{b.amount}</td>
                <td className="px-3 py-3.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_CHIP[b.status]}`}>{b.status}</span>
                  {b.cancelledBy==='admin' && <p className="text-[9px] text-red-400 mt-0.5">by admin</p>}
                </td>
                <td className="px-3 py-3.5">
                  {(b.status==='confirmed'||b.status==='pending') && (
                    <button onClick={() => setCancelModal(b)} className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 px-2 py-1 rounded-lg font-bold">
                      <Ban size={9}/> Cancel
                    </button>
                  )}
                  {b.status==='cancelled' && b.cancelReason && <p className="text-[10px] text-slate-600 max-w-[80px] truncate" title={b.cancelReason}>{b.cancelReason}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {cancelModal && <CancelModal booking={cancelModal} onConfirm={r => { cancelBooking(cancelModal.id, r, 'admin'); setCancelModal(null); reload(); }} onClose={() => setCancelModal(null)} />}
    </>
  );
}

/* ══════════════════════════════════════════
   REVENUE TAB
══════════════════════════════════════════ */
function RevenueTab() {
  const bookings = getBookings();
  const applications = getApplications();

  const paid = bookings.filter(b => b.status !== 'cancelled');
  const grossRev  = paid.reduce((s, b) => s + b.amount, 0);
  const platFees  = Math.round(grossRev * PLATFORM_FEE_PCT / 100);
  const netToDocs = grossRev - platFees;
  const avgVal    = paid.length ? Math.round(grossRev / paid.length) : 0;

  // Monthly breakdown
  const monthlyMap: Record<string, { gross: number; count: number; fees: number }> = {};
  paid.forEach(b => {
    const mo = monthLabel(b.date);
    if (!monthlyMap[mo]) monthlyMap[mo] = { gross: 0, count: 0, fees: 0 };
    monthlyMap[mo].gross += b.amount;
    monthlyMap[mo].count++;
    monthlyMap[mo].fees += Math.round(b.amount * PLATFORM_FEE_PCT / 100);
  });
  const monthlyRows = Object.entries(monthlyMap).sort((a, b) => new Date('01 ' + b[0]).getTime() - new Date('01 ' + a[0]).getTime());
  const maxMonthly = Math.max(...Object.values(monthlyMap).map(m => m.gross), 1);

  // Per-doctor breakdown
  const docRevMap: Record<string, { name: string; specialty: string; gross: number; count: number; fees: number; net: number }> = {};
  paid.forEach(b => {
    if (!docRevMap[b.doctorId]) {
      const app = applications.find(a => a.userId === b.doctorId);
      docRevMap[b.doctorId] = { name: b.doctorName, specialty: b.doctorSpecialty, gross: 0, count: 0, fees: 0, net: 0 };
    }
    docRevMap[b.doctorId].gross += b.amount;
    docRevMap[b.doctorId].count++;
    const f = Math.round(b.amount * PLATFORM_FEE_PCT / 100);
    docRevMap[b.doctorId].fees += f;
    docRevMap[b.doctorId].net  += b.amount - f;
  });
  const docRows = Object.values(docRevMap).sort((a, b) => b.gross - a.gross);

  // Specialization breakdown
  const specMap: Record<string, { gross: number; count: number }> = {};
  paid.forEach(b => {
    const s = b.doctorSpecialty;
    if (!specMap[s]) specMap[s] = { gross: 0, count: 0 };
    specMap[s].gross += b.amount;
    specMap[s].count++;
  });
  const specRows = Object.entries(specMap).sort((a, b) => b[1].gross - a[1].gross);
  const maxSpec = Math.max(...specRows.map(r => r[1].gross), 1);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Gross Revenue',        value: `₹${fmt(grossRev)}`,  sub: `${paid.length} sessions`,       icon: IndianRupee, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
          { label: `Platform Fees (${PLATFORM_FEE_PCT}%)`, value: `₹${fmt(platFees)}`, sub: 'SpeakEase earnings', icon: Percent,    color: 'text-brand-400 bg-brand-400/10 border-brand-400/20' },
          { label: 'Net to Doctors',       value: `₹${fmt(netToDocs)}`, sub: 'After platform cut',             icon: Wallet,      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
          { label: 'Avg. Booking Value',   value: `₹${fmt(avgVal)}`,    sub: 'Per session',                    icon: TrendingUp,  color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${s.color}`}><s.icon size={16} /></div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.label}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Monthly Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2"><BarChart3 size={14} className="text-brand-400" /> Monthly Revenue</h3>
          </div>
          {/* Bar chart */}
          <div className="px-5 py-4 space-y-3">
            {monthlyRows.slice(0, 6).map(([month, data]) => (
              <div key={month} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-20 shrink-0">{month}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-5 overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-600 to-brand-400 h-5 rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: `${(data.gross / maxMonthly) * 100}%`, minWidth: '2rem' }}>
                    <span className="text-[10px] font-bold text-white">₹{fmt(data.gross)}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 w-8 shrink-0 text-right">{data.count}</span>
              </div>
            ))}
            {monthlyRows.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No revenue data yet.</p>}
          </div>
          {/* Monthly table */}
          <div className="border-t border-slate-800 overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-800 bg-slate-800/30"><th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Month</th><th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Sessions</th><th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Gross</th><th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Fees</th><th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Net</th></tr></thead>
              <tbody>
                {monthlyRows.map(([month, data]) => (
                  <tr key={month} className="border-b border-slate-800/50">
                    <td className="px-4 py-2.5 text-sm text-slate-300">{month}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-400 text-right">{data.count}</td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-white text-right">₹{fmt(data.gross)}</td>
                    <td className="px-4 py-2.5 text-sm text-brand-400 text-right">₹{fmt(data.fees)}</td>
                    <td className="px-4 py-2.5 text-sm text-green-400 text-right">₹{fmt(data.gross - data.fees)}</td>
                  </tr>
                ))}
                {monthlyRows.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-slate-500">No data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Specialization Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2"><PieChart size={14} className="text-brand-400" /> Revenue by Specialization</h3>
          </div>
          <div className="p-5 space-y-3">
            {specRows.map(([spec, data]) => (
              <div key={spec} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{spec}</span>
                  <span className="text-xs font-bold text-white">₹{fmt(data.gross)} <span className="text-slate-500 font-normal">({data.count} sessions)</span></span>
                </div>
                <div className="bg-slate-800 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${(data.gross / maxSpec) * 100}%` }} />
                </div>
              </div>
            ))}
            {specRows.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No revenue data yet.</p>}
          </div>
        </div>
      </div>

      {/* Per-Doctor Revenue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2"><Stethoscope size={14} className="text-brand-400" /> Per-Doctor Revenue Breakdown</h3>
          <p className="text-xs text-slate-500">Platform fee: {PLATFORM_FEE_PCT}% per session</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-800 bg-slate-800/30">
              {['Doctor','Specialty','Sessions','Gross Revenue',`Platform Fee (${PLATFORM_FEE_PCT}%)`, 'Net to Doctor'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {docRows.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-500">No revenue data yet.</td></tr>}
              {docRows.map(d => (
                <tr key={d.name} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">{d.name.charAt(0)}</div>
                      <span className="text-sm font-semibold text-white">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{d.specialty}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-300">{d.count}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-white">₹{fmt(d.gross)}</td>
                  <td className="px-5 py-3.5 text-sm text-brand-400">−₹{fmt(d.fees)}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-green-400">₹{fmt(d.net)}</td>
                </tr>
              ))}
              {docRows.length > 0 && (
                <tr className="bg-slate-800/50 border-t-2 border-slate-700">
                  <td className="px-5 py-3 font-bold text-slate-300 text-sm" colSpan={2}>Total</td>
                  <td className="px-5 py-3 text-sm font-bold text-slate-300">{paid.length}</td>
                  <td className="px-5 py-3 text-sm font-bold text-white">₹{fmt(grossRev)}</td>
                  <td className="px-5 py-3 text-sm font-bold text-brand-400">−₹{fmt(platFees)}</td>
                  <td className="px-5 py-3 text-sm font-bold text-green-400">₹{fmt(netToDocs)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   CREATE BOOKING TAB
══════════════════════════════════════════ */
const TIME_SLOTS = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM'];
const CONCERNS_LIST = ['Stuttering','Aphasia / Stroke','Voice Disorder','Hearing Loss','Language Delay','Articulation','Dysarthria','Selective Mutism','Tinnitus','Cochlear Implant Rehab','Anxiety','Depression','ADHD','Autism (ASD)','Back Pain','Other'];

function NewBookingTab({ onCreated }: { onCreated: () => void }) {
  const [doctors, setDoctors] = useState<AuthUser[]>([]);
  const [patients, setPatients] = useState<AuthUser[]>([]);
  const [success, setSuccess] = useState<Booking | null>(null);
  const [form, setForm] = useState({ patientType: 'registered' as 'registered'|'guest', patientId: '', patientName: '', patientPhone: '', patientEmail: '', doctorId: '', date: '', time: '', mode: 'online' as 'online'|'in-clinic', concern: '', customConcern: '', amount: '800', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const u = getUsers();
    setDoctors(u.filter(u => u.role==='doctor' && u.doctorStatus==='approved'));
    setPatients(u.filter(u => u.role==='patient'));
  }, []);

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({...f, [k]: v}));
  const selectedDoctor = doctors.find(d => d.id === form.doctorId);
  const onPatientSelect = (id: string) => { const p = patients.find(p => p.id===id); setForm(f => ({...f, patientId: id, patientName: p?.name||'', patientPhone: p?.phone||'', patientEmail: p?.email||''})); };
  const canSubmit = form.doctorId && form.date && form.time && form.concern && (form.patientType==='registered' ? form.patientId : form.patientName && form.patientPhone);

  const handleCreate = () => {
    setError('');
    if (!canSubmit) { setError('Please fill in all required fields.'); return; }
    const apps = getApplications();
    const doctorApp = apps.find(a => a.userId===form.doctorId);
    const booking = createBooking({
      patientId: form.patientType==='registered' ? form.patientId : 'guest',
      patientName: form.patientName, patientPhone: form.patientPhone, patientEmail: form.patientEmail||undefined,
      doctorId: form.doctorId, doctorName: selectedDoctor?.name||'', doctorSpecialty: doctorApp?.specializations[0]||'Specialist',
      date: form.date, time: form.time, mode: form.mode,
      concern: form.concern==='Other' ? form.customConcern : form.concern,
      amount: Number(form.amount)||800, status: 'confirmed', createdByAdmin: true, notes: form.notes||undefined,
    });
    setSuccess(booking); onCreated();
  };

  if (success) return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5"><CheckCircle size={36} className="text-green-400" /></div>
      <h3 className="text-xl font-bold text-white mb-2">Booking Created!</h3>
      <p className="text-slate-400 mb-5">ID: <span className="font-mono text-white font-bold">{success.id}</span></p>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-left space-y-2 mb-6 text-sm">
        {[['Patient', success.patientName],['Doctor', success.doctorName],['Date & Time', `${fmtDate(success.date)} at ${success.time}`],['Mode', success.mode==='online'?'Online':'In-Clinic'],['Concern', success.concern],['Amount', `₹${success.amount}`]].map(([l,v]) => (
          <div key={l} className="flex items-center justify-between"><span className="text-slate-500">{l}</span><span className="text-white font-semibold">{v}</span></div>
        ))}
      </div>
      <button onClick={() => setSuccess(null)} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold text-sm">Create Another</button>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-brand-900/30 border border-brand-700/30 rounded-2xl p-4 flex items-start gap-3">
        <Shield size={16} className="text-brand-400 shrink-0 mt-0.5" />
        <div><p className="text-sm font-semibold text-brand-300">Admin Manual Booking</p><p className="text-xs text-slate-400 mt-0.5">Create a confirmed appointment on behalf of any patient. Both patient and doctor will be notified automatically.</p></div>
      </div>
      {error && <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"><AlertCircle size={14} className="text-red-400 shrink-0" /><p className="text-red-300 text-sm">{error}</p></div>}

      <FS title="Patient">
        <div className="flex gap-2 mb-4">
          {(['registered','guest'] as const).map(t => (
            <button key={t} onClick={() => setForm(f => ({...f, patientType: t, patientId:'', patientName:'', patientPhone:'', patientEmail:''}))}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${form.patientType===t ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-600 text-slate-400'}`}>
              {t==='registered' ? 'Registered Patient' : 'Guest / Walk-in'}
            </button>
          ))}
        </div>
        {form.patientType==='registered' ? (
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase mb-1.5 block">Select Patient *</label>
            <select value={form.patientId} onChange={e => onPatientSelect(e.target.value)} className="w-full px-3 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-xl text-sm outline-none focus:border-brand-500">
              <option value="">— Choose a registered patient —</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} · {p.phone||p.email}</option>)}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <DF label="Patient Name *" placeholder="Full name" value={form.patientName} onChange={set('patientName')} />
            <DF label="Phone (WhatsApp) *" placeholder="+91 XXXXX XXXXX" value={form.patientPhone} onChange={set('patientPhone')} type="tel" />
            <DF label="Email (optional)" placeholder="email@example.com" value={form.patientEmail} onChange={set('patientEmail')} type="email" />
          </div>
        )}
      </FS>

      <FS title="Doctor *">
        <select value={form.doctorId} onChange={e => set('doctorId')(e.target.value)} className="w-full px-3 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-xl text-sm outline-none focus:border-brand-500">
          <option value="">— Select an approved doctor —</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </FS>

      <FS title="Session Details">
        <div className="grid grid-cols-2 gap-3">
          <DF label="Date *" placeholder="" value={form.date} onChange={set('date')} type="date" />
          <div><label className="text-xs font-semibold text-slate-400 uppercase mb-1.5 block">Time *</label>
            <select value={form.time} onChange={e => set('time')(e.target.value)} className="w-full px-3 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-xl text-sm outline-none focus:border-brand-500">
              <option value="">Select time</option>{TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div><label className="text-xs font-semibold text-slate-400 uppercase mb-1.5 block">Mode *</label>
          <div className="flex gap-2">
            {(['online','in-clinic'] as const).map(m => (
              <button key={m} onClick={() => set('mode')(m)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${form.mode===m ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-600 text-slate-400'}`}>
                {m==='online' ? <Video size={14}/> : <Building2 size={14}/>} {m==='online'?'Online':'In-Clinic'}
              </button>
            ))}
          </div>
        </div>
        <div><label className="text-xs font-semibold text-slate-400 uppercase mb-1.5 block">Concern *</label>
          <select value={form.concern} onChange={e => set('concern')(e.target.value)} className="w-full px-3 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-xl text-sm outline-none focus:border-brand-500 mb-2">
            <option value="">Select concern</option>{CONCERNS_LIST.map(c => <option key={c}>{c}</option>)}
          </select>
          {form.concern==='Other' && <DF label="Specify" placeholder="Describe the concern..." value={form.customConcern} onChange={set('customConcern')} />}
        </div>
        <DF label="Session Fee (₹)" placeholder="800" value={form.amount} onChange={set('amount')} type="number" />
        <div><label className="text-xs font-semibold text-slate-400 uppercase mb-1.5 block">Admin Notes (internal)</label>
          <textarea value={form.notes} onChange={e => set('notes')(e.target.value)} rows={2} placeholder="Internal notes..." className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 text-slate-200 placeholder:text-slate-500 rounded-xl text-sm outline-none focus:border-brand-500 resize-none" />
        </div>
      </FS>

      <button onClick={handleCreate} disabled={!canSubmit} className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
        <Plus size={16}/> Confirm & Create Booking
      </button>
    </div>
  );
}

function FS({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-3">{title}</h3>{children}</div>;
}
function DF({ label, placeholder, value, onChange, type='text' }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div><label className="text-xs font-semibold text-slate-400 uppercase mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-3 bg-slate-700 border border-slate-600 text-slate-200 placeholder:text-slate-500 rounded-xl text-sm outline-none focus:border-brand-500" />
    </div>
  );
}

/* ══════════════════════════════════════════
   USERS TAB
══════════════════════════════════════════ */
function UsersTab() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [filter, setFilter] = useState<'all'|'patient'|'doctor'>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const bookings = getBookings();

  useEffect(() => { setUsers(getUsers().filter(u => u.role!=='admin')); }, []);

  const filtered = users
    .filter(u => filter==='all' || u.role===filter)
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || (u.phone||'').includes(search));

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex gap-1.5">
          {(['all','patient','doctor'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${filter===f ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              {f} ({users.filter(u => f==='all'||u.role===f).length})
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone..." className="pl-8 pr-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-xl text-xs outline-none focus:border-brand-500 w-56" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-700">
        <table className="w-full">
          <thead><tr className="border-b border-slate-700 bg-slate-800/50">
            {['User', 'Contact', 'Role / Status', 'Bookings', 'Joined', ''].map(h => (
              <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(u => {
              const userBookings = bookings.filter(b => b.patientId===u.id || b.doctorId===u.id);
              return (
                <>
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setExpanded(expanded===u.id ? null : u.id)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${u.role==='doctor' ? 'bg-brand-600' : 'bg-purple-600'}`}>{u.name.charAt(0)}</div>
                        <span className="text-sm font-semibold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><p className="text-xs text-slate-400">{u.email}</p><p className="text-xs text-slate-500">{u.phone||'—'}</p></td>
                    <td className="px-5 py-3.5">
                      {u.role==='patient' && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-400/10 text-purple-300 border border-purple-400/20">Patient</span>}
                      {u.role==='doctor' && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${u.doctorStatus==='approved' ? 'bg-green-400/10 text-green-300 border-green-400/20' : u.doctorStatus==='pending' ? 'bg-yellow-400/10 text-yellow-300 border-yellow-400/20' : 'bg-red-400/10 text-red-300 border-red-400/20'}`}>Doctor · {u.doctorStatus}</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-white">{userBookings.length}</span>
                      <span className="text-xs text-slate-500 ml-1">({userBookings.filter(b=>b.status==='completed').length} done)</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{fmtDate(u.createdAt)}</td>
                    <td className="px-5 py-3.5"><Eye size={13} className={expanded===u.id ? 'text-brand-400' : 'text-slate-600'} /></td>
                  </tr>
                  {expanded===u.id && userBookings.length > 0 && (
                    <tr className="border-b border-slate-700 bg-slate-800/20">
                      <td colSpan={6} className="px-5 py-3">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Booking History</p>
                        <div className="space-y-1.5">
                          {userBookings.slice(0, 5).map(b => (
                            <div key={b.id} className="flex items-center gap-3 text-xs text-slate-400 bg-slate-800 rounded-lg px-3 py-2">
                              <span className="font-mono text-slate-600">{b.id}</span>
                              <span className="text-slate-300 font-semibold">{u.role==='patient' ? b.doctorName : b.patientName}</span>
                              <span>{b.concern}</span>
                              <span>{fmtDate(b.date)} at {b.time}</span>
                              <span className={`ml-auto font-bold px-2 py-0.5 rounded-full border text-[10px] ${STATUS_CHIP[b.status]}`}>{b.status}</span>
                            </div>
                          ))}
                          {userBookings.length > 5 && <p className="text-xs text-slate-600 pl-1">+{userBookings.length-5} more bookings</p>}
                        </div>
                      </td>
                    </tr>
                  )}
                  {expanded===u.id && userBookings.length===0 && (
                    <tr className="border-b border-slate-700 bg-slate-800/20">
                      <td colSpan={6} className="px-5 py-3 text-xs text-slate-500">No bookings yet for this user.</td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   MAIN ADMIN PAGE
══════════════════════════════════════════ */
export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [pendingCount, setPendingCount] = useState(0);

  const refreshStats = () => setPendingCount(getApplications().filter(a => a.status==='pending').length);

  useEffect(() => {
    if (!loading && (!user || user.role!=='admin')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => { if (user?.role==='admin') refreshStats(); }, [user]);

  if (loading || !user || user.role!=='admin') return null;

  const TABS: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard',    label: 'Dashboard',     icon: BarChart3 },
    { id: 'applications', label: 'Applications',  icon: FileText,   badge: pendingCount||undefined },
    { id: 'bookings',     label: 'All Bookings',  icon: Calendar },
    { id: 'new-booking',  label: 'Create Booking',icon: Plus },
    { id: 'revenue',      label: 'Revenue',        icon: IndianRupee },
    { id: 'users',        label: 'Users',          icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        {/* Page header */}
        <div className="py-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center"><Shield size={13} className="text-red-400" /></div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Owner · Full Access</p>
              <span className="text-xs text-slate-600 border border-slate-700 rounded-full px-2 py-0.5">Private URL</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">SpeakEase Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Manage doctors, bookings, revenue, and platform settings.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refreshStats} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <RefreshCw size={14}/> Refresh
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-6">
          <div className="flex border-b border-slate-800 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${activeTab===t.id ? 'text-brand-400 border-brand-500 bg-brand-500/5' : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'}`}>
                <t.icon size={15}/>
                {t.label}
                {t.badge ? <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{t.badge}</span> : null}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab==='dashboard'    && <DashboardTab    onNavigate={setActiveTab} />}
            {activeTab==='applications' && <ApplicationsTab refresh={refreshStats} />}
            {activeTab==='bookings'     && <BookingsTab />}
            {activeTab==='new-booking'  && <NewBookingTab   onCreated={refreshStats} />}
            {activeTab==='revenue'      && <RevenueTab />}
            {activeTab==='users'        && <UsersTab />}
          </div>
        </div>

        {/* Footer note */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-3 flex items-start gap-3">
          <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Production note:</span> This admin panel should be hosted on a separate domain (e.g. <span className="font-mono text-slate-400">admin.speakease.in</span>), protected by IP allowlist or VPN, with 2-factor authentication enabled. The URL should never be linked from the public-facing website.
          </p>
        </div>
      </div>
    </div>
  );
}
