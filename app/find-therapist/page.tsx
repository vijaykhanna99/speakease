'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, MapPin, Star, Shield, Clock,
  Video, Building2, X, ChevronDown, Grid3X3, List,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { therapists, specializations, cities } from '@/lib/data';
import type { Therapist } from '@/lib/types';

const feeRanges = [
  { label: 'Any fee', min: 0, max: Infinity },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500–₹1000', min: 500, max: 1000 },
  { label: '₹1000–₹1500', min: 1000, max: 1500 },
  { label: '₹1500+', min: 1500, max: Infinity },
];

export default function FindTherapistPage() {
  const [query, setQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedFee, setSelectedFee] = useState(0);
  const [sortBy, setSortBy] = useState<'rating' | 'fee_asc' | 'fee_desc' | 'experience'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...therapists];

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.specializations.some((s) => s.toLowerCase().includes(q)) ||
          t.conditions.some((c) => c.toLowerCase().includes(q)) ||
          t.city.toLowerCase().includes(q),
      );
    }

    if (selectedSpec) {
      list = list.filter((t) => t.specializations.includes(selectedSpec as any));
    }

    if (selectedCity !== 'All Cities') {
      list = list.filter((t) => t.city === selectedCity);
    }

    if (selectedMode) {
      list = list.filter((t) => t.mode === selectedMode || t.mode === 'both');
    }

    const feeRange = feeRanges[selectedFee];
    list = list.filter((t) => t.fee >= feeRange.min && t.fee <= feeRange.max);

    list.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'fee_asc') return a.fee - b.fee;
      if (sortBy === 'fee_desc') return b.fee - a.fee;
      if (sortBy === 'experience') return b.experience - a.experience;
      return 0;
    });

    return list;
  }, [query, selectedSpec, selectedCity, selectedMode, selectedFee, sortBy]);

  const activeFilterCount = [
    selectedSpec,
    selectedCity !== 'All Cities' ? selectedCity : '',
    selectedMode,
    selectedFee > 0 ? 'fee' : '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedSpec('');
    setSelectedCity('All Cities');
    setSelectedMode('');
    setSelectedFee(0);
    setQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Search Header */}
      <div className="bg-gradient-to-r from-brand-900 to-brand-800 pt-24 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Find the right therapist for you or your loved one
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-white rounded-xl flex items-center px-4 gap-3 shadow-lg">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by condition, specialist name, or specialization..."
                className="flex-1 py-3.5 text-slate-800 placeholder:text-slate-400 text-sm bg-transparent outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-white text-brand-700'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-brand-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Specialization quick chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            <Chip
              label="All"
              active={!selectedSpec}
              onClick={() => setSelectedSpec('')}
            />
            {specializations.map((s) => (
              <Chip
                key={s.name}
                label={`${s.icon} ${s.name}`}
                active={selectedSpec === s.name}
                onClick={() => setSelectedSpec(selectedSpec === s.name ? '' : s.name)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* City */}
              <FilterSelect
                label="City"
                value={selectedCity}
                onChange={setSelectedCity}
                options={cities}
              />
              {/* Mode */}
              <FilterSelect
                label="Consultation Mode"
                value={selectedMode || 'Any mode'}
                onChange={(v) => setSelectedMode(v === 'Any mode' ? '' : v)}
                options={['Any mode', 'online', 'in-clinic']}
              />
              {/* Fee */}
              <FilterSelect
                label="Fee Range"
                value={feeRanges[selectedFee].label}
                onChange={(v) => setSelectedFee(feeRanges.findIndex((f) => f.label === v))}
                options={feeRanges.map((f) => f.label)}
              />
              {/* Sort */}
              <FilterSelect
                label="Sort By"
                value={sortBy}
                onChange={(v) => setSortBy(v as any)}
                options={['rating', 'fee_asc', 'fee_desc', 'experience']}
                labels={{ rating: 'Highest Rated', fee_asc: 'Fee: Low to High', fee_desc: 'Fee: High to Low', experience: 'Most Experienced' }}
              />
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <X size={14} />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Results bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600 text-sm">
            <span className="font-bold text-slate-900 text-base">{filtered.length}</span> therapists found
            {selectedSpec && <span> in <strong>{selectedSpec}</strong></span>}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-brand-100 text-brand-600' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-brand-100 text-brand-600' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No therapists found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or search query.</p>
            <button onClick={clearFilters} className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}>
            {filtered.map((t) =>
              viewMode === 'grid' ? (
                <TherapistGridCard key={t.id} therapist={t} />
              ) : (
                <TherapistListCard key={t.id} therapist={t} />
              ),
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-white text-brand-700 shadow-sm'
          : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
      }`}
    >
      {label}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 pr-8"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {labels?.[opt] ?? opt}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function TherapistGridCard({ therapist }: { therapist: Therapist }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg card-hover overflow-hidden">
      <div className="p-5 pb-4">
        <div className="flex items-start gap-3.5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
          >
            {therapist.name.split(' ').map(n => n[0]).join('').slice(1, 3)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div>
                <h3 className="font-bold text-slate-900 text-sm truncate">{therapist.name}</h3>
                <p className="text-xs text-slate-500">{therapist.title}</p>
              </div>
              {therapist.verified && (
                <Shield size={14} className="text-brand-600 shrink-0 mt-0.5" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                <Star size={11} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-slate-800">{therapist.rating}</span>
                <span className="text-xs text-slate-400">({therapist.reviewCount})</span>
              </div>
              <span className="text-slate-200 text-xs">·</span>
              <span className="text-xs text-slate-500">{therapist.experience}y</span>
              <span className="text-slate-200 text-xs">·</span>
              <MapPin size={10} className="text-slate-400" />
              <span className="text-xs text-slate-500">{therapist.city}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {therapist.conditions.slice(0, 2).map((c) => (
            <span key={c} className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5 font-medium">{c}</span>
          ))}
          {therapist.conditions.length > 2 && (
            <span className="text-xs text-slate-400">+{therapist.conditions.length - 2}</span>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 mx-5" />

      <div className="p-5 pt-3.5">
        <div className="flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-1 text-green-600 font-medium">
            <Clock size={11} />
            <span>{therapist.nextAvailable}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <span className="font-bold text-slate-900">₹{therapist.fee}</span>
            <span className="text-slate-400">/session</span>
          </div>
        </div>
        <Link
          href={`/therapist/${therapist.id}`}
          className="block w-full bg-brand-600 hover:bg-brand-700 text-white text-center font-semibold py-2.5 rounded-xl transition-all text-sm"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

function TherapistListCard({ therapist: t }: { therapist: Therapist }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
        >
          {t.name.split(' ').map(n => n[0]).join('').slice(1, 3)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900">{t.name}</h3>
                {t.verified && <Shield size={14} className="text-brand-600" />}
              </div>
              <p className="text-sm text-slate-500">{t.title} · {t.experience} yrs exp · {t.city}</p>

              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold">{t.rating}</span>
                  <span className="text-xs text-slate-400">({t.reviewCount} reviews)</span>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium capitalize">
                  {t.mode === 'both' ? 'Online & In-Clinic' : t.mode}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {t.conditions.slice(0, 4).map((c) => (
                  <span key={c} className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5 font-medium">{c}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
              <p className="font-bold text-lg text-slate-900">₹{t.fee}<span className="text-sm font-normal text-slate-400">/session</span></p>
              <p className="text-xs text-green-600 font-medium">{t.nextAvailable}</p>
              <Link
                href={`/therapist/${t.id}`}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
