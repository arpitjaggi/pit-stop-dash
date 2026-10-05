import { Plus } from '@/ui/icons';

/** The one floating primary action: bottom right, within reach of a thumb. */
export function DockedAdd({ onClick, label = 'Add' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="docked-add" onClick={onClick}>
      <Plus size={20} weight="bold" aria-hidden />
      <span>{label}</span>
    </button>
  );
}
