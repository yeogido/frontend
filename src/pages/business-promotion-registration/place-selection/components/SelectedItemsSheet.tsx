import { useCallback, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Sheet, type SheetRef } from 'react-modal-sheet';

import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';

const EXPANDED_SNAP_POINT = 0.82;
const MINIMUM_SNAP_POINT = 0.36;
const SHEET_SNAP_POINTS = [EXPANDED_SNAP_POINT, MINIMUM_SNAP_POINT];
const MINIMUM_SNAP_INDEX = SHEET_SNAP_POINTS.length - 1;

// Figma 390 디자인 기준 리터럴 px
const HANDLE_AREA_HEIGHT = 40;
const HANDLE_HEIGHT = 4;
const HANDLE_WIDTH = 32;
const SHEET_PADDING_X = 24;
const HEADER_PADDING_BOTTOM = 12;
const HEADER_TITLE_FONT_SIZE = 16;
const REMOVE_ALL_FONT_SIZE = 12;
const EMPTY_MESSAGE_PADDING_Y = 32;
const EMPTY_MESSAGE_FONT_SIZE = 16;
const LIST_GAP = 16;
const LIST_PADDING_Y = 16;
const FOOTER_PADDING_TOP = 12;
const FOOTER_PADDING_BOTTOM = 32;
const SUBMIT_BUTTON_HEIGHT = 53;
const SUBMIT_BUTTON_FONT_SIZE = 18;
const SHEET_RADIUS = 24;

interface SelectedItemsSheetProps<T> {
  selectedSectionTitle: string;
  emptyMessage: string;
  submitButtonLabel: string;
  selectedItems: readonly T[];
  isSubmitDisabled: boolean;
  onItemRemove: (item: T) => void;
  onRemoveAll: () => void;
  onSubmit: () => void;
  renderItem: (item: T, onItemRemove: (item: T) => void) => ReactNode;
}

function SelectedItemsSheet<T>({
  selectedSectionTitle,
  emptyMessage,
  submitButtonLabel,
  selectedItems,
  isSubmitDisabled,
  onItemRemove,
  onRemoveAll,
  onSubmit,
  renderItem,
}: SelectedItemsSheetProps<T>) {
  const scale = useGlobalScale();
  const actionHeight =
    SUBMIT_BUTTON_HEIGHT * scale;
  const sheetRef = useRef<SheetRef>(null);
  const fallbackSheetY = useMotionValue(0);
  const [sheetY, setSheetY] = useState(fallbackSheetY);
  const footerY = useTransform(sheetY, (value) => -value);

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
        aria-labelledby="selected-items-title"
        style={{
          left: '50%',
          x: '-50%',
          borderTopLeftRadius: SHEET_RADIUS * scale,
          borderTopRightRadius: SHEET_RADIUS * scale,
        }}
        className="!bg-background mx-auto w-full max-w-[500px] overflow-hidden !shadow-[0_-2px_12px_rgba(28,28,28,0.02)]"
      >
        <Sheet.Header className="shrink-0">
          <div
            className="flex items-center justify-center"
            style={{ height: HANDLE_AREA_HEIGHT * scale }}
            aria-hidden="true"
          >
            <span
              className="rounded-full bg-black"
              style={{
                height: HANDLE_HEIGHT * scale,
                width: HANDLE_WIDTH * scale,
              }}
            />
          </div>
        </Sheet.Header>

        <div
          className="flex shrink-0 items-center justify-between"
          style={{
            paddingLeft: SHEET_PADDING_X * scale,
            paddingRight: SHEET_PADDING_X * scale,
            paddingBottom: HEADER_PADDING_BOTTOM * scale,
          }}
        >
          <h2
            id="selected-items-title"
            className="font-semibold text-black"
            style={{
              fontSize: HEADER_TITLE_FONT_SIZE * scale,
              lineHeight: `${20 * scale}px`,
            }}
          >
            {selectedSectionTitle}
          </h2>
          <button
            type="button"
            disabled={selectedItems.length === 0}
            onClick={onRemoveAll}
            className="text-main-5 flex items-center font-medium disabled:cursor-default disabled:opacity-40"
            style={{
              minHeight: MIN_TOUCH_TARGET,
              marginTop: (MIN_TOUCH_TARGET - 20 * scale) / -2,
              marginBottom: (MIN_TOUCH_TARGET - 20 * scale) / -2,
              paddingLeft: 8 * scale,
              fontSize: REMOVE_ALL_FONT_SIZE * scale,
            }}
          >
            삭제
          </button>
        </div>

        <Sheet.Content
          className="min-h-0"
          style={{
            paddingLeft: SHEET_PADDING_X * scale,
            paddingRight: SHEET_PADDING_X * scale,
          }}
        >
          <Sheet.Scroller
            draggableAt="top"
            autoPadding={false}
            className="min-h-0 overscroll-contain"
          >
            {selectedItems.length === 0 ? (
              <p
                className="text-gray-5 text-center font-medium"
                style={{
                  paddingTop: EMPTY_MESSAGE_PADDING_Y * scale,
                  paddingBottom: EMPTY_MESSAGE_PADDING_Y * scale,
                  fontSize: EMPTY_MESSAGE_FONT_SIZE * scale,
                }}
              >
                {emptyMessage}
              </p>
            ) : (
              <div
                className="flex flex-col"
                style={{
                  gap: LIST_GAP * scale,
                  paddingTop: LIST_PADDING_Y * scale,
                  paddingBottom: LIST_PADDING_Y * scale,
                }}
              >
                {selectedItems.map((item) => renderItem(item, onItemRemove))}
              </div>
            )}
          </Sheet.Scroller>
        </Sheet.Content>

        <motion.div
          style={{
            y: footerY,
            paddingLeft: SHEET_PADDING_X * scale,
            paddingRight: SHEET_PADDING_X * scale,
            paddingTop: FOOTER_PADDING_TOP * scale,
            paddingBottom: `max(${
              FOOTER_PADDING_BOTTOM * scale
            }px, env(safe-area-inset-bottom, 0px))`,
          }}
          className="shrink-0"
        >
          <button
            type="button"
            disabled={isSubmitDisabled}
            onClick={onSubmit}
            className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full rounded-xl font-semibold"
            style={{
              height: actionHeight,
              borderRadius: 12 * scale,
              fontSize: SUBMIT_BUTTON_FONT_SIZE * scale,
            }}
          >
            {submitButtonLabel}
          </button>
        </motion.div>
      </Sheet.Container>
    </Sheet>
  );
}

export default SelectedItemsSheet;
