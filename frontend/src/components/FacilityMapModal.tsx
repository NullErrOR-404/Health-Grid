import React from 'react';
import { FindCareNearYou } from './FindCareNearYou';
import type { Language } from '../types';

interface FacilityMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const FacilityMapModal: React.FC<FacilityMapModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        data-lenis-prevent
        className="w-full h-full sm:h-[92vh] sm:max-h-[900px] max-w-7xl flex flex-col bg-white rounded-none sm:rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <FindCareNearYou lang={lang} onClose={onClose} isModal={true} />
      </div>
    </div>
  );
};
