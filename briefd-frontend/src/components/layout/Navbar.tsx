import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-[#E2E8F0] bg-white sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight text-[#0F172A]">
          briefd
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/contact"
            className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition"
          >
            Contact
          </Link>

          <Link
            href="/experience"
            className="px-5 py-2 bg-[#D14E17] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            Run Analysis
          </Link>
        </div>
      </div>
    </nav>
  );
}
