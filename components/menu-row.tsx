"use client";

import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

export function MenuRow({ item, index = 0, currency = "INR" }: { item: MenuItem; index?: number; currency?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ delay: Math.min(index * 0.035, 0.21), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="menu-row group"
    >
      <span className="min-w-0 font-sans text-base font-medium leading-snug tracking-[0.01em] text-current sm:text-lg">
        {item.name}
      </span>
      <span className="shrink-0 font-sans text-sm font-semibold tabular-nums text-current sm:text-base">
        {formatPrice(item.price, currency)}
      </span>
    </motion.div>
  );
}
