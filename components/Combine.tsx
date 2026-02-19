import React, { useState } from 'react';
import { Wedge, SwingLength, SWING_LABELS, SWING_CLOCK, CombineSession } from '../types.ts';
import { ClockFace } from './ClockFace.tsx';
import { Plus, Minus, CheckCircle, ArrowLeft, RotateCcw } from 'lucide-react';

interface CombineProps {
  wedge: Wedge;
  onComplete: (session: CombineSession) => Promise<void>;
  onBack: () => void;
}

const SWING_ORDER: SwingLength[] = ['fullSwing', 'threeQuarter', 'half', 'quarter'];

const computeAverage = (shots: number[]): number => {
  if (shots.length === 0) return 0;
  const sorted = [...shots].sort((a, b) => a - b);
  // Drop high/low if 5+ shots
  const trimmed = sorted.length >= 5 ? sorted.slice(1, -1) : sorted;
  return Math.round(trimmed.reduce((sum, s) => sum + s, 0) / trimmed.length);
};

export const Combine: React.FC<CombineProps> = ({ wedge, onComplete, onBack }) => {
  const [step, setStep] = useState<SwingLength>('fullSwing');
  const [stepIdx, setStepIdx] = useState(0);
  const [shotsBySwing, setShotsBySwing] = useState<Record<SwingLength, number[]>>({
    fullSwing: [], threeQuarter: [], half: [], quarter: [],
  });
  const [currentEntry, setCurrentEntry] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [finalAverages, setFinalAverages] = useState<Partial<Record<SwingLength, number>>>({});

  const currentShots = shotsBySwing[step];
  const parsedEntry = parseInt(currentEntry);
  const entryValid = !isNaN(parsedEntry) && parsedEntry > 0 && parsedEntry <= 200;

  const addShot = () => {
    if (!entryValid) return;
    setShotsBySwing((prev) => ({
      ...prev,
      [step]: [...prev[step], parsedEntry],
    }));
    setCurrentEntry('');
  };

  const removeShot = (idx: number) => {
    setShotsBySwing((prev) => ({
      ...prev,
      [step]: prev[step].filter((_, i) => i !== idx),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addShot();
  };

  const moveToNext = () => {
    if (stepIdx < SWING_ORDER.length - 1) {
      const nextIdx = stepIdx + 1;
      setStep(SWING_ORDER[nextIdx]);
      setStepIdx(nextIdx);
      setCurrentEntry('');
    } else {
      // Calculate averages and finish
      const avgs: Partial<Record<SwingLength, number>> = {};
      for (const s of SWING_ORDER) {
        avgs[s] = computeAverage(shotsBySwing[s]);
      }
      setFinalAverages(avgs);
      setDone(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onComplete({
        wedgeId: wedge.id,
        shots: SWING_ORDER.flatMap((s) =>
          shotsBySwing[s].map((d) => ({ swingLength: s, distance: d }))
        ),
        averages: finalAverages,
      });
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="px-4 py-6">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5">
          <ArrowLeft size={16} /> Back to bag
        </button>

        <div className="text-center mb-6">
          <CheckCircle size={40} className="text-[#4f6b35] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800">Combine complete!</h2>
          <p className="text-sm text-gray-400 mt-1">{wedge.club} · {wedge.loft}°</p>
        </div>

        {/* Results summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="bg-[#4f6b35] px-4 py-2.5">
            <span className="text-white font-semibold text-sm">Averages</span>
          </div>
          <div className="grid grid-cols-4 divide-x divide-gray-50">
            {SWING_ORDER.map((s) => (
              <div key={s} className="flex flex-col items-center py-4">
                <span className="text-[10px] text-gray-400 mb-1">{SWING_CLOCK[s]}</span>
                <span className="text-gray-800 font-bold text-lg">{finalAverages[s] ?? '—'}</span>
                <span className="text-[10px] text-[#4f6b35] font-medium mt-0.5">{SWING_LABELS[s]}</span>
                <span className="text-[10px] text-gray-300">
                  ({shotsBySwing[s].length} shots)
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#4f6b35] text-white py-3 rounded-xl font-semibold hover:bg-[#3d5429] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save to matrix'}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5">
        <ArrowLeft size={16} /> Back to bag
      </button>

      {/* Club info */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">Combine</h2>
        <p className="text-sm text-gray-500 mt-0.5">{wedge.club} · {wedge.loft}°</p>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {SWING_ORDER.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < stepIdx ? 'bg-[#4f6b35]' : i === stepIdx ? 'bg-[#e59d4b]' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Current swing */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <div className="flex flex-col items-center mb-4">
          <ClockFace activeSwing={step} />
          <h3 className="text-lg font-bold text-gray-800 mt-3">
            {SWING_LABELS[step]} swing
          </h3>
          <p className="text-xs text-gray-400">Enter each shot distance in yards</p>
        </div>

        {/* Shot entry */}
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Yards"
            min={1} max={200}
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#4f6b35]"
            autoFocus
          />
          <button
            onClick={addShot}
            disabled={!entryValid}
            className="bg-[#4f6b35] text-white px-4 py-2.5 rounded-xl hover:bg-[#3d5429] transition-colors disabled:opacity-40"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Shot list */}
        {currentShots.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {currentShots.map((shot, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-[#4f6b35]/10 text-[#4f6b35] px-3 py-1 rounded-full text-sm font-medium"
              >
                {shot}y
                <button onClick={() => removeShot(idx)} className="hover:text-red-500 transition-colors">
                  <Minus size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {currentShots.length > 0 && (
          <div className="bg-gray-50 rounded-xl px-4 py-2.5 text-center mt-3">
            <span className="text-xs text-gray-400">Current average: </span>
            <span className="text-[#4f6b35] font-bold text-base">
              {computeAverage(currentShots)} yds
            </span>
            <span className="text-xs text-gray-400 ml-1">({currentShots.length} shots)</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        {stepIdx > 0 && (
          <button
            onClick={() => { setStepIdx(stepIdx - 1); setStep(SWING_ORDER[stepIdx - 1]); setCurrentEntry(''); }}
            className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <RotateCcw size={14} /> Back
          </button>
        )}
        <button
          onClick={moveToNext}
          disabled={currentShots.length === 0}
          className="flex-1 bg-[#e59d4b] text-white py-3 rounded-xl font-semibold hover:bg-[#d08d3a] transition-colors disabled:opacity-40"
        >
          {stepIdx === SWING_ORDER.length - 1 ? 'Finish combine' : `Next: ${SWING_LABELS[SWING_ORDER[stepIdx + 1]]} swing →`}
        </button>
      </div>
    </div>
  );
};
