"use client";

import { motion } from "framer-motion";

interface Props {
  message: string;
  type: "error" | "success";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 50, x: "-50%" }}
      className={`fixed bottom-6 left-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-md border ${
        type === "error"
          ? "bg-red-500/10 border-red-500/30 text-red-300"
          : "bg-green-500/10 border-green-500/30 text-green-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <span>{type === "error" ? "❌" : "✅"}</span>
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white/50 hover:text-white" aria-label="Dismiss">
          ✕
        </button>
      </div>
    </motion.div>
  );
}
