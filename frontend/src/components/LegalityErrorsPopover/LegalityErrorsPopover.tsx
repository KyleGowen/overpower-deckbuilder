import { useId, useState, type ReactNode } from 'react';
import './LegalityErrorsPopover.css';

export interface LegalityErrorsPopoverProps {
  errors: string[];
  /** When true, show a persistent list under the badge (no hover tooltip). */
  inline?: boolean;
  children: ReactNode;
}

export function LegalityErrorsPopover({ errors, inline = false, children }: LegalityErrorsPopoverProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);

  if (errors.length === 0) {
    return <>{children}</>;
  }

  const list = (
    <ul id={listId} className="legality-errors-popover__list">
      {errors.map((error, index) => (
        <li key={`${index}-${error}`}>{error}</li>
      ))}
    </ul>
  );

  if (inline) {
    return (
      <div className="legality-errors-popover legality-errors-popover--inline">
        {children}
        <div className="legality-errors-popover__inline-panel" role="note" aria-label="Deck validation errors">
          {list}
        </div>
      </div>
    );
  }

  return (
    <span
      className={['legality-errors-popover', open ? 'legality-errors-popover--open' : ''].filter(Boolean).join(' ')}
      tabIndex={0}
      aria-describedby={listId}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      {children}
      <div className="legality-errors-popover__panel" role="tooltip">
        {list}
      </div>
    </span>
  );
}
