import { useCallback, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Sheet, type SheetRef } from 'react-modal-sheet';

import type { FestivalItem } from '../types';
import SelectedFestivalList from './SelectedFestivalList';

const EXPANDED_SNAP_POINT = 0.82;
const MINIMUM_SNAP_POINT = 0.36;
const SHEET_SNAP_POINTS = [EXPANDED_SNAP_POINT, MINIMUM_SNAP_POINT];
const MINIMUM_SNAP_INDEX = SHEET_SNAP_POINTS.length - 1;

interface SelectedEventSheetProps {
  selectedEvents: readonly FestivalItem[];
  onRemoveAll: () => void;
  onRemove: (festival: FestivalItem) => void;
  onSubmit?: () => void;
}

function SelectedEventSheet({
  selectedEvents,
  onRemoveAll,
  onRemove,
  onSubmit,
}: SelectedEventSheetProps) {
  const sheetRef = useRef<SheetRef>(null);
  const fallbackSheetY = useMotionValue(0);
  const [sheetY, setSheetY] = useState(fallbackSheetY);
  const footerY = useTransform(sheetY, (value) => -value);
  const hasSelectedEvents = selectedEvents.length > 0;

  const setSheetReference = useCallback(
    (nextSheet: SheetRef | null) => {
      sheetRef.current = nextSheet;
      setSheetY(nextSheet?.y ?? fallbackSheetY);
    },
    [fallbackSheetY]
  );

  const restoreMinimumSnapPoint = () => {
    sheetRef.current?.snapTo(MINIMUM_SNAP_INDEX);
  };

  return (
    <Sheet
      ref={setSheetReference}
      isOpen
      onClose={restoreMinimumSnapPoint}
      snapPoints={SHEET_SNAP_POINTS}
      initialSnap={MINIMUM_SNAP_INDEX}
      disableScrollLocking
      dragVelocityThreshold={Number.POSITIVE_INFINITY}
    >
      <Sheet.Container
        aria-labelledby="selected-festivals-title"
        style={{ left: '50%', x: '-50%' }}
        className="!bg-background mx-auto w-full max-w-[430px] overflow-hidden !rounded-3xl !shadow-[0_-2px_12px_rgba(28,28,28,0.02)]"
      >
        <Sheet.Header className="shrink-0">
          <div
            className="flex h-10 items-center justify-center"
            aria-hidden="true"
          >
            <span className="h-1 w-8 rounded-full bg-black" />
          </div>
        </Sheet.Header>

        <div className="flex shrink-0 items-center justify-between px-6 pb-3">
          <h2
            id="selected-festivals-title"
            className="text-base font-semibold text-black"
          >
            추가된 행사
          </h2>
          <button
            type="button"
            disabled={!hasSelectedEvents}
            onClick={onRemoveAll}
            className="text-main-5 text-xs font-medium disabled:cursor-default disabled:opacity-40"
          >
            전체 삭제
          </button>
        </div>

        <Sheet.Content className="min-h-0 px-6">
          <Sheet.Scroller
            draggableAt="top"
            autoPadding={false}
            className="min-h-0 overscroll-contain"
          >
            <SelectedFestivalList
              festivals={selectedEvents}
              onRemove={onRemove}
            />
          </Sheet.Scroller>
        </Sheet.Content>

        <motion.div
          style={{ y: footerY }}
          className="shrink-0 px-6 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
            disabled={!hasSelectedEvents}
            onClick={onSubmit}
            className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 h-[53px] w-full rounded-xl text-lg font-semibold"
          >
            행사 등록하기
          </button>
        </motion.div>
      </Sheet.Container>
    </Sheet>
  );
}

export default SelectedEventSheet;
