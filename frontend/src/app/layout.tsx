import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTube ChatBot – Ask Questions About Any Video",
  description: "Paste a YouTube URL, and chat with the video using AI-powered RAG.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
