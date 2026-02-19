import React, { useState } from 'react';
import { Wedge, WedgeInput } from '../types.ts';
import { Plus, Trash2, ChevronRight } from 'lucide-react';

interface TheBagProps {
  wedges: Wedge[];
  onAdd: (w: WedgeInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onStartCombine: (wedge: Wedge) => void;
}

// ── Club models dropdown data ─────────────────────────────────────────────────
const CLUB_MODELS = [
  // Cleveland
  'Cleveland RTX 6',
  'Cleveland RTX 6 ZipCore',
  'Cleveland RTX 5',
  'Cleveland RTX 4',
  'Cleveland CBX 4',
  'Cleveland CBX 3',
  'Cleveland Smart Sole 4',
  // Titleist
  'Titleist Vokey SM10',
  'Titleist Vokey SM9',
  'Titleist Vokey SM8',
  'Titleist Vokey SM7',
  'Titleist Vokey SM6',
  // Callaway
  'Callaway Jaws Raw',
  'Callaway Jaws MD5',
  'Callaway Jaws MD4',
  'Callaway Mack Daddy 5',
  'Callaway Mack Daddy 4',
  // TaylorMade
  'TaylorMade MG4',
  'TaylorMade MG3',
  'TaylorMade MG2',
  'TaylorMade Hi-Toe Raw',
  'TaylorMade Hi-Toe 3',
  // Ping
  'Ping Glide 4.0',
  'Ping Glide 3.0',
  'Ping Glide 2.0',
  'Ping ChipR',
  // Mizuno
  'Mizuno T24',
  'Mizuno T22',
  'Mizuno T20',
  // Cobra
  'Cobra King Snakebite',
  'Cobra King Wedge',
  // Wilson
  'Wilson Harmonized',
  // Cleveland (older)
  'Cleveland 588 RTX',
  'Cleveland 588 RTX 2.0',
  // Other
  'Other',
];

// ── Loft options ──────────────────────────────────────────────────────────────
const LOFT_OPTIONS: number[] = [];
for (let l = 46; l <= 64; l += 2) LOFT_OPTIONS.push(l);
// also add common odd lofts
const ALL_LOFTS = Array.from(new Set([44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64])).sort((a, b) => a - b);

const EMPTY_FORM: WedgeInput = {
  club: '',
  loft: 50,
  fullSwing: 0,
  threeQuarter: 0,
  half: 0,
  quarter: 0,
};

export const TheBag: React.FC<TheBagProps> = ({ wedges, onAdd, onDelete, onStartCombine }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<WedgeInput>(EMPTY_FORM);
  const [customClub, setCustomClub] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = [...wedges].sort((a, b) => a.loft - b.loft);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setCustomClub(false);
    setError('');
  };

  const handleClubSelect = (val: string) => {
    if (val === 'Other') {
      setCustomClub(true);
      setForm((f) => ({ ...f, club: '' }));
    } else {
      setCustomClub(false);
      setForm((f) => ({ ...f, club: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clubName = form.club.trim();
    if (!clubName) { setError('Please select or enter a club name'); return; }
    setError('');
    setSaving(true);
    try {
      await onAdd({ ...form, club: clubName });
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save — please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this wedge from your bag?')) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">The Bag</h2>
          <p className="text-xs text-gray-400 mt-0.5">{sorted.length} wedge{sorted.length !== 1 ? 's' : ''}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); resetForm(); }}
            className="flex items-center gap-2 bg-[#4f6b35] active:bg-[#3d5429] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Add wedge
          </button>
        )}
      </div>

      {/* Add wedge form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">New wedge</h3>
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Club model dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Club model</label>
              {!customClub ? (
                <select
                  value={form.club || ''}
                  onChange={(e) => handleClubSelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4f6b35] text-gray-800 appearance-none"
                >
                  <option value="" disabled>Select a club…</option>
                  {CLUB_MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.club}
                    onChange={(e) => setForm((f) => ({ ...f, club: e.target.value }))}
                    placeholder="e.g. My custom wedge"
                    autoFocus
                    autoComplete="off"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4f6b35]"
                  />
                  <button
                    type="button"
                    onClick={() => { setCustomClub(false); setForm((f) => ({ ...f, club: '' })); }}
                    className="px-3 py-3 text-sm text-gray-400 bg-gray-100 active:bg-gray-200 rounded-xl"
                  >
                    ← List
                  </button>
                </div>
              )}
            </div>

            {/* Loft dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Loft</label>
              <select
                value={form.loft}
                onChange={(e) => setForm((f) => ({ ...f, loft: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4f6b35] text-gray-800 appearance-none"
              >
                {ALL_LOFTS.map((l) => (
                  <option key={l} value={l}>{l}°</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-gray-400">
              Leave yardages at 0 — fill them in during a Combine.
            </p>

            {/* Yardage fields — 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              {([
                ['fullSwing',    'Full (yds)'],
                ['threeQuarter', '¾ swing (yds)'],
                ['half',         '½ swing (yds)'],
                ['quarter',      '¼ swing (yds)'],
              ] as [keyof WedgeInput, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
                  <input
                    type="number"
                    value={(form as any)[key]}
                    min={0} max={200}
                    inputMode="numeric"
                    onChange={(e) => setForm((f) => ({ ...f, [key]: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4f6b35]"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#4f6b35] active:bg-[#3d5429] text-white py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save wedge'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="flex-1 bg-gray-100 active:bg-gray-200 text-gray-600 py-3.5 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Wedge list */}
      {sorted.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">No wedges yet. Tap Add wedge above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((wedge) => (
            <div key={wedge.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center px-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-gray-800">{wedge.club}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md shrink-0">{wedge.loft}°</span>
                  </div>
                  <div className="flex gap-3">
                    {([
                      ['Full', wedge.fullSwing],
                      ['¾', wedge.threeQuarter],
                      ['½', wedge.half],
                      ['¼', wedge.quarter],
                    ] as [string, number][]).map(([label, val]) => (
                      <span key={label} className="text-xs">
                        <span className="text-gray-400">{label} </span>
                        <span className={val > 0 ? 'font-semibold text-gray-700' : 'text-gray-300'}>
                          {val > 0 ? `${val}y` : '—'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <button
                    onClick={() => onStartCombine(wedge)}
                    className="flex items-center gap-1 text-sm font-semibold text-[#4f6b35] bg-[#4f6b35]/10 active:bg-[#4f6b35]/20 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    Combine
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(wedge.id)}
                    disabled={deletingId === wedge.id}
                    className="flex items-center justify-center w-10 h-10 text-gray-300 active:text-red-400 rounded-xl transition-colors"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
