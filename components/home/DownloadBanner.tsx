export default function DownloadBanner() {
  return (
    <section className="py-16 bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #14b8a6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #7c3aed 0%, transparent 40%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-widest mb-3">Mobile App · Coming Soon</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Therapy at your fingertips
            </h2>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              The SpeakEase app lets you find and book verified therapists anytime, anywhere.
              Get session reminders, track your progress, and stay connected — all in one place.
              Available for all ages, all conditions.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl px-5 py-3.5 transition-all">
                <span className="text-2xl">🍎</span>
                <div className="text-left">
                  <p className="text-xs opacity-70">Download on the</p>
                  <p className="font-bold">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl px-5 py-3.5 transition-all">
                <span className="text-2xl">▶️</span>
                <div className="text-left">
                  <p className="text-xs opacity-70">Get it on</p>
                  <p className="font-bold">Google Play</p>
                </div>
              </button>
            </div>
          </div>

          {/* Mock phone */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-64">
              <div className="bg-slate-800 rounded-[2.5rem] p-3 shadow-2xl border border-slate-700">
                <div className="bg-white rounded-[2rem] overflow-hidden" style={{ aspectRatio: '9/16' }}>
                  <div className="bg-gradient-to-b from-brand-600 to-brand-800 p-5 text-white">
                    <p className="text-xs opacity-70 mb-1">Hi Ravi 👋</p>
                    <p className="font-bold text-lg leading-tight">Next session in<br />2 hours</p>
                  </div>
                  <div className="p-4 space-y-3">
                    {['Upcoming Session', 'Progress Report', 'Find Therapist', 'Messages'].map((item) => (
                      <div key={item} className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-2.5">
                        <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
                          <span className="text-brand-600 text-xs">★</span>
                        </div>
                        <span className="text-xs font-medium text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
