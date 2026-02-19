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
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">The Bag</h2>
          <p className="text-xs text-gray-400 mt-0.5">{sorted.length} wedge{sorted.length !== 1 ? 's' : ''}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setError(''); }}
            className="flex items-center gap-1.5 bg-[#4f6b35] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#3d5429] transition-colors"
          >
            <Plus size={16} />
            Add wedge
          </button>
        )}
      </div>

      {/* Add wedge form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">New wedge</h3>
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Club name</label>
                <input
                  type="text"
                  value={form.club}
                  onChange={(e) => setForm({ ...form, club: e.target.value })}
                  placeholder="e.g. Cleveland RTX6"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6b35]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Loft (°)</label>
                <input
                  type="number"
                  value={form.loft}
                  min={40} max={70} step={0.5}
                  onChange={(e) => setForm({ ...form, loft: parseFloat(e.target.value) || 50 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6b35]"
                />
              </div>
            </div>

            <p className="text-xs text-gray-400">
              You can leave yardages at 0 and fill them in during a Combine.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {([
                ['fullSwing', 'Full swing (yds)'],
                ['threeQuarter', '¾ swing (yds)'],
                ['half', '½ swing (yds)'],
                ['quarter', '¼ swing (yds)'],
              ] as [keyof WedgeInput, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type="number"
                    value={(form as any)[key]}
                    min={0} max={200}
                    onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6b35]"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#4f6b35] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3d5429] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save wedge'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(''); setForm(EMPTY_FORM); }}
                className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
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
          <p className="text-gray-400 text-sm">No wedges yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((wedge) => (
            <div key={wedge.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center px-4 py-3.5">
                {/* Club info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">{wedge.club}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">{wedge.loft}°</span>
                  </div>
                  <div className="flex gap-3 mt-1.5">
                    {([
                      ['Full', wedge.fullSwing],
                      ['¾', wedge.threeQuarter],
                      ['½', wedge.half],
                      ['¼', wedge.quarter],
                    ] as [string, number][]).map(([label, val]) => (
                      <span key={label} className="text-xs text-gray-500">
                        <span className="text-gray-400">{label}: </span>
                        <span className={val > 0 ? 'font-medium text-gray-700' : 'text-gray-300'}>
                          {val > 0 ? `${val}y` : '—'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => onStartCombine(wedge)}
                    title="Run a combine for this wedge"
                    className="flex items-center gap-1 text-xs font-medium text-[#4f6b35] bg-[#4f6b35]/10 hover:bg-[#4f6b35]/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Combine
                    <ChevronRight size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(wedge.id)}
                    disabled={deletingId === wedge.id}
                    title="Remove from bag"
                    className="p-2 text-gray-300 hover:text-red-400 transition-colors rounded-lg"
                  >
                    <Trash2 size={15} />
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
