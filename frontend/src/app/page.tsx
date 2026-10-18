"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UrlForm from "@/components/UrlForm";
import VideoCard from "@/components/VideoCard";
import ChatWindow from "@/components/ChatWindow";
import Toast from "@/components/Toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type AppState = "idle" | "indexing" | "ready";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [chunkCount, setChunkCount] = useState<number>(0);
  const [indexingStep, setIndexingStep] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleIndex = async (url: string) => {
    setAppState("indexing");
    setIndexingStep("Fetching transcript...");

    // Simulate stepped progress
    const stepTimer1 = setTimeout(() => setIndexingStep("Creating chunks..."), 2000);
    const stepTimer2 = setTimeout(() => setIndexingStep("Building knowledge base..."), 4000);

    try {
      const res = await fetch(`${API}/index`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to index video");
      }

      const data = await res.json();
      setVideoId(data.video_id);
      setChunkCount(data.chunks);
      setAppState("ready");
      showToast("Video indexed successfully!", "success");
    } catch (err: unknown) {
      setAppState("idle");
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        showToast("Backend server is offline. Start it with: uvicorn main:app --reload");
      } else if (err instanceof Error) {
        showToast(err.message);
      } else {
        showToast("An unknown error occurred.");
      }
    }
  };

  const handleReset = () => {
    setAppState("idle");
    setVideoId(null);
    setChunkCount(0);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {appState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Powered by Gemini + RAG
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
                  <span className="gradient-text">YouTube</span>{" "}
                  <span className="text-white">ChatBot</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-lg mx-auto">
                  Paste any YouTube video URL and ask questions about it.
                  AI-powered answers grounded in the actual transcript.
                </p>
              </div>
              <UrlForm onSubmit={handleIndex} />
            </motion.div>
          )}

          {appState === "indexing" && (
            <motion.div
              key="indexing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="glass-card glow p-10 text-center w-full max-w-md">
                {/* Spinner */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <p className="text-lg font-semibold text-white mb-2">Analyzing Video</p>
                <motion.p
                  key={indexingStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gray-400"
                >
                  {indexingStep}
                </motion.p>
              </div>
            </motion.div>
          )}

          {appState === "ready" && videoId && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-4 w-full"
            >
              <div className="flex items-center justify-between">
                <VideoCard videoId={videoId} chunkCount={chunkCount} />
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/5"
                  aria-label="Analyze a new video"
                >
                  ← New Video
                </button>
              </div>
              <ChatWindow apiUrl={API} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </main>
  );
}
