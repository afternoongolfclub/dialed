import React, { useState, useRef, useEffect } from 'react';
import { Wedge, SwingLength, SWING_LABELS, SWING_CLOCK, CombineSession } from '../types.ts';
import { ClockFace } from './ClockFace.tsx';
import { Plus, X, CheckCircle, ArrowLeft, ChevronLeft } from 'lucide-react';

interface CombineProps {
  wedge: Wedge;
  onComplete: (session: CombineSession) => Promise<void>;
  onBack: () => void;
}

const SWING_ORDER: SwingLength[] = ['fullSwing', 'threeQuarter', 'half', 'quarter'];

const computeAverage = (shots: number[]): number => {
  if (shots.length === 0) return 0;
  const sorted = [...shots].sort((a, b) => a - b);
  const trimmed = sorted.length >= 5 ? sorted.slice(1, -1) : sorted;
  return Math.round(trimmed.reduce((sum, s) => sum + s, 0) / trimmed.length);
};

const SHOT_COUNT_OPTIONS = [3, 5, 7, 10];

export const Combine: React.FC<CombineProps> = ({ wedge, onComplete, onBack }) => {
  const [targetShots, setTargetShots] = useState<number | null>(null);
  const [step, setStep] = useState<SwingLength>('fullSwing');
  const [stepIdx, setStepIdx] = useState(0);
  const [shotsBySwing, setShotsBySwing] = useState<Record<SwingLength, number[]>>({
    fullSwing: [], threeQuarter: [], half: [], quarter: [],
  });
  const [currentEntry, setCurrentEntry] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [finalAverages, setFinalAverages] = useState<Partial<Record<SwingLength, number>>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-focus input on step change
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [step]);

  const currentShots = shotsBySwing[step];
  const parsedEntry = parseInt(currentEntry);
  const entryValid = !isNaN(parsedEntry) && parsedEntry > 0 && parsedEntry <= 200;

  const addShot = () => {
    if (!entryValid) return;
    const newShots = [...shotsBySwing[step], parsedEntry];
    setShotsBySwing((prev) => ({ ...prev, [step]: newShots }));
    setCurrentEntry('');
    // Auto-advance when target reached
    if (targetShots !== null && newShots.length >= targetShots) {
      setTimeout(() => moveToNextWithShots({ ...shotsBySwing, [step]: newShots }), 320);
    } else {
      inputRef.current?.focus();
    }
  };

  const removeShot = (idx: number) => {
    setShotsBySwing((prev) => ({ ...prev, [step]: prev[step].filter((_, i) => i !== idx) }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addShot(); }
  };

  const moveToNextWithShots = (shots: Record<SwingLength, number[]>) => {
    if (stepIdx < SWING_ORDER.length - 1) {
      const nextIdx = stepIdx + 1;
      setStep(SWING_ORDER[nextIdx]);
      setStepIdx(nextIdx);
      setCurrentEntry('');
    } else {
      const avgs: Partial<Record<SwingLength, number>> = {};
      for (const s of SWING_ORDER) avgs[s] = computeAverage(shots[s]);
      setFinalAverages(avgs);
      setDone(true);
    }
  };

  const moveToNext = () => moveToNextWithShots(shotsBySwing);

  const moveToPrev = () => {
    if (stepIdx > 0) {
      const prevIdx = stepIdx - 1;
      setStep(SWING_ORDER[prevIdx]);
      setStepIdx(prevIdx);
      setCurrentEntry('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onComplete({
        wedgeId: wedge.id,
        shots: SWING_ORDER.flatMap((s) => shotsBySwing[s].map((d) => ({ swingLength: s, distance: d }))),
        averages: finalAverages,
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Results screen ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="px-4 py-5">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-400 active:text-gray-600 mb-5 py-1">
          <ArrowLeft size={16} /> Back to bag
        </button>

        <div className="text-center mb-6">
          <CheckCircle size={44} className="text-[#4f6b35] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800">Combine complete!</h2>
          <p className="text-sm text-gray-400 mt-1">{wedge.club} · {wedge.loft}°</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="bg-[#4f6b35] px-4 py-3">
            <span className="text-white font-semibold">Averages</span>
          </div>
          <div className="grid grid-cols-4 divide-x divide-gray-100">
            {SWING_ORDER.map((s) => (
              <div key={s} className="flex flex-col items-center py-5">
                <span className="text-[11px] text-gray-400 mb-1">{SWING_CLOCK[s]}</span>
                <span className="text-gray-800 font-bold text-2xl leading-tight">{finalAverages[s] ?? '—'}</span>
                <span className="text-[11px] text-[#4f6b35] font-semibold mt-1">{SWING_LABELS[s]}</span>
                <span className="text-[10px] text-gray-300 mt-0.5">{shotsBySwing[s].length} shots</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#4f6b35] active:bg-[#3d5429] text-white py-4 rounded-xl font-semibold text-base transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save to matrix'}
        </button>
      </div>
    );
  }

  // ── Setup screen ───────────────────────────────────────────────────────────
  if (targetShots === null) {
    return (
      <div className="px-4 py-5">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-400 active:text-gray-600 mb-5 py-1">
          <ArrowLeft size={16} /> Back to bag
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Combine</h2>
          <p className="text-sm text-gray-500 mt-0.5">{wedge.club} · {wedge.loft}°</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">Shots per swing</p>
          <p className="text-xs text-gray-400 mb-4">How many shots do you want to hit for each swing length?</p>
          <div className="grid grid-cols-4 gap-2">
            {SHOT_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setTargetShots(n)}
                className="flex flex-col items-center justify-center bg-gray-50 active:bg-[#4f6b35] active:text-white border-2 border-gray-100 active:border-[#4f6b35] rounded-2xl py-5 transition-colors group"
              >
                <span className="text-3xl font-bold text-gray-800 group-active:text-white">{n}</span>
                <span className="text-[11px] text-gray-400 group-active:text-white mt-1">shots</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-300">
          You'll hit {SHOT_COUNT_OPTIONS[0]}–{SHOT_COUNT_OPTIONS[SHOT_COUNT_OPTIONS.length - 1]} shots for each of the 4 swing lengths · {SWING_LABELS['fullSwing']}, {SWING_LABELS['threeQuarter']}, {SWING_LABELS['half']}, {SWING_LABELS['quarter']}
        </p>
      </div>
    );
  }

  // ── Active combine ─────────────────────────────────────────────────────────
  const avg = computeAverage(currentShots);

  return (
    <div className="flex flex-col px-4 py-5 min-h-0">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-400 active:text-gray-600 mb-4 py-1 self-start">
        <ArrowLeft size={16} /> Back to bag
      </button>

      {/* Club + progress */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Combine</h2>
            <p className="text-sm text-gray-500">{wedge.club} · {wedge.loft}°</p>
          </div>
          <span className="text-sm text-gray-400">{stepIdx + 1} / {SWING_ORDER.length}</span>
        </div>
        {/* Progress bar */}
        <div className="flex gap-1.5">
          {SWING_ORDER.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${
              i < stepIdx ? 'bg-[#4f6b35]' : i === stepIdx ? 'bg-[#e59d4b]' : 'bg-gray-200'
            }`} />
          ))}
        </div>
      </div>

      {/* Clock + swing label */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
        <div className="flex items-center gap-4">
          <ClockFace activeSwing={step} />
          <div className="flex-1">
            <p className="text-2xl font-bold text-gray-800">{SWING_LABELS[step]} swing</p>
            <p className="text-sm text-gray-400">{SWING_CLOCK[step]}</p>
            <p className="text-xs text-gray-400 mt-1">Enter each shot distance in yards</p>
          </div>
        </div>
      </div>

      {/* Shot entry — big number input */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
        <div className="flex gap-2 mb-3">
          <input
            ref={inputRef}
            type="number"
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0"
            min={1} max={200}
            inputMode="numeric"
            pattern="[0-9]*"
            className="flex-1 px-4 py-4 border-2 border-gray-200 rounded-xl text-3xl text-center font-bold focus:outline-none focus:border-[#4f6b35] bg-gray-50 transition-colors"
          />
          <button
            onClick={addShot}
            disabled={!entryValid}
            className="bg-[#4f6b35] active:bg-[#3d5429] text-white w-16 rounded-xl flex items-center justify-center disabled:opacity-30 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Shot progress pips */}
        <div className="flex gap-1.5 mb-3">
          {Array.from({ length: targetShots }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i < currentShots.length ? 'bg-[#4f6b35]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Shot chips */}
        {currentShots.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {currentShots.map((shot, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-[#4f6b35]/10 text-[#4f6b35] pl-3 pr-2 py-1.5 rounded-full text-sm font-semibold">
                  {shot}y
                  <button
                    onClick={() => removeShot(idx)}
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#4f6b35]/20 active:bg-red-100 active:text-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-[#4f6b35]/5 rounded-xl px-4 py-2.5 text-center">
              <span className="text-xs text-gray-400">Average · </span>
              <span className="text-[#4f6b35] font-bold text-lg">{avg} yds</span>
              <span className="text-xs text-gray-400 ml-1">({currentShots.length} / {targetShots})</span>
            </div>
          </>
        ) : (
          <p className="text-center text-xs text-gray-300 py-2">No shots yet — type a distance and tap +</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        {stepIdx > 0 && (
          <button
            onClick={moveToPrev}
            className="flex items-center gap-1.5 bg-gray-100 active:bg-gray-200 text-gray-600 px-4 py-4 rounded-xl font-medium transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <button
          onClick={moveToNext}
          disabled={currentShots.length === 0}
          className="flex-1 bg-[#e59d4b] active:bg-[#d08d3a] text-white py-4 rounded-xl font-bold text-base transition-colors disabled:opacity-30"
        >
          {currentShots.length < targetShots
            ? `${targetShots - currentShots.length} more shot${targetShots - currentShots.length !== 1 ? 's' : ''} · skip →`
            : stepIdx === SWING_ORDER.length - 1
              ? 'Finish combine ✓'
              : `Next: ${SWING_LABELS[SWING_ORDER[stepIdx + 1]]} →`}
        </button>
      </div>
    </div>
  );
};
