"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-800">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-red-600">
          Try refreshing the page or going back to the home screen.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-200"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
