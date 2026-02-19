import React, { useState } from 'react';
import { Wedge, WedgeInput } from '../types.ts';
import { Plus, Trash2, ChevronRight } from 'lucide-react';

interface TheBagProps {
  wedges: Wedge[];
  onAdd: (w: WedgeInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onStartCombine: (wedge: Wedge) => void;
}

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = [...wedges].sort((a, b) => a.loft - b.loft);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.club.trim()) { setError('Club name is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onAdd(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save');
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
            onClick={() => { setShowForm(true); setError(''); }}
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
            {/* Club name — full width */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Club name</label>
              <input
                type="text"
                value={form.club}
                onChange={(e) => setForm({ ...form, club: e.target.value })}
                placeholder="e.g. Cleveland RTX6"
                autoComplete="off"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4f6b35]"
              />
            </div>

            {/* Loft */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Loft (degrees)</label>
              <input
                type="number"
                value={form.loft}
                min={40} max={70} step={0.5}
                inputMode="decimal"
                onChange={(e) => setForm({ ...form, loft: parseFloat(e.target.value) || 50 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4f6b35]"
              />
            </div>

            <p className="text-xs text-gray-400 -mt-1">
              Leave yardages at 0 and fill them in during a Combine.
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
                    onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) || 0 })}
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
                onClick={() => { setShowForm(false); setError(''); setForm(EMPTY_FORM); }}
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
                {/* Club info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-gray-800">{wedge.club}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md shrink-0">{wedge.loft}°</span>
                  </div>
                  {/* Yardage summary — compact */}
                  <div className="flex gap-3">
                    {([
                      ['Full', wedge.fullSwing],
                      ['¾', wedge.threeQuarter],
                      ['½', wedge.half],
                      ['¼', wedge.quarter],
                    ] as [string, number][]).map(([label, val]) => (
                      <span key={label} className="text-xs text-gray-500">
                        <span className="text-gray-400">{label} </span>
                        <span className={val > 0 ? 'font-semibold text-gray-700' : 'text-gray-300'}>
                          {val > 0 ? `${val}y` : '—'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons — large tap targets */}
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
