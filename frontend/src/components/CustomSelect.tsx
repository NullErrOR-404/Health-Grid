import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface CustomSelectProps {
  options: (SelectOption | string)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  icon?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  rounded?: 'lg' | 'xl' | '2xl' | 'full';
  align?: 'left' | 'right';
  dropUp?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  disabled = false,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  icon,
  size = 'md',
  rounded = 'xl',
  align = 'left',
  dropUp = false,
  id,
  searchable = false,
  searchPlaceholder = 'Search...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Normalize options to SelectOption objects
  const normalizedOptions: SelectOption[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Filtered options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
        opt.value.toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchQuery]);

  // Current selected option
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open if searchable
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    if (isOpen) {
      const idx = filteredOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, searchable, value, filteredOptions]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
    }
  };

  // Sizing definitions
  const sizeClasses = {
    xs: 'px-2.5 py-1 text-[11px] gap-1.5',
    sm: 'px-3 py-1.5 text-xs gap-2',
    md: 'px-3.5 py-2 text-xs sm:text-sm gap-2.5',
    lg: 'px-4 py-2.5 text-sm gap-3',
  };

  const roundedClasses = {
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  return (
    <div
      ref={selectRef}
      className={`relative inline-block text-left w-full ${className}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[11px] font-semibold text-slate-600 mb-1"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (isOpen) setSearchQuery('');
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between bg-white text-slate-800 border border-slate-200/90 shadow-2xs transition-all duration-150 cursor-pointer select-none text-left outline-none ${
          sizeClasses[size]
        } ${roundedClasses[rounded]} ${
          isOpen
            ? 'border-teal-600 ring-2 ring-teal-500/20'
            : 'hover:border-slate-300'
        } ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'active:scale-[0.995]'
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="flex-shrink-0 text-slate-500">{icon}</span>}
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.icon && (
                <span className="flex-shrink-0">{selectedOption.icon}</span>
              )}
              <span className="truncate font-medium text-slate-900">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-teal-50 text-teal-700 rounded-md border border-teal-200/50">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ease-out ${
            isOpen ? 'rotate-180 text-teal-600' : 'group-hover:text-slate-600'
          }`}
        />
      </button>

      {/* Flowing Animated Dropdown Menu Box */}
      {isOpen && (
        <div
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
            dropUp ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'
          } z-50 w-full min-w-[200px] bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 p-1.5 animate-dropdown-flow outline-none overflow-hidden ${menuClassName}`}
        >
          {/* Optional Instant Search Filter */}
          {searchable && (
            <div className="px-2 pt-1 pb-1.5 border-b border-slate-100 mb-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={searchPlaceholder}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 outline-none focus:border-teal-500 focus:bg-white transition-colors"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === ' ') e.stopPropagation();
                }}
              />
            </div>
          )}

          {/* Options List */}
          <div
            className="max-h-60 overflow-y-auto space-y-0.5 overscroll-contain"
            data-lenis-prevent
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-slate-400 italic">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = highlightedIndex === index;

                return (
                  <button
                    key={`${opt.value}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-100 cursor-pointer text-left select-none ${
                      isSelected
                        ? 'bg-teal-50/90 text-teal-800 font-semibold border border-teal-200/60 shadow-2xs'
                        : isHighlighted
                        ? 'bg-slate-100/80 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 truncate">
                      {opt.icon && (
                        <span className="flex-shrink-0 text-slate-500">
                          {opt.icon}
                        </span>
                      )}
                      <div className="truncate">
                        <span className="truncate block">{opt.label}</span>
                        {opt.sublabel && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {opt.badge && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-md">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-teal-600 stroke-[2.5]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
