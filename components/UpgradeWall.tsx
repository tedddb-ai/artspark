"use client";

import { useState } from "react";
import { activatePremium } from "@/lib/usage";

const MONTHLY_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "";
const ANNUAL_LINK = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_LINK || "";
const UNLOCK_CODE = process.env.NEXT_PUBLIC_UNLOCK_CODE || "";

interface UpgradeWallProps {
  onUnlocked: () => void;
}

export default function UpgradeWall({ onUnlocked }: UpgradeWallProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");

  function handleUnlock() {
    if (UNLOCK_CODE && code.trim().toLowerCase() === UNLOCK_CODE.toLowerCase()) {
      activatePremium();
      onUnlocked();
    } else {
      setError("Invalid code. Complete payment first, then enter the code shown on the confirmation page.");
    }
  }

  const paymentLink = plan === "annual" ? (ANNUAL_LINK || MONTHLY_LINK) : MONTHLY_LINK;

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
        {/* Plan toggle */}
        <div className="flex items-center justify-center gap-1 rounded-full bg-white p-1 ring-1 ring-amber-200 max-w-xs mx-auto">
          <button
            onClick={() => setPlan("monthly")}
            className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              plan === "monthly"
                ? "bg-amber-100 text-amber-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPlan("annual")}
            className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              plan === "annual"
                ? "bg-amber-100 text-amber-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Annual
            <span className="ml-1 text-[10px] font-bold text-crayon-green">Save 34%</span>
          </button>
        </div>

        <div className="rounded-2xl bg-white p-4 ring-1 ring-amber-200">
          {plan === "monthly" ? (
            <div className="text-3xl font-bold text-gray-900">
              $10<span className="text-lg font-normal text-gray-500">/mo</span>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-bold text-gray-900">
                $79<span className="text-lg font-normal text-gray-500">/yr</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                $6.58/mo — save $41/year
              </p>
            </div>
          )}
          <ul className="mt-3 space-y-1.5 text-sm text-gray-600 text-left max-w-xs mx-auto">
            <li className="flex gap-2"><span className="text-crayon-green">&#10003;</span> Unlimited lesson plans</li>
            <li className="flex gap-2"><span className="text-crayon-green">&#10003;</span> Personalized recommendations</li>
            <li className="flex gap-2"><span className="text-crayon-green">&#10003;</span> Instagram carousels & captions</li>
            <li className="flex gap-2"><span className="text-crayon-green">&#10003;</span> Supply list with Amazon links</li>
            <li className="flex gap-2"><span className="text-crayon-green">&#10003;</span> Print-ready lesson plans</li>
          </ul>
        </div>

        {paymentLink ? (
          <a
            href={paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full rounded-xl bg-crayon-red py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-red-700"
          >
            {plan === "annual" ? "Upgrade Now — $79/year" : "Upgrade Now — $10/mo"}
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
