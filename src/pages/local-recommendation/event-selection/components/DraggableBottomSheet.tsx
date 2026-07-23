import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { Drawer } from 'vaul';

import { SHEET_SNAP_RATIOS } from '../bottomSheet';

interface DraggableBottomSheetProps {
  labelledBy: string;
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

const clampSnapIndex = (index: number) =>
  Math.max(0, Math.min(SHEET_SNAP_RATIOS.length - 1, index));

function DraggableBottomSheet({
  labelledBy,
  header,
  children,
  footer,
}: DraggableBottomSheetProps) {
  const [snap, setSnap] = useState<number | string | null>(
    SHEET_SNAP_RATIOS[0]
  );

  const snapIndex = Math.max(
    0,
    SHEET_SNAP_RATIOS.indexOf(
      Number(snap) as typeof SHEET_SNAP_RATIOS[number]
    )
  );

  const moveToSnap = (index: number) => {
    setSnap(SHEET_SNAP_RATIOS[clampSnapIndex(index)]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const nextIndex = {
      ArrowUp: snapIndex + 1,
      ArrowDown: snapIndex - 1,
      Home: 0,
      End: SHEET_SNAP_RATIOS.length - 1,
    }[event.key];

    if (nextIndex === undefined) return;

    event.preventDefault();
    moveToSnap(nextIndex);
  };

  const percentage = Math.round(SHEET_SNAP_RATIOS[snapIndex] * 100);

  return (
    <Drawer.Root
      open
      modal={false}
      dismissible={false}
      autoFocus={false}
      disablePreventScroll
      noBodyStyles
      scrollLockTimeout={0}
      snapPoints={[...SHEET_SNAP_RATIOS]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <Drawer.Portal>
        <Drawer.Content
          aria-labelledby={labelledBy}
          data-snap-index={snapIndex}
          className="bg-background fixed inset-x-0 bottom-0 z-40 mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden rounded-t-[22px] shadow-[0_-2px_12px_rgba(28,28,28,0.02)] outline-none"
        >
          <div className="flex h-[calc(100dvh-var(--snap-point-height,70dvh))] min-h-0 flex-col">
            <Drawer.Handle
              role="slider"
              tabIndex={0}
              aria-orientation="vertical"
              aria-label={`행사 패널 높이 조절, 현재 ${percentage}%`}
              aria-valuemin={Math.round(SHEET_SNAP_RATIOS[0] * 100)}
              aria-valuemax={Math.round(SHEET_SNAP_RATIOS.at(-1)! * 100)}
              aria-valuenow={percentage}
              aria-hidden={false}
              onKeyDown={handleKeyDown}
              className="!my-3 !h-1 !w-8 !bg-black !opacity-100 focus-visible:outline focus-visible:outline-2"
            />

            <div className="shrink-0 px-6 pb-3">{header}</div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
              {children}
            </div>

            <div className="shrink-0 px-6 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]">
              {footer}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default DraggableBottomSheet;
