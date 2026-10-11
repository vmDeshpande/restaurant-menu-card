"use client";

import { motion } from "framer-motion";

export function Hero({ name, description }: { name: string; description: string }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#202020]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-[#ffb51b]/20 sm:right-[8%] sm:top-[-12rem] sm:h-[34rem] sm:w-[34rem]" />
        <div className="absolute -right-8 -top-20 h-64 w-64 rounded-full border border-[#ffb51b]/15 sm:right-[12%] sm:top-[-9rem] sm:h-[27rem] sm:w-[27rem]" />
      </div>
      <div className="relative mx-auto flex min-h-[440px] max-w-6xl flex-col items-center justify-center px-5 py-24 text-center sm:min-h-[520px] sm:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffcf69]">A table worth gathering around</span>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[1.08] tracking-[-0.035em] text-[#f5f3ee] sm:text-6xl md:text-7xl">
            {name}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
            {description}
          </p>
          <a href="#menu" className="mt-9 inline-flex items-center gap-3 border-b border-[#ffb51b] pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffcf69] transition-colors hover:text-white">
            Discover our menu <span aria-hidden="true">↓</span>
          </a>
        </motion.div>
        <div aria-hidden="true" className="absolute bottom-7 left-1/2 h-8 w-px bg-[#ffb51b]/60" />
      </div>
    </section>
  );
}
