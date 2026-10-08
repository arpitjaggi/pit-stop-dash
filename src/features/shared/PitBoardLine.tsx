import type { PitBoard } from '@/lib/status';
import { StatusLine } from '@/ui/atoms';

/** The Pit Board sentence: what you need to know about this vehicle right now. */
export function PitBoardLine({ board, className }: { board: PitBoard; className?: string }) {
  return (
    <StatusLine severity={board.severity} className={className}>
      {board.sentence}
      {board.more > 0 && <span className="status__more"> +{board.more} more</span>}
    </StatusLine>
  );
}
