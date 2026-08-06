import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import calendarIcon from '../../../assets/icons/calendar.svg';
import vector from '../../../assets/icons/vector.svg';
import {
  createCalendarDays,
  formatDateValue,
  isFutureDate,
  isFutureMonth,
  parseDateValue,
} from './calendar';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface DatePickerProps {
  readonly value: string;
  readonly placeholder: string;
  readonly scale: number;
  readonly ariaLabel: string;
  readonly onChange: (value: string) => void;
}

export default function DatePicker({
  value,
  placeholder,
  scale,
  ariaLabel,
  onChange,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const [displayedDate, setDisplayedDate] = useState(
    () => parseDateValue(value) ?? new Date()
  );
  const [draftYear, setDraftYear] = useState(() => displayedDate.getFullYear());
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const year = displayedDate.getFullYear();
  const month = displayedDate.getMonth();
  const today = new Date();
  const calendarDays = createCalendarDays(year, month);
  const canGoToNextMonth = !isFutureMonth(year, month + 1, today);

  const moveMonth = (offset: number) => {
    const nextDate = new Date(year, month + offset, 1);
    if (isFutureMonth(nextDate.getFullYear(), nextDate.getMonth(), today)) {
      return;
    }

    setIsMonthSelectorOpen(false);
    setDisplayedDate(nextDate);
  };

  const toggleCalendar = () => {
    if (!isOpen) {
      const selectedDate = parseDateValue(value);
      if (selectedDate) setDisplayedDate(selectedDate);
    }

    setIsMonthSelectorOpen(false);
    setIsOpen((current) => !current);
  };

  const toggleMonthSelector = () => {
    setDraftYear(year);
    setIsMonthSelectorOpen((current) => !current);
  };

  return (
    <div className="w-full">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={toggleCalendar}
        className="flex w-full items-center justify-between rounded-xl border border-[#e4e4e4] bg-[#f9f9f9] px-[14px] text-left font-medium text-[#7f7f7f]"
        style={{
          height: 42 * scale,
          fontSize: 12 * scale,
          lineHeight: `${14 * scale}px`,
        }}
      >
        <span>{value || placeholder}</span>
        <img
          src={calendarIcon}
          alt=""
          aria-hidden="true"
          style={{ width: 14 * scale, height: 15 * scale }}
        />
      </button>

      {isOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6"
              onClick={() => setIsOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="날짜 선택"
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-[342px] rounded-xl border border-[#e4e4e4] bg-[#f9f9f9] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              >
                {!isMonthSelectorOpen ? (
                  <div className="mb-4 flex items-center justify-between">
                    <button
                      type="button"
                      aria-label="이전 달"
                      onClick={() => moveMonth(-1)}
                      className="flex size-7 items-center justify-center"
                    >
                      <img
                        src={vector}
                        alt=""
                        aria-hidden="true"
                        style={{
                          width: 6 * scale,
                          height: 10 * scale,
                          transform: 'rotate(180deg)',
                        }}
                      />
                    </button>
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={isMonthSelectorOpen}
                      aria-label={`${year}년 ${month + 1}월 선택`}
                      onClick={toggleMonthSelector}
                      className="font-semibold text-[#1c1c1c]"
                      style={{
                        fontSize: 14 * scale,
                        lineHeight: `${17 * scale}px`,
                      }}
                    >
                      {year}년 {month + 1}월
                    </button>
                    <button
                      type="button"
                      aria-label="다음 달"
                      onClick={() => moveMonth(1)}
                      disabled={!canGoToNextMonth}
                      className="flex size-7 items-center justify-center disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <img
                        src={vector}
                        alt=""
                        aria-hidden="true"
                        style={{ width: 6 * scale, height: 10 * scale }}
                      />
                    </button>
                  </div>
                ) : null}
                {isMonthSelectorOpen ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        type="button"
                        aria-label="이전 연도"
                        onClick={() => setDraftYear((current) => current - 1)}
                        className="flex size-7 items-center justify-center"
                      >
                        <img
                          src={vector}
                          alt=""
                          aria-hidden="true"
                          style={{
                            width: 6 * scale,
                            height: 10 * scale,
                            transform: 'rotate(180deg)',
                          }}
                        />
                      </button>
                      <strong
                        className="font-semibold text-[#1c1c1c]"
                        style={{
                          fontSize: 14 * scale,
                          lineHeight: `${17 * scale}px`,
                        }}
                      >
                        {draftYear}년
                      </strong>
                      <button
                        type="button"
                        aria-label="다음 연도"
                        onClick={() => setDraftYear((current) => current + 1)}
                        disabled={draftYear >= today.getFullYear()}
                        className="flex size-7 items-center justify-center disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <img
                          src={vector}
                          alt=""
                          aria-hidden="true"
                          style={{ width: 6 * scale, height: 10 * scale }}
                        />
                      </button>
                    </div>
                    <div
                      role="listbox"
                      aria-label="월 선택"
                      className="grid grid-cols-3 gap-2"
                    >
                      {Array.from({ length: 12 }, (_, monthIndex) => {
                        const isSelected =
                          draftYear === year && monthIndex === month;
                        const isDisabled = isFutureMonth(
                          draftYear,
                          monthIndex,
                          today
                        );

                        return (
                          <button
                            key={monthIndex}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            disabled={isDisabled}
                            onClick={() => {
                              setDisplayedDate(
                                new Date(draftYear, monthIndex, 1)
                              );
                              setIsMonthSelectorOpen(false);
                            }}
                            className={`rounded-lg font-medium disabled:cursor-not-allowed ${
                              isDisabled
                                ? 'text-[#cfcfcf]'
                                : isSelected
                                  ? 'bg-[#ffebe5] text-[#ff6f41]'
                                  : 'text-[#505050]'
                            }`}
                            style={{
                              height: 32 * scale,
                              fontSize: 12 * scale,
                              lineHeight: `${14 * scale}px`,
                            }}
                          >
                            {monthIndex + 1}월
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-7"
                    style={{ rowGap: 4 * scale }}
                  >
                    {WEEKDAY_LABELS.map((weekday) => (
                      <span
                        key={weekday}
                        className="text-center font-medium text-[#7f7f7f]"
                        style={{
                          fontSize: 11 * scale,
                          lineHeight: `${14 * scale}px`,
                        }}
                      >
                        {weekday}
                      </span>
                    ))}
                    {calendarDays.map((day, index) => {
                      const dayValue =
                        day === null
                          ? ''
                          : formatDateValue(new Date(year, month, day));
                      const isSelected = dayValue === value;
                      const isDisabled =
                        day !== null &&
                        isFutureDate(new Date(year, month, day), today);

                      return day === null ? (
                        <span
                          key={`empty-${index}`}
                          style={{ height: 32 * scale }}
                        />
                      ) : (
                        <button
                          key={dayValue}
                          type="button"
                          aria-label={dayValue}
                          aria-pressed={isSelected}
                          disabled={isDisabled}
                          onClick={() => {
                            onChange(dayValue);
                            setIsOpen(false);
                          }}
                          className={`mx-auto flex items-center justify-center rounded-full font-medium disabled:cursor-not-allowed disabled:text-[#cfcfcf] ${isSelected ? 'bg-main-5 text-white' : 'text-[#1c1c1c]'}`}
                          style={{
                            width: 32 * scale,
                            height: 32 * scale,
                            fontSize: 12 * scale,
                            lineHeight: `${14 * scale}px`,
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
