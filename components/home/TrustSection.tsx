import { Shield, CheckCircle, Lock, Award } from 'lucide-react';

const trustPoints = [
  {
    icon: Shield,
    title: 'RCI & MCI Verified',
    description: 'Every therapist\'s credentials, degrees, and registration numbers are manually verified before their profile goes live.',
    color: 'text-brand-600 bg-brand-50',
  },
  {
    icon: Award,
    title: 'Genuine Reviews Only',
    description: 'Reviews are only allowed after a completed, paid session — no fake or paid reviews, ever.',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'All transactions secured via Razorpay with PCI-DSS compliance. Full refund if cancelled 24 hrs before.',
    color: 'text-coral-600 bg-coral-50',
  },
  {
    icon: CheckCircle,
    title: 'Privacy Protected',
    description: 'Your health data is encrypted and never shared with third parties. HIPAA-aligned data practices.',
    color: 'text-green-600 bg-green-50',
  },
];

export default function TrustSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">Why SpeakEase</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5">
              India's most trusted<br />Speech & Therapy platform
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              We built SpeakEase to make quality therapy accessible to everyone. Leading with Speech Therapy and Audiology — the two most underserved specialties in India — and expanding to cover every major discipline. Whether you're 6 or 66, you deserve the right specialist without the hassle.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              {['RCI Certified Network', 'MCI Approved', 'ISO 27001', 'HIPAA Aligned'].map((badge) => (
                <div key={badge} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-xs font-semibold text-slate-700">{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="grid grid-cols-2 gap-4">
            {trustPoints.map((point, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className={`w-10 h-10 rounded-xl ${point.color} flex items-center justify-center mb-3`}>
                  <point.icon size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{point.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
