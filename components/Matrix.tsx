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
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <Target size={48} className="text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-600 mb-2">No wedges yet</h2>
        <p className="text-sm text-gray-400 mb-6">
          Add your wedges in The Bag, then run a Combine to fill in your distances.
        </p>
        <button
          onClick={onGoToBag}
          className="bg-[#4f6b35] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#3d5429] transition-colors"
        >
          Set up your bag
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">Yardage Matrix</h2>
        <p className="text-xs text-gray-400 mt-0.5">All distances in yards</p>
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-[#4f6b35]">
              <th className="text-left text-white text-sm font-semibold px-5 py-3 rounded-tl-2xl">
                Club
              </th>
              <th className="text-center text-white text-xs font-medium px-2 py-3 w-10">
                Loft
              </th>
              {SWING_KEYS.map((s) => (
                <th key={s} className="text-center text-white text-sm font-semibold px-4 py-3 last:rounded-tr-2xl">
                  <div>{SWING_LABELS[s]}</div>
                  <div className="text-xs font-normal opacity-70">{SWING_CLOCK[s]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((wedge, idx) => (
              <tr
                key={wedge.id}
                className={`border-t border-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
              >
                <td className="px-5 py-3.5 font-medium text-gray-800 text-sm">{wedge.club}</td>
                <td className="px-2 py-3.5 text-center text-xs text-gray-400">{wedge.loft}°</td>
                {SWING_KEYS.map((s) => {
                  const val = wedge[s];
                  return (
                    <td key={s} className="px-4 py-3.5 text-center">
                      {val > 0 ? (
                        <span className="text-gray-800 font-semibold text-sm">{val}</span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden space-y-3">
        {sorted.map((wedge) => (
          <div key={wedge.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Club header */}
            <div className="bg-[#4f6b35] px-4 py-2.5 flex items-center justify-between">
              <span className="text-white font-semibold text-sm">{wedge.club}</span>
              <span className="text-white/70 text-xs">{wedge.loft}° loft</span>
            </div>
            {/* Distance grid */}
            <div className="grid grid-cols-4 divide-x divide-gray-50">
              {SWING_KEYS.map((s) => {
                const val = wedge[s];
                return (
                  <div key={s} className="flex flex-col items-center py-3">
                    <span className="text-[10px] text-gray-400 mb-1">{SWING_CLOCK[s]}</span>
                    {val > 0 ? (
                      <span className="text-gray-800 font-bold text-base">{val}</span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                    <span className="text-[10px] text-[#4f6b35] font-medium mt-0.5">{SWING_LABELS[s]}</span>
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
