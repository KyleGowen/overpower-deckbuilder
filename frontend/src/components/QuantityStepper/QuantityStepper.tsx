import { useRef, useState } from 'react';
import { IconMinus, IconPlus } from '../icons';
import './QuantityStepper.css';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  size = 'md',
  ariaLabel = 'Quantity',
}: QuantityStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const commitDraft = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === '') {
      onChange(min);
      return;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsed)) {
      return;
    }
    onChange(clamp(parsed));
  };

  const startEditing = () => {
    setDraft(String(value));
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const finishEditing = () => {
    if (editing) {
      commitDraft(draft);
      setEditing(false);
    }
  };

  return (
    <div className={`qty-stepper qty-stepper--${size}`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="qty-stepper__btn"
        onClick={() => {
          setEditing(false);
          onChange(clamp(value - 1));
        }}
        disabled={value <= min}
        aria-label="Decrease"
      >
        <IconMinus />
      </button>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className={`qty-stepper__input ${editing ? 'is-editing' : ''}`}
        value={editing ? draft : String(value)}
        onChange={(e) => {
          const next = e.target.value;
          if (next === '' || /^\d+$/.test(next)) {
            setDraft(next);
          }
        }}
        onFocus={startEditing}
        onBlur={finishEditing}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitDraft(draft);
            setEditing(false);
            inputRef.current?.blur();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setEditing(false);
            inputRef.current?.blur();
          }
        }}
        onClick={(e) => e.stopPropagation()}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        className="qty-stepper__btn"
        onClick={() => {
          setEditing(false);
          onChange(clamp(value + 1));
        }}
        disabled={value >= max}
        aria-label="Increase"
      >
        <IconPlus />
      </button>
    </div>
  );
}
