"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"

export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: "easeIn" } },
}

export function AnimatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={typeof children === "string" ? children : "page"}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className="min-h-[100vh]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default AnimatedLayout
