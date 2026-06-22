import { useState } from 'react';
import { IconEye, IconEyeOff } from '../icons';
import './PasswordInput.css';

export interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
}

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete = 'new-password',
  placeholder = 'Enter password',
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="password-input" htmlFor={id}>
      <span className="password-input__label">{label}</span>
      <div className="password-input__wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="password-input__eye"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
    </label>
  );
}
