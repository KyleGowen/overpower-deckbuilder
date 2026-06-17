interface KoToggleButtonProps {
  active: boolean;
  onToggle: () => void;
  cardName: string;
}

export function KoToggleButton({ active, onToggle, cardName }: KoToggleButtonProps) {
  const label = active ? 'Un-KO character' : 'KO character';
  return (
    <button
      type="button"
      className={`deck-editor__ko-btn${active ? ' is-active' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={active}
      aria-label={`${label}: ${cardName}`}
      title={label}
    >
      KO
    </button>
  );
}
