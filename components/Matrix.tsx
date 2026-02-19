import React from 'react';
import { Wedge, SwingLength, SWING_LABELS, SWING_CLOCK } from '../types.ts';
import { Target } from 'lucide-react';

interface MatrixProps {
  wedges: Wedge[];
  onGoToBag: () => void;
}

const SWING_KEYS: SwingLength[] = ['fullSwing', 'threeQuarter', 'half', 'quarter'];

export const Matrix: React.FC<MatrixProps> = ({ wedges, onGoToBag }) => {
  const sorted = [...wedges].sort((a, b) => a.loft - b.loft);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <Target size={52} className="text-gray-200 mb-4" />
        <h2 className="text-lg font-semibold text-gray-600 mb-2">No wedges yet</h2>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Add your wedges in The Bag, then run a Combine to fill in your distances.
        </p>
        <button
          onClick={onGoToBag}
          className="bg-[#4f6b35] active:bg-[#3d5429] text-white px-6 py-3.5 rounded-xl font-semibold text-base transition-colors"
        >
          Set up your bag
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Yardage Matrix</h2>
        <p className="text-xs text-gray-400 mt-0.5">All distances in yards</p>
      </div>

      {/* Mobile-first card layout — always shown */}
      <div className="space-y-3">
        {sorted.map((wedge) => (
          <div key={wedge.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Club header */}
            <div className="bg-[#4f6b35] px-4 py-3 flex items-center justify-between">
              <span className="text-white font-semibold text-base">{wedge.club}</span>
              <span className="text-white/70 text-sm font-medium">{wedge.loft}° loft</span>
            </div>
            {/* Distance grid — 4 equal columns */}
            <div className="grid grid-cols-4 divide-x divide-gray-100">
              {SWING_KEYS.map((s) => {
                const val = wedge[s];
                return (
                  <div key={s} className="flex flex-col items-center py-4 px-1">
                    <span className="text-[11px] text-gray-400 mb-1 font-medium">{SWING_CLOCK[s]}</span>
                    {val > 0 ? (
                      <span className="text-gray-800 font-bold text-xl leading-tight">{val}</span>
                    ) : (
                      <span className="text-gray-300 text-lg font-light">—</span>
                    )}
                    <span className="text-[11px] text-[#4f6b35] font-semibold mt-1">{SWING_LABELS[s]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
