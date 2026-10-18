"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onSubmit: (url: string) => void;
}

export default function UrlForm({ onSubmit }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const isValidYoutubeUrl = (input: string) => {
    return /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{11}/.test(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    if (!isValidYoutubeUrl(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }
    setError("");
    onSubmit(url.trim());
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="glass-card glow p-6 flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <label htmlFor="youtube-url" className="text-sm font-medium text-gray-300">
        YouTube Video URL
      </label>
      <div className="flex gap-3">
        <input
          id="youtube-url"
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(""); }}
          placeholder="https://www.youtube.com/watch?v=..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          aria-describedby="url-error"
        />
        <button type="submit" className="gradient-btn whitespace-nowrap" aria-label="Analyze video">
          Analyze Video
        </button>
      </div>
      {error && (
        <motion.p
          id="url-error"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </motion.form>
  );
}
