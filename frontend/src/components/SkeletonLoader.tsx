import React from 'react';

/**
 * HealthGrid Premium Skeleton Loaders
 * Sits seamlessly across async screens with a subtle teal/slate gradient shimmer sweep.
 */

interface SkeletonBoxProps {
  className?: string;
  rounded?: string;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  className = 'h-4 w-full',
  rounded = 'rounded-lg',
}) => {
  return <div className={`skeleton-shimmer ${rounded} ${className}`} />;
};

/**
 * Hospital / Pharmacy Card Skeleton for FindCareNearYou
 */
export const FacilityCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3 animate-pulse">
      {/* Header Badge & Title */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <SkeletonBox className="h-5 w-3/4 rounded-md" />
          <SkeletonBox className="h-3.5 w-1/2 rounded-md" />
        </div>
        <SkeletonBox className="h-6 w-20 rounded-full flex-shrink-0" />
      </div>

      {/* Address & Hours */}
      <div className="space-y-1.5 pt-1">
        <SkeletonBox className="h-3 w-5/6 rounded-md" />
        <SkeletonBox className="h-3 w-2/3 rounded-md" />
      </div>

      {/* Facility Tags & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-6 w-16 rounded-md" />
          <SkeletonBox className="h-6 w-20 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-8 w-24 rounded-xl" />
          <SkeletonBox className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const FacilityListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-3.5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <FacilityCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Emergency Contact Card Skeleton for ProfilePage
 */
export const EmergencyContactSkeleton: React.FC = () => {
  return (
    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar Circle */}
        <SkeletonBox className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-4 w-28 rounded-md" />
            <SkeletonBox className="h-4 w-14 rounded-full" />
          </div>
          <SkeletonBox className="h-3 w-36 rounded-md" />
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <SkeletonBox className="w-8 h-8 rounded-lg" />
        <SkeletonBox className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Medical Health History Timeline Item Skeleton
 */
export const HealthRecordSkeleton: React.FC = () => {
  return (
    <div className="flex items-start gap-3 relative py-2">
      <SkeletonBox className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" />
      <div className="space-y-1.5 flex-1">
        <SkeletonBox className="h-2.5 w-20 rounded-md" />
        <SkeletonBox className="h-3.5 w-44 rounded-md" />
        <SkeletonBox className="h-3 w-32 rounded-md" />
      </div>
    </div>
  );
};

/**
 * Prescription & OCR Analysis Skeleton for VoiceChatModal / Scan
 */
export const PrescriptionScanSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Scanning status banner */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 animate-pulse">
          <div className="w-4 h-4 rounded-full bg-teal-500" />
        </div>
        <div className="space-y-1.5 flex-1">
          <SkeletonBox className="h-4 w-48 rounded-md" />
          <SkeletonBox className="h-3 w-72 rounded-md" />
        </div>
      </div>

      {/* Medication extraction lines */}
      <div className="space-y-2.5 pt-2 border-t border-slate-200/80">
        <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-2">
          <div className="flex justify-between items-center">
            <SkeletonBox className="h-4 w-36 rounded-md" />
            <SkeletonBox className="h-4 w-16 rounded-full" />
          </div>
          <SkeletonBox className="h-3 w-56 rounded-md" />
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-2">
          <div className="flex justify-between items-center">
            <SkeletonBox className="h-4 w-40 rounded-md" />
            <SkeletonBox className="h-4 w-16 rounded-full" />
          </div>
          <SkeletonBox className="h-3 w-48 rounded-md" />
        </div>
      </div>
    </div>
  );
};
