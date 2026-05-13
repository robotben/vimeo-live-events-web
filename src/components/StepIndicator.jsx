import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Token' },
  { label: 'Destinations' },
  { label: 'CSV' },
  { label: 'Results' },
];

export default function StepIndicator({ current }) {
  return (
    <div className="step-indicator">
      {STEPS.map((s, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={num} className={`step-item${done ? ' done' : ''}${active ? ' active' : ''}`}>
            <div className="step-circle">
              {done ? <Check size={14} strokeWidth={3} /> : num}
            </div>
            <span className="step-label">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
