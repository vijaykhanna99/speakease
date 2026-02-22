import Link from 'next/link';
import { Star, MapPin, Clock, Shield, Video, Building2, ArrowRight } from 'lucide-react';
import { therapists } from '@/lib/data';

export default function FeaturedTherapists() {
  const featured = therapists.filter((t) => t.featured).slice(0, 3);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">Top Therapists</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Highly rated & verified specialists
            </h2>
          </div>
          <Link
            href="/find-therapist"
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold shrink-0 transition-colors"
          >
            View all therapists <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((therapist) => (
            <TherapistCard key={therapist.id} therapist={therapist} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TherapistCard({ therapist }: { therapist: typeof therapists[0] }) {
  const modeIcon = therapist.mode === 'online' ? Video : therapist.mode === 'in-clinic' ? Building2 : null;
  const modeLabel = therapist.mode === 'both' ? 'Online & In-Clinic' : therapist.mode === 'online' ? 'Online Only' : 'In-Clinic Only';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg card-hover overflow-hidden">
      {/* Card header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0"
            style={{ background: `linear-gradient(135deg, #0d9488, #0f766e)` }}
          >
            {therapist.name.split(' ').map(n => n[0]).join('').slice(1, 3)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-base truncate">{therapist.name}</h3>
                <p className="text-sm text-slate-500 truncate">{therapist.title}</p>
              </div>
              {therapist.verified && (
                <div className="shrink-0 flex items-center gap-1 bg-brand-50 text-brand-700 px-2 py-1 rounded-lg text-xs font-semibold">
                  <Shield size={10} />
                  <span>Verified</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-slate-800">{therapist.rating}</span>
                <span className="text-xs text-slate-400">({therapist.reviewCount})</span>
              </div>
              <span className="text-slate-200">·</span>
              <span className="text-xs text-slate-500">{therapist.experience} yrs exp</span>
            </div>
          </div>
        </div>

        {/* Specialization tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {therapist.conditions.slice(0, 3).map((cond) => (
            <span key={cond} className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2.5 py-1 font-medium">
              {cond}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mx-6" />

      {/* Card body */}
      <div className="p-6 pt-4">
        <div className="grid grid-cols-2 gap-y-2.5 mb-5 text-sm">
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin size={13} className="text-slate-400" />
            <span>{therapist.city}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="text-base">{therapist.mode === 'online' ? '💻' : therapist.mode === 'in-clinic' ? '🏥' : '🌐'}</span>
            <span>{modeLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock size={13} className="text-slate-400" />
            <span className="text-green-600 font-medium">{therapist.nextAvailable}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="text-brand-700 font-bold text-base">₹{therapist.fee}</span>
            <span className="text-xs">/ session</span>
          </div>
        </div>

        <Link
          href={`/therapist/${therapist.id}`}
          className="block w-full bg-brand-600 hover:bg-brand-700 text-white text-center font-semibold py-3 rounded-xl transition-all active:scale-95 text-sm"
        >
          View Profile & Book
        </Link>
      </div>
    </div>
  );
}
