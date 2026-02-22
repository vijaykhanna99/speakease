import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const allSpecs = [
  // Primary — Speech & Audiology (larger, featured)
  {
    name: 'Speech Therapy',
    icon: '🗣️',
    description: 'Stuttering, aphasia, voice, language delay, articulation & more',
    color: 'bg-brand-600 text-white border-brand-700',
    textColor: 'text-white/80',
    count: 48,
    featured: true,
  },
  {
    name: 'Audiology',
    icon: '👂',
    description: 'Hearing loss, tinnitus, cochlear implant rehab, hearing aids',
    color: 'bg-blue-600 text-white border-blue-700',
    textColor: 'text-white/80',
    count: 15,
    featured: true,
  },
  // Secondary — all others
  {
    name: 'Psychology',
    icon: '🧠',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Anxiety, depression, OCD, PTSD, ADHD & behavioural concerns',
    textColor: 'text-purple-500',
    count: 32,
    featured: false,
  },
  {
    name: 'Occupational Therapy',
    icon: '🤲',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    description: 'Daily living skills, sensory processing, fine motor & rehab',
    textColor: 'text-orange-500',
    count: 27,
    featured: false,
  },
  {
    name: 'Physiotherapy',
    icon: '🏃',
    color: 'bg-green-50 text-green-700 border-green-200',
    description: 'Pain management, post-surgery rehab, stroke & sports injuries',
    textColor: 'text-green-500',
    count: 19,
    featured: false,
  },
  {
    name: 'Behavioral Therapy',
    icon: '💡',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    description: 'ABA, CBT, behavior modification for autism, ADHD & more',
    textColor: 'text-yellow-600',
    count: 21,
    featured: false,
  },
  {
    name: 'Special Education',
    icon: '📚',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    description: 'Dyslexia, learning disabilities, IEP planning & academic support',
    textColor: 'text-pink-500',
    count: 34,
    featured: false,
  },
  {
    name: 'Child Development',
    icon: '👶',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Developmental assessments, milestones & early intervention',
    textColor: 'text-amber-600',
    count: 22,
    featured: false,
  },
];

export default function SpecializationsSection() {
  const featured = allSpecs.filter(s => s.featured);
  const others   = allSpecs.filter(s => !s.featured);

  return (
    <section id="specializations" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-12">
          <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">All Specializations</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            One platform, every specialist you need
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Leading with Speech Therapy & Audiology — and covering every major therapy discipline across India.
          </p>
        </div>

        {/* Featured: Speech & Audiology — full-width hero cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {featured.map((spec) => (
            <Link
              key={spec.name}
              href={`/find-therapist?spec=${encodeURIComponent(spec.name)}`}
              className={`group relative p-6 rounded-2xl border-2 card-hover transition-all ${spec.color}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{spec.icon}</span>
                    <span className="text-xs font-bold bg-white/20 rounded-full px-2.5 py-1 uppercase tracking-wider">
                      Core Specialty
                    </span>
                  </div>
                  <h3 className="font-bold text-xl mb-1">{spec.name}</h3>
                  <p className={`text-sm leading-relaxed mb-3 ${spec.textColor}`}>{spec.description}</p>
                  <p className={`text-sm font-semibold ${spec.textColor}`}>{spec.count} verified specialists</p>
                </div>
                <ArrowRight size={20} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Divider label */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">Also available on SpeakEase</p>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Secondary: all other specializations */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {others.map((spec) => (
            <Link
              key={spec.name}
              href={`/find-therapist?spec=${encodeURIComponent(spec.name)}`}
              className={`group relative p-4 rounded-2xl border-2 bg-white hover:shadow-md card-hover transition-all ${spec.color}`}
            >
              <div className="text-2xl mb-2">{spec.icon}</div>
              <h3 className="font-bold text-sm mb-1">{spec.name}</h3>
              <p className={`text-xs leading-relaxed ${spec.textColor} opacity-80`}>{spec.description}</p>
              <p className="text-xs font-semibold mt-2 opacity-70">{spec.count} specialists</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/find-therapist"
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold transition-colors"
          >
            View all 220+ verified therapists
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
