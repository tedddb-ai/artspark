"use client";

import type { LessonPlanData } from "@/lib/claude";

interface PrintViewProps {
  plan: LessonPlanData;
  sourceUrl?: string;
  planId?: string;
}

export default function PrintView({ plan, sourceUrl, planId }: PrintViewProps) {
  return (
    <div className="print-view mx-auto max-w-2xl p-8 font-serif text-black">
      <style jsx>{`
        @media print {
          .print-view { padding: 0; }
          .page-break { page-break-before: always; }
          .no-print { display: none; }
        }
      `}</style>

      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold">{plan.title}</h1>
        <p className="text-gray-600 mt-1">{plan.overview}</p>
        <div className="flex gap-4 mt-2 text-sm text-gray-600">
          <span>60 minutes</span>
          <span>Ages 4-6</span>
          <span>~15 students</span>
          <span>Mess: {plan.mess_level}</span>
        </div>
      </div>

      {/* Vocabulary */}
      {plan.vocabulary && plan.vocabulary.length > 0 && (
        <section className="mb-4">
          <p className="text-sm">
            <strong>Art Words:</strong> {plan.vocabulary.join(", ")}
          </p>
        </section>
      )}

      {/* Prep Steps */}
      {plan.prep_steps && plan.prep_steps.length > 0 && (
        <section className="mb-6 border border-gray-400 p-4">
          <h2 className="text-xl font-bold mb-2">Before Class Starts</h2>
          <ol className="list-decimal pl-5 space-y-1">
            {plan.prep_steps.map((step, i) => (
              <li key={i} className="text-sm">{step}</li>
            ))}
          </ol>
        </section>
      )}

      {/* Learning Objectives */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-2">Learning Objectives</h2>
        <ul className="list-disc pl-5 space-y-1">
          {plan.learning_objectives.map((obj, i) => (
            <li key={i} className="text-sm">{obj}</li>
          ))}
        </ul>
      </section>

      {/* Schedule */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-2">Schedule</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1 pr-4">Phase</th>
              <th className="text-left py-1 pr-4">Time</th>
              <th className="text-left py-1">Details</th>
            </tr>
          </thead>
          <tbody>
            {plan.schedule.map((phase, i) => (
              <tr key={i} className="border-b border-gray-200 align-top">
                <td className="py-2 pr-4 font-medium">{phase.phase}</td>
                <td className="py-2 pr-4 whitespace-nowrap">{phase.duration_minutes} min</td>
                <td className="py-2">
                  {phase.description}
                  {phase.teacher_tip && (
                    <p className="mt-1 italic text-gray-600">{phase.teacher_tip}</p>
                  )}
                  {phase.discussion_questions && phase.discussion_questions.length > 0 && (
                    <ul className="mt-1 list-disc pl-4">
                      {phase.discussion_questions.map((q, qi) => (
                        <li key={qi} className="text-gray-600">{q}</li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Instructions */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-2">Step-by-Step Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          {plan.step_by_step_instructions.map((step, i) => (
            <li key={i} className="text-sm">{step}</li>
          ))}
        </ol>
      </section>

      {/* Safety */}
      {plan.safety_notes.length > 0 && (
        <section className="mb-6 border border-black p-3">
          <h2 className="text-lg font-bold mb-1">&#9888; Safety Notes</h2>
          <ul className="list-disc pl-5 space-y-1">
            {plan.safety_notes.map((note, i) => (
              <li key={i} className="text-sm">{note}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Modifications */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-2">Modifications</h2>
        <div className="text-sm space-y-1">
          <p><strong>Easier:</strong> {plan.modifications.easier}</p>
          <p><strong>Harder:</strong> {plan.modifications.harder}</p>
          <p><strong>Accessibility:</strong> {plan.modifications.accessibility}</p>
        </div>
      </section>

      {/* Parent Note */}
      {plan.parent_note && (
        <section className="mb-6 border border-gray-400 p-3">
          <h2 className="text-lg font-bold mb-1">Note for Parents</h2>
          <p className="text-sm">{plan.parent_note}</p>
        </section>
      )}

      {/* Supply List - separate page for tearing */}
      <div className="page-break" />
      <div className="border-2 border-dashed border-gray-400 p-6">
        <h2 className="text-2xl font-bold mb-1">Supply Checklist</h2>
        <p className="text-sm text-gray-600 mb-4">{plan.title}</p>
        <div className="space-y-2">
          {plan.materials.map((mat, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="inline-block h-4 w-4 mt-0.5 border border-black shrink-0" />
              <div className="flex-1">
                <span>{mat.item}</span>
                {mat.tip && (
                  <span className="text-gray-500 ml-1">({mat.tip})</span>
                )}
              </div>
              <span className="text-gray-600">{mat.quantity}</span>
              <span className="w-16 text-right">{mat.estimated_cost}</span>
            </div>
          ))}
          <div className="border-t border-black pt-2 mt-4 flex justify-between font-bold text-sm">
            <span>Estimated Total</span>
            <span>{plan.total_estimated_cost}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">
        {sourceUrl && <p>Inspiration: {sourceUrl}</p>}
        {planId && <p>Plan ID: {planId}</p>}
        <p className="mt-1">Generated by ArtSpark — Little Bay Arts & Crafts</p>
      </div>
    </div>
  );
}
