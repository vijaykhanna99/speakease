import { Star, Quote, Mic, Ear } from 'lucide-react';

const testimonials = [
  {
    name: 'Ravi Krishnamurthy',
    role: 'Stroke Survivor, 52',
    city: 'Bangalore',
    rating: 5,
    text: 'I had a stroke and lost most of my speech. After 5 months with Dr. Priya on SpeakEase, I can hold full conversations again. The online sessions were a lifesaver — no travel when I was barely mobile.',
    condition: 'Post-Stroke Aphasia',
    avatar: 'RK',
    color: '#0d9488',
    specialty: 'speech',
  },
  {
    name: 'Meera Subramaniam',
    role: 'IT Professional, 38',
    city: 'Chennai',
    rating: 5,
    text: 'I\'d had tinnitus for 3 years and thought nothing could help. Dr. Vikram on SpeakEase did a thorough hearing assessment and built a tinnitus management plan for me. The ringing is barely noticeable now.',
    condition: 'Tinnitus',
    avatar: 'MS',
    color: '#2563eb',
    specialty: 'audiology',
  },
  {
    name: 'Pradeep Nair',
    role: 'Retired Teacher, 67',
    city: 'Hyderabad',
    rating: 5,
    text: 'After my knee replacement, I needed physiotherapy but couldn\'t travel easily. Dr. Arjun\'s online sessions were excellent — he guided every exercise with such care. I\'m walking without pain now.',
    condition: 'Post-Surgery Rehab',
    avatar: 'PN',
    color: '#16a34a',
    specialty: 'physio',
  },
];

const specialtyLabel: Record<string, { icon: any; label: string; bg: string; text: string }> = {
  speech:    { icon: Mic,  label: 'Speech Therapy', bg: 'bg-brand-50',  text: 'text-brand-700' },
  audiology: { icon: Ear,  label: 'Audiology',      bg: 'bg-blue-50',   text: 'text-blue-700'  },
  physio:    { icon: null, label: 'Physiotherapy',   bg: 'bg-green-50',  text: 'text-green-700' },
};

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">Success Stories</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Real patients, real progress
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            From speech recovery to hearing rehabilitation to physical rehab — across all ages.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => {
            const sp = specialtyLabel[t.specialty];
            const Icon = sp?.icon;
            return (
              <div key={i} className={`relative bg-white border-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${i < 2 ? 'border-brand-100' : 'border-slate-100'}`}>
                {/* Specialty badge */}
                <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg mb-4 ${sp.bg} ${sp.text}`}>
                  {Icon && <Icon size={11} />}
                  {sp.label}
                </div>

                <Quote size={24} className="text-slate-100 mb-3" />

                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role} · {t.city}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sp.bg} ${sp.text}`}>
                      {t.condition}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
