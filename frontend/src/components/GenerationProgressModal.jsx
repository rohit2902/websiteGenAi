import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, Layers, Code, Palette, Cpu, Rocket } from "lucide-react";

const STEPS = [
  { label: "Initializing AI Engine...", icon: Cpu, threshold: 10 },
  { label: "Understanding your requirements...", icon: Sparkles, threshold: 30 },
  { label: "Designing UI & Color Palette...", icon: Palette, threshold: 50 },
  { label: "Creating Components & Structure...", icon: Layers, threshold: 70 },
  { label: "Optimizing Layout & Responsiveness...", icon: Code, threshold: 90 },
  { label: "Finalizing Website...", icon: Rocket, threshold: 100 },
];

function GenerationProgressModal({ isOpen, error, onRetry, isSuccess, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState(12);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setEstimatedSeconds(12);
      return;
    }

    if (error) return;

    // Smooth progress simulation while waiting for API
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92 && !isSuccess) {
          return 92; // Hold at 92% until API succeeds
        }
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 120);

    const timerInterval = setInterval(() => {
      setEstimatedSeconds((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timerInterval);
    };
  }, [isOpen, error, isSuccess]);

  // When API succeeds, drive progress to 100% and notify completion
  useEffect(() => {
    if (isSuccess && isOpen) {
      setProgress(100);
      const timeout = setTimeout(() => {
        if (onComplete) onComplete();
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess, isOpen]);

  if (!isOpen) return null;

  const currentStepIndex = STEPS.findIndex((step) => progress < step.threshold);
  const activeStep = currentStepIndex !== -1 ? STEPS[currentStepIndex] : STEPS[STEPS.length - 1];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0f] p-8 shadow-2xl"
        >
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          {error ? (
            /* ERROR STATE */
            <div className="flex flex-col items-center text-center py-6">
              <div className="mb-4 rounded-full border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                <AlertCircle size={40} />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Generation Failed</h2>
              <p className="max-w-md text-sm text-zinc-400 mb-6">{error}</p>

              <button
                onClick={onRetry}
                className="flex items-center gap-2 rounded-2xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 hover:scale-105"
              >
                <RefreshCw size={18} />
                Retry Generation
              </button>
            </div>
          ) : (
            /* GENERATING PROGRESS STATE */
            <div className="flex flex-col items-center text-center">
              {/* Header Icon */}
              <div className="relative mb-6 flex items-center justify-center">
                <div className="h-20 w-20 rounded-3xl border border-purple-500/30 bg-purple-500/10 flex items-center justify-center">
                  <activeStep.icon className="h-10 w-10 text-purple-400 animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500" />
                </span>
              </div>

              {/* Dynamic Status Title */}
              <motion.h2
                key={activeStep.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white mb-2"
              >
                {activeStep.label}
              </motion.h2>

              <p className="text-xs text-zinc-400 mb-8">
                Estimated time remaining: <span className="text-purple-400 font-medium">{estimatedSeconds}s</span>
              </p>

              {/* Progress Bar Container */}
              <div className="w-full mb-8">
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 mb-2">
                  <span>Generating Website</span>
                  <span className="text-purple-400 font-mono">{progress}%</span>
                </div>

                <div className="h-3 w-full rounded-full bg-white/5 border border-white/10 p-0.5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeInOut", duration: 0.2 }}
                  />
                </div>
              </div>

              {/* Step Checklist Items */}
              <div className="grid grid-cols-2 gap-3 w-full text-left border-t border-white/10 pt-6">
                {STEPS.map((step, idx) => {
                  const isCompleted = progress >= step.threshold;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 rounded-xl p-2.5 text-xs transition ${
                        isCompleted
                          ? "bg-purple-500/10 border border-purple-500/20 text-purple-300"
                          : isCurrent
                          ? "bg-white/10 border border-white/20 text-white"
                          : "text-zinc-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={15} className="text-purple-400 shrink-0" />
                      ) : (
                        <div
                          className={`h-3.5 w-3.5 rounded-full border shrink-0 ${
                            isCurrent ? "border-purple-400 animate-ping" : "border-zinc-600"
                          }`}
                        />
                      )}
                      <span className="truncate font-medium">{step.label.split("...")[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default GenerationProgressModal;
