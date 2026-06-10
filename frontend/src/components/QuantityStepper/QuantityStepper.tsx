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
  return (
    <div className={`qty-stepper qty-stepper--${size}`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="qty-stepper__btn"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Decrease"
      >
        <IconMinus />
      </button>
      <span className="qty-stepper__value" aria-label={ariaLabel}>{value}</span>
      <button
        type="button"
        className="qty-stepper__btn"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Increase"
      >
        <IconPlus />
      </button>
    </div>
  );
}
