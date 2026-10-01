import React, { useState, useRef, useEffect, useId } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export interface CustomDatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  maxDate?: Date; // e.g. new Date() to prevent future dates for DOB
  minDate?: Date; // e.g. 1900-01-01
  className?: string;
  triggerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'lg' | 'xl' | '2xl';
  id?: string;
}

type CalendarView = 'days' | 'months' | 'years';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select Date of Birth',
  label,
  disabled = false,
  maxDate = new Date(),
  minDate = new Date(1910, 0, 1),
  className = '',
  triggerClassName = '',
  size = 'md',
  rounded = 'xl',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<CalendarView>('days');
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const pickerId = id || generatedId;

  // Selected date parsed
  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }, [value]);

  // Current view anchor (defaults to selected date or 25 years ago for DOB convenience)
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (selectedDate) return selectedDate;
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 25);
    return defaultDate;
  });

  // When value changes externally, update viewDate
  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setView('days');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Year view decade calculation (12 years shown per page)
  const currentYear = viewDate.getFullYear();
  const decadeStartYear = Math.floor(currentYear / 12) * 12;

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Human friendly display format
  const displayValue = React.useMemo(() => {
    if (!selectedDate) return '';
    return selectedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDate]);

  // Days grid calculation
  const calendarDays = React.useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; isDisabled: boolean; isSelected: boolean; isToday: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const isDisabled = (maxDate && d > maxDate) || (minDate && d < minDate);
      days.push({
        date: d,
        isCurrentMonth: false,
        isDisabled: !!isDisabled,
        isSelected: !!selectedDate && formatDate(d) === formatDate(selectedDate),
        isToday: d.getTime() === today.getTime(),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(year, month, i);
      const isDisabled = (maxDate && d > maxDate) || (minDate && d < minDate);
      days.push({
        date: d,
        isCurrentMonth: true,
        isDisabled: !!isDisabled,
        isSelected: !!selectedDate && formatDate(d) === formatDate(selectedDate),
        isToday: d.getTime() === today.getTime(),
      });
    }

    // Next month padding to fill 35 or 42 slots
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(year, month + 1, i);
      const isDisabled = (maxDate && d > maxDate) || (minDate && d < minDate);
      days.push({
        date: d,
        isCurrentMonth: false,
        isDisabled: !!isDisabled,
        isSelected: !!selectedDate && formatDate(d) === formatDate(selectedDate),
        isToday: d.getTime() === today.getTime(),
      });
    }

    return days;
  }, [viewDate, selectedDate, maxDate, minDate]);

  const handleDayClick = (dayDate: Date) => {
    onChange(formatDate(dayDate));
    setIsOpen(false);
    setView('days');
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDate = new Date(viewDate);
    if (view === 'days') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'months') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else if (view === 'years') {
      newDate.setFullYear(newDate.getFullYear() - 12);
    }
    setViewDate(newDate);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDate = new Date(viewDate);
    if (view === 'days') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'months') {
      newDate.setFullYear(newDate.getFullYear() + 1);
    } else if (view === 'years') {
      newDate.setFullYear(newDate.getFullYear() + 12);
    }
    setViewDate(newDate);
  };

  // Size definitions
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-xs sm:text-sm',
    lg: 'px-4 py-2.5 text-sm',
  };

  const roundedClasses = {
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left ${className}`}>
      {label && (
        <label htmlFor={pickerId} className="block text-[11px] font-semibold text-slate-600 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={pickerId}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setView('days');
          }
        }}
        className={`w-full flex items-center justify-between bg-white text-slate-800 border border-slate-200/90 shadow-2xs transition-all duration-150 cursor-pointer select-none outline-none ${
          sizeClasses[size]
        } ${roundedClasses[rounded]} ${
          isOpen ? 'border-teal-600 ring-2 ring-teal-500/20' : 'hover:border-slate-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'active:scale-[0.995]'} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-teal-600 flex-shrink-0" />
          {displayValue ? (
            <span className="font-semibold text-slate-900 tracking-tight">{displayValue}</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-teal-600' : ''
          }`}
        />
      </button>

      {/* Flowing Calendar Popover Card */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 z-50 w-72 sm:w-80 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 p-3 animate-dropdown-flow text-slate-800 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Switchable View & Navigation */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* View Switcher Button (Days -> Months -> Years) */}
            <button
              type="button"
              onClick={() => {
                if (view === 'days') setView('months');
                else if (view === 'months') setView('years');
                else setView('days');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-teal-50 hover:text-teal-800 font-bold text-xs sm:text-sm text-slate-800 transition-colors"
            >
              <span>
                {view === 'days' && `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
                {view === 'months' && `${viewDate.getFullYear()} (Select Month)`}
                {view === 'years' && `${decadeStartYear} – ${decadeStartYear + 11}`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* VIEW 1: DAYS GRID */}
          {view === 'days' && (
            <div>
              {/* Day Labels (Su, Mo, Tu, We, Th, Fr, Sa) */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {DAY_LABELS.map((label, idx) => (
                  <div key={idx} className="text-[11px] font-bold text-slate-400 py-1">
                    {label}
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((item, idx) => {
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={item.isDisabled}
                      onClick={() => handleDayClick(item.date)}
                      className={`h-8 w-8 sm:h-9 sm:w-9 mx-auto rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${
                        item.isSelected
                          ? 'bg-[#0B7A75] text-white shadow-sm font-bold scale-105'
                          : item.isDisabled
                          ? 'text-slate-300 opacity-40 cursor-not-allowed'
                          : item.isToday
                          ? 'border border-teal-500 text-teal-700 bg-teal-50/50 hover:bg-teal-100/60'
                          : item.isCurrentMonth
                          ? 'text-slate-800 hover:bg-slate-100'
                          : 'text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {item.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: MONTHS GRID */}
          {view === 'months' && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {MONTH_SHORT.map((mName, mIdx) => {
                const isSelected = viewDate.getMonth() === mIdx;
                return (
                  <button
                    key={mIdx}
                    type="button"
                    onClick={() => {
                      const newDate = new Date(viewDate);
                      newDate.setMonth(mIdx);
                      setViewDate(newDate);
                      setView('days');
                    }}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#0B7A75] text-white shadow-sm font-bold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          )}

          {/* VIEW 3: YEARS GRID (Multi-Decade Quick Jump) */}
          {view === 'years' && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {Array.from({ length: 12 }, (_, i) => decadeStartYear + i).map((yr) => {
                const isSelected = viewDate.getFullYear() === yr;
                const isFuture = maxDate && yr > maxDate.getFullYear();
                return (
                  <button
                    key={yr}
                    type="button"
                    disabled={isFuture}
                    onClick={() => {
                      const newDate = new Date(viewDate);
                      newDate.setFullYear(yr);
                      setViewDate(newDate);
                      setView('months');
                    }}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#0B7A75] text-white shadow-sm font-bold'
                        : isFuture
                        ? 'text-slate-300 opacity-40 cursor-not-allowed'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          )}

          {/* Bottom Quick Jump Action: Reset to 25yo or Clear */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                d.setFullYear(d.getFullYear() - 25);
                setViewDate(d);
                setView('days');
              }}
              className="text-slate-500 hover:text-slate-800 transition-colors font-medium"
            >
              Default (~1999)
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-rose-600 hover:text-rose-700 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Utility to calculate exact age in completed years from YYYY-MM-DD
export const calculateAgeFromDob = (dobString: string): number | null => {
  if (!dobString) return null;
  const parts = dobString.split('-');
  if (parts.length !== 3) return null;
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);

  const birthDate = new Date(birthYear, birthMonth, birthDay);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
};
