'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Star, Shield, MapPin, Clock, Video, Building2,
  Languages, GraduationCap, ChevronLeft, ThumbsUp, Calendar,
  CheckCircle, ArrowRight, Phone,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { therapists, reviews } from '@/lib/data';

const tabs = ['About', 'Reviews', 'Qualifications', 'Book'] as const;
type Tab = typeof tabs[number];

export default function TherapistProfilePage() {
  const { id } = useParams<{ id: string }>();
  const therapist = therapists.find((t) => t.id === id);
  const [activeTab, setActiveTab] = useState<Tab>('About');
  const therapistReviews = reviews.filter((r) => r.therapistId === id);

  if (!therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-2xl font-bold mb-2">Therapist not found</h2>
          <Link href="/find-therapist" className="text-brand-600 hover:underline">← Back to search</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        {/* Breadcrumb */}
        <Link
          href="/find-therapist"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to search
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: Main profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile header card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Avatar */}
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shrink-0"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
                >
                  {therapist.name.split(' ').map(n => n[0]).join('').slice(1, 3)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">{therapist.name}</h1>
                      <p className="text-slate-500 font-medium">{therapist.title}</p>
                    </div>
                    {therapist.verified && (
                      <div className="flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1.5 rounded-xl text-sm font-semibold">
                        <Shield size={14} />
                        RCI Verified
                      </div>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-slate-900">{therapist.rating}</span>
                      <span className="text-slate-400">({therapist.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap size={14} className="text-slate-400" />
                      <span>{therapist.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{therapist.city}, {therapist.state}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                      therapist.mode === 'online' ? 'bg-blue-50 text-blue-700' :
                      therapist.mode === 'in-clinic' ? 'bg-green-50 text-green-700' :
                      'bg-purple-50 text-purple-700'
                    }`}>
                      {therapist.mode === 'both' ? '🌐 Online & In-Clinic' : therapist.mode === 'online' ? '💻 Online Only' : '🏥 In-Clinic Only'}
                    </span>
                    {therapist.languages.map((lang) => (
                      <span key={lang} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex border-b border-slate-100">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm font-semibold transition-all ${
                      activeTab === tab
                        ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'About' && <AboutTab therapist={therapist} />}
                {activeTab === 'Reviews' && <ReviewsTab reviews={therapistReviews} rating={therapist.rating} count={therapist.reviewCount} />}
                {activeTab === 'Qualifications' && <QualificationsTab therapist={therapist} />}
                {activeTab === 'Book' && <BookTabInline therapistId={therapist.id} />}
              </div>
            </div>
          </div>

          {/* RIGHT: Booking sidebar */}
          <div className="space-y-4">
            {/* Booking card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-3xl font-bold text-slate-900">₹{therapist.fee}</p>
                  <p className="text-xs text-slate-400">per {therapist.sessionDuration}-min session</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Clock size={13} className="text-green-500" />
                    <span className="text-xs font-semibold text-green-600">Available</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{therapist.nextAvailable}</p>
                </div>
              </div>

              {/* Mode buttons */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <button className="flex items-center justify-center gap-2 p-3 bg-brand-50 border-2 border-brand-400 rounded-xl text-brand-700 text-sm font-semibold">
                  <Video size={14} />
                  Online
                </button>
                <button className="flex items-center justify-center gap-2 p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:border-slate-300">
                  <Building2 size={14} />
                  In-Clinic
                </button>
              </div>

              {/* Quick slots */}
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pick a Slot</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {['Today 4:00 PM', 'Today 6:00 PM', 'Tomorrow 10 AM', 'Tomorrow 12 PM'].map((slot, i) => (
                  <button
                    key={slot}
                    className={`text-xs py-2.5 rounded-xl font-medium transition-all ${
                      i === 0
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-700 border border-slate-200'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <Link
                href={`/book/${therapist.id}`}
                className="block w-full bg-brand-600 hover:bg-brand-700 text-white text-center font-bold py-4 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-95"
              >
                Book Session →
              </Link>

              <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                <Shield size={10} />
                Free cancellation up to 24 hrs before
              </p>
            </div>

            {/* Contact card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
              <p className="text-sm text-slate-500 mb-2">Have questions?</p>
              <a
                href="tel:+918000123456"
                className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm hover:text-brand-700"
              >
                <Phone size={14} />
                Call +91 80001 23456
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function AboutTab({ therapist }: { therapist: typeof therapists[0] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-slate-900 mb-3">About</h3>
        <p className="text-slate-600 leading-relaxed">{therapist.bio}</p>
      </div>

      <div>
        <h3 className="font-bold text-slate-900 mb-3">Specializations</h3>
        <div className="flex flex-wrap gap-2">
          {therapist.specializations.map((s) => (
            <span key={s} className="bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1.5 rounded-lg text-sm font-medium">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-slate-900 mb-3">Conditions Treated</h3>
        <div className="flex flex-wrap gap-2">
          {therapist.conditions.map((c) => (
            <span key={c} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-slate-900 mb-3">Age Groups</h3>
        <div className="flex flex-wrap gap-2">
          {therapist.ageGroups.map((a) => (
            <span key={a} className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg text-sm font-medium">
              {a}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-slate-900 mb-3">Languages</h3>
        <div className="flex flex-wrap gap-2">
          {therapist.languages.map((l) => (
            <span key={l} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
              🌐 {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewsTab({ reviews, rating, count }: { reviews: any[]; rating: number; count: number }) {
  return (
    <div className="space-y-6">
      {/* Rating summary */}
      <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl">
        <div className="text-center">
          <p className="text-5xl font-black text-slate-900">{rating}</p>
          <div className="flex justify-center mt-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={14} className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1">{count} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5,4,3,2,1].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-3">{n}</span>
              <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-yellow-400 h-1.5 rounded-full"
                  style={{ width: n === 5 ? '80%' : n === 4 ? '15%' : '5%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.id} className="border-b border-slate-100 pb-5 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{review.patientName}</span>
                  {review.verified && (
                    <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                      <CheckCircle size={11} />
                      Verified
                    </span>
                  )}
                </div>
                {review.condition && (
                  <span className="text-xs text-slate-400">{review.condition} · Child age {review.childAge}</span>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={11} className={i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'} />
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
            <p className="text-xs text-slate-400 mt-2">{new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-slate-400">
          <p className="text-3xl mb-2">💬</p>
          <p>No reviews yet for this therapist.</p>
        </div>
      )}
    </div>
  );
}

function QualificationsTab({ therapist }: { therapist: typeof therapists[0] }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-slate-900 mb-4">Educational Qualifications</h3>
        <div className="space-y-3">
          {therapist.qualifications.map((q, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
                <GraduationCap size={14} className="text-brand-600" />
              </div>
              <p className="text-sm text-slate-700 font-medium">{q}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-green-600" />
          <span className="font-semibold text-green-800 text-sm">Registration Verified</span>
        </div>
        <p className="text-xs text-green-700">Registration No: {therapist.registrationNo}</p>
        <p className="text-xs text-green-600 mt-1">SpeakEase manually verifies all credentials before a therapist can go live on the platform.</p>
      </div>
    </div>
  );
}

function BookTabInline({ therapistId }: { therapistId: string }) {
  return (
    <div className="text-center py-6">
      <div className="text-5xl mb-4">📅</div>
      <h3 className="font-bold text-xl text-slate-900 mb-2">Ready to book?</h3>
      <p className="text-slate-500 text-sm mb-6">View all available slots and complete your booking in 2 minutes.</p>
      <Link
        href={`/book/${therapistId}`}
        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-sm hover:shadow-md"
      >
        Choose a Time Slot
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
