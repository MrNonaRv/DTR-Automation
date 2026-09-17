import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
  value: number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function SearchableSelect({ options, value, onChange, className = '' }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative w-full max-w-xs ${className}`} ref={dropdownRef}>
      <div 
        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg cursor-pointer bg-white relative hover:border-gray-400 transition-colors"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearch('');
        }}
      >
        <span className="truncate block font-medium text-gray-700">{selectedOption?.label || "Select..."}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transform origin-top animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100 flex items-center bg-gray-50/50">
            <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              className="w-full text-sm outline-none bg-transparent"
              placeholder="Search name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <li
                  key={opt.value}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors flex items-center ${opt.value === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-3 text-sm text-gray-500 text-center italic">No employee found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
