"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function HeroSection() {
  return (
    <motion.section
      className="relative z-10 py-20 text-center"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.h1
        className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        variants={item}
      >
        The cost of living is changing how we live.
      </motion.h1>
      <motion.p
        className="mx-auto mt-6 max-w-xl text-lg text-muted"
        variants={item}
      >
        Share your experience anonymously. Our AI turns individual voices into
        a collective picture of what communities are really going through.
      </motion.p>
      <motion.div variants={item}>
        <Link
          href="/submit"
          className="mt-8 inline-block rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-warm-lg active:scale-[0.98]"
        >
          Add Your Voice &mdash; 90 seconds, anonymous
        </Link>
      </motion.div>
    </motion.section>
  );
}
