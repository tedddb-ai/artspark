"use client";

import { useState } from "react";
import { activatePremium } from "@/lib/usage";

const PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "";
const UNLOCK_CODE = process.env.NEXT_PUBLIC_UNLOCK_CODE || "";

interface UpgradeWallProps {
  onUnlocked: () => void;
}

export default function UpgradeWall({ onUnlocked }: UpgradeWallProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleUnlock() {
    if (UNLOCK_CODE && code.trim().toLowerCase() === UNLOCK_CODE.toLowerCase()) {
      activatePremium();
      onUnlocked();
    } else {
      setError("Invalid code. Complete payment first, then enter the code shown on the confirmation page.");
    }
  }

  return (
    <div className="space-y-4 rounded-[28px] border-2 border-amber-300 bg-amber-50 p-6 text-center">
      <div className="text-4xl">&#127912;</div>
      <h2
        className="text-2xl font-bold text-gray-900"
        style={{ fontFamily: "marker felt, comic sans ms, cursive" }}
      >
        You&apos;ve used your 3 free plans this month!
      </h2>
      <p className="text-sm text-gray-600 max-w-sm mx-auto">
        Upgrade to ArtSpark Premium for unlimited lesson plans, taste-based
        recommendations, and priority generation.
      </p>

      <div className="space-y-3">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-amber-200">
          <div className="text-3xl font-bold text-gray-900">$10<span className="text-lg font-normal text-gray-500">/mo</span></div>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-600 text-left max-w-xs mx-auto">
            <li className="flex gap-2"><span className="text-crayon-green">&#10003;</span> Unlimited lesson plans</li>
            <li className="flex gap-2"><span className="text-crayon-green">&#10003;</span> Personalized recommendations</li>
            <li className="flex gap-2"><span className="text-crayon-green">&#10003;</span> Instagram carousels & captions</li>
            <li className="flex gap-2"><span className="text-crayon-green">&#10003;</span> Supply list with Amazon links</li>
            <li className="flex gap-2"><span className="text-crayon-green">&#10003;</span> Print-ready lesson plans</li>
          </ul>
        </div>

        {PAYMENT_LINK ? (
          <a
            href={PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full rounded-xl bg-crayon-red py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-red-700"
          >
            Upgrade Now — $10/mo
          </a>
        ) : (
          <p className="text-xs text-gray-400">Payment link coming soon</p>
        )}

        <div className="border-t border-amber-200 pt-3">
          <p className="text-xs text-gray-500 mb-2">Already paid? Enter your unlock code:</p>
          <div className="flex gap-2 max-w-xs mx-auto">
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(""); }}
              placeholder="Enter code"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-crayon-red focus:outline-none focus:ring-1 focus:ring-crayon-red"
            />
            <button
              onClick={handleUnlock}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Unlock
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
