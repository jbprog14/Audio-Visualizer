/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState, useRef, useEffect} from "react";

const AudioVisualizer = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [visualizerType, setVisualizerType] = useState<
    "bars" | "wave" | "circular" | "flashing"
  >("bars");
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Process the audio file
  const processFile = (file: File) => {
    setAudioFile(file);

    // Revoke previous URL to prevent memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    // Reset playing state
    setIsPlaying(false);

    // Clean up previous audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if it's an audio file
      if (file.type.startsWith("audio/")) {
        processFile(file);
      } else {
        alert("Please upload an audio file (MP3, WAV, OGG, etc.)");
      }
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      audioRef.current.play();
      setupAudioContext();
      animateVisualizer();
    }

    setIsPlaying(!isPlaying);
  };

  // Set up audio context and analyzer
  const setupAudioContext = () => {
    if (!audioRef.current || audioContextRef.current) return;

    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;
    const source = audioContext.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;
  };

  // Animate the visualizer based on the selected type
  const animateVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);

      if (visualizerType === "bars") {
        drawBars(ctx, dataArray, bufferLength, width, height);
      } else if (visualizerType === "wave") {
        drawWave(ctx, dataArray, bufferLength, width, height);
      } else if (visualizerType === "circular") {
        drawCircular(ctx, dataArray, bufferLength, width, height);
      } else if (visualizerType === "flashing") {
        drawFlashing(ctx, dataArray, bufferLength, width, height);
      }
    };

    draw();
  };

  // Draw bar visualizer
  const drawBars = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    bufferLength: number,
    width: number,
    height: number
  ) => {
    const barWidth = (width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;

      // Create gradient for bars
      const gradient = ctx.createLinearGradient(
        0,
        height,
        0,
        height - barHeight
      );
      gradient.addColorStop(0, "#4f46e5");
      gradient.addColorStop(0.5, "#8b5cf6");
      gradient.addColorStop(1, "#ec4899");

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  // Draw wave visualizer
  const drawWave = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    bufferLength: number,
    width: number,
    height: number
  ) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#8b5cf6";

    ctx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Add glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#8b5cf6";
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  // Draw circular visualizer
  const drawCircular = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    bufferLength: number,
    width: number,
    height: number
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.stroke();

    const angleStep = (2 * Math.PI) / bufferLength;

    for (let i = 0; i < bufferLength; i++) {
      const amplitude = dataArray[i] / 255;
      const barHeight = radius * amplitude * 0.5;

      const angle = i * angleStep;

      const x1 = centerX + radius * Math.cos(angle);
      const y1 = centerY + radius * Math.sin(angle);

      const x2 = centerX + (radius + barHeight) * Math.cos(angle);
      const y2 = centerY + (radius + barHeight) * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      // Create gradient for lines
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, "#3b82f6");
      gradient.addColorStop(1, "#ec4899");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  // Draw flashing lights visualizer
  const drawFlashing = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    bufferLength: number,
    width: number,
    height: number
  ) => {
    // Calculate average frequency value to determine intensity
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    const intensity = average / 255;

    // Create multiple flashing lights based on frequency data
    const numLights = 12;
    const lightRadius = Math.min(width, height) / 10;

    // Clear with a semi-transparent black for trail effect
    ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + (1 - intensity) * 0.3})`;
    ctx.fillRect(0, 0, width, height);

    // Draw lights
    for (let i = 0; i < numLights; i++) {
      // Use different frequency bands for different lights
      const freqIndex = Math.floor(i * (bufferLength / numLights));
      const freqValue = dataArray[freqIndex] / 255;

      // Skip drawing lights with very low frequency values
      if (freqValue < 0.05) continue;

      // Position lights in a circle
      const angle = (i / numLights) * Math.PI * 2;
      const distance = Math.min(width, height) * 0.3 * (0.5 + freqValue * 0.5);
      const x = width / 2 + Math.cos(angle) * distance;
      const y = height / 2 + Math.sin(angle) * distance;

      // Size based on frequency
      const size = lightRadius * (0.5 + freqValue * 1.5);

      // Color based on frequency
      const hue = (i * 30 + Date.now() / 50) % 360;

      // Create radial gradient for each light
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${freqValue * 0.9})`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Add glow effect
      ctx.shadowBlur = 20 * freqValue;
      ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw center light
    const centerGradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      lightRadius * 2 * intensity
    );
    centerGradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.8})`);
    centerGradient.addColorStop(0.5, `rgba(180, 120, 255, ${intensity * 0.5})`);
    centerGradient.addColorStop(1, "rgba(100, 0, 255, 0)");

    ctx.beginPath();
    ctx.fillStyle = centerGradient;
    ctx.arc(width / 2, height / 2, lightRadius * 2, 0, Math.PI * 2);
    ctx.fill();
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Update canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full p-6 bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl shadow-xl border border-white/10">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Audio Visualizer
        </h2>

        {/* File upload with drag and drop */}
        <div className="mb-6">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              isDragging
                ? "border-indigo-400 bg-indigo-900/30"
                : "border-indigo-400/50 hover:bg-indigo-900/20"
            }`}
          >
            <label
              htmlFor="audio-upload"
              className="flex flex-col items-center justify-center w-full cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="w-10 h-10 text-indigo-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  ></path>
                </svg>
                <p className="text-sm text-indigo-300">
                  {audioFile
                    ? audioFile.name
                    : isDragging
                    ? "Drop audio file here"
                    : "Click or drag to upload audio file"}
                </p>
                <p className="text-xs text-indigo-400/70 mt-1">
                  MP3, WAV, OGG supported
                </p>
              </div>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {/* Visualizer type selector */}
        <div className="flex flex-wrap justify-center mb-6 gap-2">
          <button
            onClick={() => setVisualizerType("bars")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              visualizerType === "bars"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/50"
            }`}
          >
            Bars
          </button>
          <button
            onClick={() => setVisualizerType("wave")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              visualizerType === "wave"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/50"
            }`}
          >
            Wave
          </button>
          <button
            onClick={() => setVisualizerType("circular")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              visualizerType === "circular"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/50"
            }`}
          >
            Circular
          </button>
          <button
            onClick={() => setVisualizerType("flashing")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              visualizerType === "flashing"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/50"
            }`}
          >
            Flashing Lights
          </button>
        </div>

        {/* Canvas for visualization */}
        <div className="relative w-full aspect-[16/9] mb-6">
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-lg bg-black/30"
          />

          {!audioFile && (
            <div className="absolute inset-0 flex items-center justify-center text-indigo-300/70">
              Upload an audio file to start
            </div>
          )}
        </div>

        {/* Audio controls */}
        {audioUrl && (
          <div className="flex justify-center">
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              {isPlaying ? (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Hidden audio element */}
        <audio ref={audioRef} src={audioUrl || undefined} />
      </div>
    </div>
  );
};

export default AudioVisualizer;
