"use client";

import type { LessonPlanData } from "@/lib/claude";
import SupplyList from "./SupplyList";

const MESS_EMOJI: Record<string, string> = {
  low: "🟢",
  medium: "🟡",
  high: "🔴",
};

interface LessonPlanProps {
  plan: LessonPlanData;
  sourceUrl?: string;
  imagePreview?: string;
  onSave?: () => void;
  onPrint?: () => void;
  onEmail?: () => void;
  onSharePlan?: () => void;
  onShareList?: () => void;
  onCopyCaption?: () => void;
  onShowCarousel?: () => void;
  isSaved?: boolean;
  planId?: string;
}

export default function LessonPlan({
  plan,
  sourceUrl,
  imagePreview,
  onSave,
  onPrint,
  onEmail,
  onSharePlan,
  onShareList,
  onCopyCaption,
  onShowCarousel,
  isSaved,
  planId,
}: LessonPlanProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{plan.title}</h2>
        <p className="mt-1 text-gray-600">{plan.overview}</p>
        <div className="mt-2 flex items-center justify-center gap-3 text-sm text-gray-600">
          <span>
            {MESS_EMOJI[plan.mess_level] || "🟡"} {plan.mess_level} mess
          </span>
          <span>60 min</span>
          <span>{plan.total_estimated_cost}</span>
        </div>
      </div>

      {/* Inspiration Image */}
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Inspiration"
          className="mx-auto max-h-48 rounded-lg object-contain"
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaved}
            className="flex-1 rounded-lg bg-crayon-red py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:bg-green-500"
          >
            {isSaved ? "Saved!" : "Save"}
          </button>
        )}
        {onSharePlan && (
          <button
            onClick={onSharePlan}
            className="flex-1 rounded-lg bg-crayon-blue py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Share Plan
          </button>
        )}
        {onShareList && (
          <button
            onClick={onShareList}
            className="flex-1 rounded-lg bg-crayon-green py-3 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Shopping List
          </button>
        )}
        {onPrint && (
          <button
            onClick={onPrint}
            className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Print
          </button>
        )}
      </div>

      {/* Social sharing */}
      {(onCopyCaption || onShowCarousel || planId) && (
        <div className="flex gap-2">
          {onCopyCaption && (
            <button
              onClick={onCopyCaption}
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Copy for Instagram
            </button>
          )}
          {onShowCarousel && (
            <button
              onClick={onShowCarousel}
              className="flex-1 rounded-lg border border-purple-300 bg-purple-50 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
            >
              Carousel
            </button>
          )}
          {planId && (
            <a
              href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(`https://artspark-alpha.vercel.app/plan/${planId}`)}&description=${encodeURIComponent(`${plan.title} — Free art lesson plan for kids ages 4-6. 60 min, ${plan.mess_level} mess, ${plan.total_estimated_cost}. Full instructions + shopping list.`)}&media=${encodeURIComponent(`https://artspark-alpha.vercel.app/api/og/${planId}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Pin
            </a>
          )}
        </div>
      )}

      {/* Prep Steps */}
      {plan.prep_steps && plan.prep_steps.length > 0 && (
        <section className="rounded-lg bg-amber-50 p-4">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            Before Class Starts
          </h3>
          <ol className="space-y-1.5">
            {plan.prep_steps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-800">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-900">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Vocabulary */}
      {plan.vocabulary && plan.vocabulary.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Art Words to Use
          </h3>
          <div className="flex flex-wrap gap-2">
            {plan.vocabulary.map((word) => (
              <span
                key={word}
                className="rounded-full bg-crayon-blue/10 px-3 py-1 text-sm font-medium text-crayon-blue"
              >
                {word}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Learning Objectives */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Learning Objectives
        </h3>
        <ul className="space-y-1">
          {plan.learning_objectives.map((obj, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-crayon-red mt-0.5">&#9679;</span>
              {obj}
            </li>
          ))}
        </ul>
      </section>

      {/* Schedule */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Schedule (60 min)
        </h3>
        <div className="space-y-2">
          {plan.schedule.map((phase, i) => (
            <div
              key={i}
              className="rounded-lg bg-gray-50 p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 text-sm">
                  {phase.phase}
                </span>
                <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-full">
                  {phase.duration_minutes} min
                </span>
              </div>
              <p className="text-sm text-gray-600">{phase.description}</p>
              {phase.teacher_tip && (
                <p className="mt-2 text-sm italic text-crayon-blue border-l-2 border-crayon-blue/30 pl-3">
                  {phase.teacher_tip}
                </p>
              )}
              {phase.discussion_questions && phase.discussion_questions.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">Ask the class:</p>
                  <ul className="space-y-0.5">
                    {phase.discussion_questions.map((q, qi) => (
                      <li key={qi} className="text-sm text-gray-600 pl-3">
                        &bull; {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Supply List */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Materials & Supplies
        </h3>
        <SupplyList materials={plan.materials} totalCost={plan.total_estimated_cost} />
      </section>

      {/* Step by Step */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Step-by-Step Instructions
        </h3>
        <ol className="space-y-2">
          {plan.step_by_step_instructions.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-crayon-red">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Safety Notes */}
      {plan.safety_notes.length > 0 && (
        <section className="rounded-lg bg-red-50 p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Safety Notes
          </h3>
          <ul className="space-y-1">
            {plan.safety_notes.map((note, i) => (
              <li key={i} className="flex gap-2 text-sm text-red-700">
                <span>&#9888;&#65039;</span>
                {note}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Modifications */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Modifications
        </h3>
        <div className="space-y-2">
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xs font-semibold text-green-700 mb-1">
              Easier
            </p>
            <p className="text-sm text-green-800">{plan.modifications.easier}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">
              Harder
            </p>
            <p className="text-sm text-blue-800">{plan.modifications.harder}</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="text-xs font-semibold text-purple-700 mb-1">
              Accessibility
            </p>
            <p className="text-sm text-purple-800">
              {plan.modifications.accessibility}
            </p>
          </div>
        </div>
      </section>

      {/* Parent Note */}
      {plan.parent_note && (
        <section className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <h3 className="text-sm font-semibold text-amber-900 mb-1">
            Note for Parents
          </h3>
          <p className="text-sm text-amber-800">{plan.parent_note}</p>
        </section>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {plan.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
          >
            {tag}
          </span>
        ))}
        {plan.season_tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-amber-100 px-3 py-1 text-xs text-crayon-red"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Source */}
      {sourceUrl && (
        <p className="text-center text-xs text-gray-500">
          Inspired by:{" "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            {sourceUrl}
          </a>
        </p>
      )}
    </div>
  );
}
