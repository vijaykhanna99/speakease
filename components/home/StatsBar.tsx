const stats = [
  { value: '48+', label: 'Speech Therapists', icon: '🗣️' },
  { value: '15+', label: 'Audiologists', icon: '👂' },
  { value: '500+', label: 'Total Specialists', icon: '🩺' },
  { value: '10,000+', label: 'Patients Treated', icon: '🙌' },
  { value: '4.9★', label: 'Average Rating', icon: '⭐' },
];

export default function StatsBar() {
  return (
    <section className="bg-white border-b border-slate-100 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-0 lg:divide-x divide-slate-100">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-0 lg:px-8 first:pl-0 last:pr-0 ${
                i < 2 ? 'relative' : ''
              }`}
            >
              {/* Highlight badge for first two */}
              {i < 2 && (
                <div className="absolute -top-2 right-0 hidden lg:block">
                  <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Primary
                  </span>
                </div>
              )}
              <span className="text-2xl">{stat.icon}</span>
              <div className="text-center sm:text-left">
                <p className={`text-xl sm:text-2xl font-bold ${i < 2 ? 'text-brand-700' : 'text-slate-900'}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
