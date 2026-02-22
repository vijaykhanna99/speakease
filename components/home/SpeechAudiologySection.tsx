import Link from 'next/link';
import { ArrowRight, Mic, Ear, CheckCircle } from 'lucide-react';

const speechConditions = [
  'Stuttering / Fluency', 'Articulation Disorders', 'Language Delay',
  'Aphasia (Post-Stroke)', 'Voice Disorders', 'Selective Mutism',
  'Autism — Communication', 'Dysarthria', 'Lisping', 'Professional Voice Care',
];

const audiologyConditions = [
  'Hearing Loss (All Types)', 'Tinnitus', 'Auditory Processing Disorder',
  'Cochlear Implant Rehab', 'Age-Related Hearing Loss', 'Hearing Aids Fitting',
  'Central Auditory Processing', 'Hyperacusis', 'Balance Disorders', 'Newborn Hearing Screening',
];

const whyPoints = [
  'Largest network of RCI-certified Speech & Hearing specialists in India',
  'Online sessions from home or in-clinic — whichever suits you',
  'All ages: infants, children, adults and seniors',
  'Expert therapy for both speech production and hearing rehabilitation',
];

export default function SpeechAudiologySection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #0d9488 0%, transparent 60%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section label */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-2 mb-4">
            <Mic size={14} className="text-brand-600" />
            <span className="text-brand-700 text-sm font-bold">Our Core Specializations</span>
            <Ear size={14} className="text-brand-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            India's most trusted platform for<br />
            <span className="text-brand-600">Speech Therapy</span> &{' '}
            <span className="text-brand-600">Audiology</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Whether you're dealing with a communication challenge or a hearing concern —
            at any age — our verified specialists are here to help.
          </p>
        </div>

        {/* Two main cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          {/* Speech Therapy card */}
          <div className="bg-gradient-to-br from-brand-50 to-brand-100 border-2 border-brand-200 rounded-3xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Mic size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-900">Speech Therapy</h3>
                <p className="text-brand-600 text-sm font-medium">48 verified SLPs across India</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-5 leading-relaxed">
              Our Speech-Language Pathologists work with all ages — from toddlers with speech delays
              to adults recovering from stroke, professionals with voice concerns, and everyone in between.
            </p>

            {/* Conditions grid */}
            <div className="flex flex-wrap gap-2 mb-6">
              {speechConditions.map((c) => (
                <Link
                  key={c}
                  href={`/find-therapist?q=${encodeURIComponent(c)}&spec=Speech+Therapy`}
                  className="text-xs bg-white/80 hover:bg-white text-brand-700 border border-brand-200 hover:border-brand-400 rounded-lg px-2.5 py-1.5 font-medium transition-all"
                >
                  {c}
                </Link>
              ))}
            </div>

            <Link
              href="/find-therapist?spec=Speech+Therapy"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-3 rounded-xl transition-all text-sm shadow-sm"
            >
              Find a Speech Therapist
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Audiology card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-3xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Ear size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900">Audiology</h3>
                <p className="text-blue-600 text-sm font-medium">15 verified Audiologists across India</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-5 leading-relaxed">
              Our Audiologists provide comprehensive hearing assessments, hearing aid fitting,
              tinnitus management, and cochlear implant rehabilitation — for children and adults alike.
            </p>

            {/* Conditions grid */}
            <div className="flex flex-wrap gap-2 mb-6">
              {audiologyConditions.map((c) => (
                <Link
                  key={c}
                  href={`/find-therapist?q=${encodeURIComponent(c)}&spec=Audiology`}
                  className="text-xs bg-white/80 hover:bg-white text-blue-700 border border-blue-200 hover:border-blue-400 rounded-lg px-2.5 py-1.5 font-medium transition-all"
                >
                  {c}
                </Link>
              ))}
            </div>

            <Link
              href="/find-therapist?spec=Audiology"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition-all text-sm shadow-sm"
            >
              Find an Audiologist
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Why us strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Why SpeakEase for Speech & Hearing</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {whyPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle size={15} className="text-brand-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">{point}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
