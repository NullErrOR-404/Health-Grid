import React, { useState } from 'react';
import {
  Apple,
  Flame,
  Droplets,
  AlertOctagon,
  Send,
  Clock
} from 'lucide-react';
import { type DietPlanData } from '../../types/canvas';

interface PatientDietEducationArtifactProps {
  data: DietPlanData;
  onSendToChat?: (text: string) => void;
}

export const PatientDietEducationArtifact: React.FC<PatientDietEducationArtifactProps> = ({
  data,
  onSendToChat,
}) => {
  const [activeMealIndex, setActiveMealIndex] = useState<number>(0);

  const activeMeal = data.meals[activeMealIndex] || data.meals[0];

  return (
    <div className="space-y-6">
      {/* Header Nutrition Targets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5" />
            Daily Calorie Budget
          </div>
          <div className="text-2xl font-bold text-emerald-900 flex items-baseline gap-1">
            {data.calorieTarget}
            <span className="text-xs font-normal text-emerald-600">kcal / day</span>
          </div>
        </div>

        <div className="p-3.5 bg-teal-50/80 border border-teal-200/80 rounded-xl">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Apple className="w-3.5 h-3.5" />
            Target Protein
          </div>
          <div className="text-2xl font-bold text-teal-900 flex items-baseline gap-1">
            {data.proteinTargetGrams}g
            <span className="text-xs font-normal text-teal-600">lean plant & egg</span>
          </div>
        </div>

        <div className="p-3.5 bg-sky-50/80 border border-sky-200/80 rounded-xl">
          <div className="flex items-center gap-2 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Droplets className="w-3.5 h-3.5" />
            Daily Hydration
          </div>
          <div className="text-2xl font-bold text-sky-900 flex items-baseline gap-1">
            {data.hydrationTargetLiters} L
            <span className="text-xs font-normal text-sky-600">water & tender coconut</span>
          </div>
        </div>
      </div>

      {/* Cultural Grounding Note */}
      <div className="p-3.5 bg-gradient-to-r from-amber-50 to-teal-50 border border-amber-200/80 rounded-xl text-xs space-y-1">
        <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block">
          🌾 Tamil Nadu Traditional Grains & Glycemic Protection
        </span>
        <p className="text-slate-800 leading-relaxed font-medium">
          {data.culturalNotes}
        </p>
      </div>

      {/* Meal Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {data.meals.map((meal, idx) => (
          <button
            key={meal.mealTime}
            onClick={() => setActiveMealIndex(idx)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeMealIndex === idx
                ? 'bg-[#00A896] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {meal.timeLabel}
          </button>
        ))}
      </div>

      {/* Active Meal Items Card */}
      {activeMeal && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h4 className="text-sm font-bold text-slate-900">{activeMeal.timeLabel}</h4>
            </div>
            {activeMeal.clinicalNote && (
              <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                {activeMeal.clinicalNote}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {activeMeal.foodItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    {item.tamilName && (
                      <span className="text-[11px] text-slate-500 font-medium">({item.tamilName})</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Portion: {item.portion}</div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      item.glycemicIndex === 'LOW'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.glycemicIndex === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    GI: {item.glycemicIndex}
                  </span>
                  <div className="text-[11px] font-semibold text-slate-600 mt-1">
                    {item.calories} kcal • {item.proteinGrams}g pro
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Foods Strictly to Avoid */}
      {data.foodsToAvoid && data.foodsToAvoid.length > 0 && (
        <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            Foods to Strictly Restrict / Avoid
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.foodsToAvoid.map((food, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs font-semibold text-rose-900 bg-white border border-rose-200 rounded-lg shadow-2xs"
              >
                {food}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer Action */}
      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500">
          Tailored for: {data.condition}
        </span>
        <button
          onClick={() => {
            const summary = `Nutrition Plan for ${data.condition}:\n• Target: ${data.calorieTarget} kcal/day, ${data.proteinTargetGrams}g protein\n• Primary Staples: Samai, Kuthiraivali, Horse Gram\n• Avoid: ${data.foodsToAvoid.slice(0, 3).join(', ')}`;
            onSendToChat?.(summary);
          }}
          className="px-3.5 py-1.5 font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Send Diet Summary to Chat
        </button>
      </div>
    </div>
  );
};
