"use client";

import { motion } from "framer-motion";

interface Props {
  videoId: string;
  chunkCount: number;
}

export default function VideoCard({ videoId, chunkCount }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4"
    >
      <div className="relative rounded-xl overflow-hidden border border-white/10 shrink-0">
        <img
          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt="Video thumbnail"
          className="w-28 h-auto object-cover"
        />
        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-green-500/90 text-[11px] font-semibold text-white">
          Ready
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-400">
          <span className="text-white font-medium">{chunkCount}</span> chunks indexed
        </p>
        <p className="text-xs text-gray-500 mt-1 font-mono">{videoId}</p>
      </div>
    </motion.div>
  );
}
