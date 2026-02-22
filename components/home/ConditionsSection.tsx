import Link from 'next/link';

const speechAudiologyConditions = [
  { name: 'Stuttering / Fluency', icon: '🗣️', count: 41 },
  { name: 'Hearing Loss', icon: '👂', count: 22 },
  { name: 'Aphasia (Post-Stroke)', icon: '🧩', count: 38 },
  { name: 'Tinnitus', icon: '🔔', count: 18 },
  { name: 'Voice Disorders', icon: '🎙️', count: 29 },
  { name: 'Cochlear Implant Rehab', icon: '⚙️', count: 14 },
  { name: 'Articulation Disorders', icon: '💬', count: 47 },
  { name: 'Auditory Processing Disorder', icon: '🎧', count: 16 },
  { name: 'Speech Delay', icon: '⏱️', count: 94 },
  { name: 'Age-Related Hearing Loss', icon: '👴', count: 19 },
  { name: 'Dysarthria', icon: '🧠', count: 22 },
  { name: 'Selective Mutism', icon: '🤫', count: 12 },
];

const otherConditions = [
  { name: 'Anxiety & Depression', icon: '💆', count: 62 },
  { name: 'Back & Neck Pain', icon: '🦴', count: 55 },
  { name: 'Autism Spectrum Disorder', icon: '🧩', count: 85 },
  { name: 'ADHD', icon: '⚡', count: 62 },
  { name: 'Dyslexia', icon: '📖', count: 38 },
  { name: 'Post-Surgery Rehab', icon: '🏥', count: 47 },
  { name: 'Parkinson\'s Disease', icon: '🤝', count: 19 },
  { name: 'Stress & Burnout', icon: '🌿', count: 71 },
];

export default function ConditionsSection() {
  return (
    <section id="conditions" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-12">
          <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">Conditions We Treat</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            From speech & hearing to full-body care
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Our specialists cover 60+ conditions — across all ages and all therapy disciplines.
          </p>
        </div>

        {/* Speech & Audiology conditions — primary */}
        <div className="mb-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-brand-600 text-white rounded-xl px-3 py-1.5 text-xs font-bold">
              🗣️ Speech &amp; 👂 Audiology
            </div>
            <div className="flex-1 h-px bg-brand-100" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {speechAudiologyConditions.map((c) => (
              <Link
                key={c.name}
                href={`/find-therapist?q=${encodeURIComponent(c.name)}`}
                className="flex items-center gap-3 bg-white hover:bg-brand-50 border-2 border-brand-100 hover:border-brand-300 rounded-xl p-3.5 transition-all group"
              >
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 group-hover:text-brand-700 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.count} specialists</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Other conditions */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-slate-600 text-white rounded-xl px-3 py-1.5 text-xs font-bold">
              Other Conditions
            </div>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {otherConditions.map((c) => (
              <Link
                key={c.name}
                href={`/find-therapist?q=${encodeURIComponent(c.name)}`}
                className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 transition-all group"
              >
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.count} specialists</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
