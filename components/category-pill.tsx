import Link from "next/link";
import { motion } from "framer-motion";

export function CategoryPill({ label, active, href }: { label: string; active?: boolean; href: string }) {
  return (
    <Link href={href} className="relative">
      <motion.span
        whileHover={{ y: -2 }}
        className={`inline-flex items-center border-b px-1 py-2 text-sm font-semibold uppercase tracking-[0.1em] transition ${
          active ? "border-[#ffb51b] text-[#ffcf69]" : "border-transparent text-white/70 hover:border-[#ffb51b]/60 hover:text-white"
        }`}
      >
        {label}
      </motion.span>
      {active && (
        <motion.span layoutId="active" className="absolute -bottom-px left-0 h-px w-full bg-[#ffb51b]" />
      )}
    </Link>
  );
}