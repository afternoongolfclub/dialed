import React from 'react';
import { SwingLength } from '../types.ts';

interface ClockFaceProps {
  activeSwing: SwingLength;
}

// Clock positions for each swing length (angle from 12 o'clock, in degrees)
const SWING_POSITIONS: Record<SwingLength, { angle: number; label: string; clockLabel: string }> = {
  fullSwing:    { angle: 0,   label: 'Full',  clockLabel: '12:00' },
  threeQuarter: { angle: -90, label: '¾',     clockLabel: '9:00'  },
  half:         { angle: -135,label: '½',     clockLabel: '7:30'  },
  quarter:      { angle: -180,label: '¼',     clockLabel: '6:00'  },
};

const SWING_ORDER: SwingLength[] = ['fullSwing', 'threeQuarter', 'half', 'quarter'];

export const ClockFace: React.FC<ClockFaceProps> = ({ activeSwing }) => {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 70;
  const activeAngle = SWING_POSITIONS[activeSwing].angle;

  // Convert angle (0 = top, clockwise) to SVG coords
  const toXY = (angleDeg: number, r: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const handEnd = toXY(activeAngle, radius - 10);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={radius + 12} fill="#f5f5f0" stroke="#e5e7eb" strokeWidth="1.5" />

        {/* Tick marks for each swing position */}
        {SWING_ORDER.map((swing) => {
          const { angle, label } = SWING_POSITIONS[swing];
          const isActive = swing === activeSwing;
          const tickInner = toXY(angle, radius + 2);
          const tickOuter = toXY(angle, radius + 10);
          const labelPos = toXY(angle, radius + 22);
          return (
            <g key={swing}>
              <line
                x1={tickInner.x} y1={tickInner.y}
                x2={tickOuter.x} y2={tickOuter.y}
                stroke={isActive ? '#4f6b35' : '#d1d5db'}
                strokeWidth={isActive ? 2.5 : 1.5}
                strokeLinecap="round"
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight={isActive ? '700' : '400'}
                fill={isActive ? '#4f6b35' : '#9ca3af'}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Clock center dot */}
        <circle cx={cx} cy={cy} r={4} fill="#4f6b35" />

        {/* Clock hand */}
        <line
          x1={cx} y1={cy}
          x2={handEnd.x} y2={handEnd.y}
          stroke="#4f6b35"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Hand tip dot */}
        <circle cx={handEnd.x} cy={handEnd.y} r={5} fill="#e59d4b" />
      </svg>

      <div className="mt-1 text-center">
        <span className="text-sm font-semibold text-[#4f6b35]">
          {SWING_POSITIONS[activeSwing].clockLabel}
        </span>
        <span className="text-xs text-gray-400 ml-1">swing</span>
      </div>
    </div>
  );
};
