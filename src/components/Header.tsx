import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          EnglishCoach
        </Link>
      </div>
    </header>
  );
}
