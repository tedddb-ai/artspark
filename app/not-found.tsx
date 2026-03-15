import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <h2 className="text-lg font-semibold text-gray-900">Page not found</h2>
      <p className="mt-2 text-sm text-gray-600">
        This page doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-200"
      >
        Go home
      </Link>
    </div>
  );
}
