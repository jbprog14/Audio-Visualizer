"use client";

import dynamic from "next/dynamic";

// Dynamically import the AudioVisualizer component with no SSR
// This is necessary because the Web Audio API is only available in the browser
const AudioVisualizer = dynamic(() => import("./components/AudioVisualizer"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 mb-2">
            Audio Visualizer
          </h1>
          <p className="text-indigo-200/80 max-w-2xl mx-auto">
            Upload your audio file and watch it come to life with beautiful
            visualizations. Choose between different visualization styles for a
            unique experience.
          </p>
        </header>

        <AudioVisualizer />

        <footer className="mt-12 text-center text-indigo-300/60 text-sm">
          <p>Created with Next.js and Web Audio API</p>
        </footer>
      </div>
    </div>
  );
}
