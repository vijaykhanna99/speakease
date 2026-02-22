const steps = [
  {
    step: '01',
    icon: '🔍',
    title: 'Describe your concern',
    description: 'Tell us your age, primary concern, and preferred session mode — online or in-clinic. Takes 60 seconds.',
    color: 'bg-brand-50 border-brand-200',
    accent: 'text-brand-600',
  },
  {
    step: '02',
    icon: '👩‍⚕️',
    title: 'Browse matched therapists',
    description: 'See verified specialists who match your specific needs, sorted by rating, experience, and availability.',
    color: 'bg-purple-50 border-purple-200',
    accent: 'text-purple-600',
  },
  {
    step: '03',
    icon: '📅',
    title: 'Book a slot',
    description: 'Pick a time that works for you — video call or in-clinic. Pay securely via UPI or card. Instant confirmation.',
    color: 'bg-coral-50 border-coral-200',
    accent: 'text-coral-600',
  },
  {
    step: '04',
    icon: '🌟',
    title: 'Start your therapy',
    description: 'Attend your session, track your progress, and rebook easily. Your recovery and wellness journey begins here.',
    color: 'bg-green-50 border-green-200',
    accent: 'text-green-600',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Book your first session in 2 minutes
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            No referrals needed. No long waitlists. Just find the right therapist and start.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className={`relative z-10 p-6 rounded-2xl border-2 ${step.color} h-full`}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{step.icon}</span>
                  <span className={`text-4xl font-black opacity-20 ${step.accent}`}>{step.step}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
