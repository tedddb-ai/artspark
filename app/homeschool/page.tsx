import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Free Art Curriculum for Homeschool — ArtSpark",
  description:
    "Turn any image into a complete art lesson plan for your homeschool. AI-powered, personalized to your kids' ages and supplies on hand. Free to try.",
  openGraph: {
    title: "Free Art Curriculum for Homeschool — ArtSpark",
    description:
      "Snap a photo of any art project and get a complete lesson plan with supply list, step-by-step instructions, and modifications for different ages.",
    type: "website",
  },
};

export default function HomeschoolPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Hero */}
      <section className="space-y-4 rounded-[28px] bg-white/60 p-6 shadow-sm ring-1 ring-amber-200 text-center">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="ArtSpark"
            width={80}
            height={80}
            className="h-20 w-auto rounded-full shadow-md"
          />
        </div>
        <h1
          className="text-3xl font-bold tracking-tight text-gray-900"
          style={{ fontFamily: "marker felt, comic sans ms, cursive" }}
        >
          Art Made Easy for Homeschool
        </h1>
        <p className="mx-auto max-w-md text-sm leading-6 text-gray-600">
          Stop spending hours planning art lessons. Snap a photo of any art
          project — from Pinterest, a museum, or your kid&apos;s imagination —
          and get a complete, age-appropriate lesson plan in seconds.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-crayon-red px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-red-700"
        >
          Try It Free
        </Link>
      </section>

      {/* Pain Points */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          Sound familiar?
        </h2>
        <div className="space-y-2">
          {[
            "\"I want to teach art but I'm not artistic myself.\"",
            "\"I spend more time planning than actually doing art with my kids.\"",
            "\"Art curriculum is expensive and my kids lose interest halfway through.\"",
            "\"I have three kids at different levels — how do I teach them all at once?\"",
          ].map((quote) => (
            <div
              key={quote}
              className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-gray-700 italic ring-1 ring-gray-100"
            >
              {quote}
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          How ArtSpark works
        </h2>
        <div className="grid gap-3">
          {[
            {
              step: "1",
              title: "Find inspiration anywhere",
              desc: "Snap a photo, paste a Pinterest link, or describe what you want. A leaf from the backyard, a museum painting, a craft you saw online.",
              color: "text-crayon-red",
            },
            {
              step: "2",
              title: "Get a complete lesson plan",
              desc: "In under 30 seconds, you get learning objectives, step-by-step instructions, a supply list with prices, safety notes, and modifications for different ages.",
              color: "text-crayon-blue",
            },
            {
              step: "3",
              title: "Teach with confidence",
              desc: "Print the plan, grab the supplies (with one-click Amazon links), and enjoy art time with your kids instead of stressing about it.",
              color: "text-crayon-green",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex gap-4 rounded-2xl bg-white/80 p-4 ring-1 ring-gray-100"
            >
              <span
                className={`text-2xl font-bold ${item.color} shrink-0`}
              >
                {item.step}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What You Get */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          Every lesson plan includes
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Learning objectives",
            "Step-by-step instructions",
            "Supply list with prices",
            "One-click Amazon shopping",
            "Safety notes",
            "Easier/harder modifications",
            "Accessibility adaptations",
            "Art vocabulary words",
            "Discussion questions",
            "Prep checklist",
            "Printable format",
            "Shareable shopping list",
          ].map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs text-gray-700 ring-1 ring-gray-100"
            >
              <span className="text-crayon-green">&#10003;</span>
              {feature}
            </div>
          ))}
        </div>
      </section>

      {/* Homeschool Specific */}
      <section className="rounded-[28px] bg-amber-50 p-5 ring-1 ring-amber-200 space-y-3">
        <h2 className="text-xl font-bold text-amber-900">
          Built for homeschool families
        </h2>
        <ul className="space-y-2 text-sm text-amber-800">
          <li className="flex gap-2">
            <span className="shrink-0">&#127912;</span>
            <span>
              <strong>No art degree needed.</strong> The AI handles the
              pedagogy — you just follow the steps.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0">&#128118;</span>
            <span>
              <strong>Mixed ages welcome.</strong> Every plan includes
              easier and harder modifications so siblings can work together.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0">&#128176;</span>
            <span>
              <strong>Budget-friendly.</strong> Plans use supplies you
              already have and show real prices for anything you need to buy.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0">&#128214;</span>
            <span>
              <strong>Portfolio-ready.</strong> Print your lesson plans for
              annual reviews and documentation.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0">&#9200;</span>
            <span>
              <strong>30 seconds, not 30 minutes.</strong> More time
              creating art, less time planning it.
            </span>
          </li>
        </ul>
      </section>

      {/* vs Traditional */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          ArtSpark vs. traditional art curriculum
        </h2>
        <div className="overflow-hidden rounded-2xl ring-1 ring-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-3 text-left font-semibold text-gray-700" />
                <th className="py-2 px-3 text-center font-semibold text-gray-700">
                  Traditional
                </th>
                <th className="py-2 px-3 text-center font-semibold text-crayon-red">
                  ArtSpark
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ["Cost", "$200-400/yr", "Free"],
                ["Personalized", "No", "Yes"],
                ["Uses your supplies", "No", "Yes"],
                ["Mixed-age friendly", "Rarely", "Always"],
                ["Prep time", "30+ min", "30 sec"],
                ["Inspiration source", "Fixed curriculum", "Anything"],
              ].map(([label, trad, spark]) => (
                <tr key={label} className="bg-white">
                  <td className="py-2 px-3 font-medium text-gray-700">
                    {label}
                  </td>
                  <td className="py-2 px-3 text-center text-gray-500">
                    {trad}
                  </td>
                  <td className="py-2 px-3 text-center font-semibold text-crayon-red">
                    {spark}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-3 rounded-[28px] bg-white/60 p-6 ring-1 ring-amber-200">
        <h2
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "marker felt, comic sans ms, cursive" }}
        >
          Ready to make art easy?
        </h2>
        <p className="text-sm text-gray-600">
          No signup required. Just snap a photo and go.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-crayon-red px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-red-700"
        >
          Create Your First Lesson Plan
        </Link>
      </section>

      {/* SEO content */}
      <section className="space-y-2 text-xs text-gray-500 leading-5">
        <p>
          ArtSpark is a free AI-powered art curriculum generator designed for
          homeschool families. Whether you follow Charlotte Mason, classical,
          Waldorf, or unschooling approaches, ArtSpark creates personalized
          art lesson plans that fit your style. Each plan includes learning
          objectives, step-by-step instructions, a priced supply list with
          Amazon links, safety notes, and modifications for different ages and
          abilities.
        </p>
      </section>
    </div>
  );
}
