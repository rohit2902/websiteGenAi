import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  Globe,
  Terminal,
  Check,
} from "lucide-react";

const DEPLOY_STEPS = [
  "Preparing Project Files & Environment...",
  "Uploading Assets & Source Code...",
  "Building Production Bundle with Vite...",
  "Deploying to Edge Network Global CDN...",
  "Deployment Successful! ✅",
];

function DeployModal({ isOpen, onClose, onDeploy, website }) {
  const [selectedTarget, setSelectedTarget] = useState("vercel"); // 'vercel' | 'netlify'
  const [isDeploying, setIsDeploying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [logs, setLogs] = useState([]);
  const [deployResultUrl, setDeployResultUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsDeploying(false);
      setStepIndex(0);
      setLogs([]);
      setDeployResultUrl("");
      setError("");
    }
  }, [isOpen]);

  const handleStartDeploy = async () => {
    setIsDeploying(true);
    setError("");
    setStepIndex(0);
    setLogs(["[system] Initializing one-click deployment pipeline..."]);

    // Animate deployment steps & logs
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < DEPLOY_STEPS.length - 1) {
        setStepIndex(currentStep);
        setLogs((prev) => [
          ...prev,
          `[builder] ${DEPLOY_STEPS[currentStep]}`,
        ]);
      } else {
        clearInterval(interval);
      }
    }, 1200);

    try {
      const res = await onDeploy(selectedTarget);
      clearInterval(interval);
      setStepIndex(DEPLOY_STEPS.length - 1);
      setLogs((prev) => [
        ...prev,
        `[builder] ${DEPLOY_STEPS[DEPLOY_STEPS.length - 1]}`,
        `[system] Deployed Live URL: ${res.deployUrl}`,
      ]);
      setDeployResultUrl(res.deployUrl);
    } catch (err) {
      clearInterval(interval);
      setError(err.message || "Deployment failed. Please check network connection.");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopyUrl = () => {
    if (deployResultUrl) {
      navigator.clipboard.writeText(deployResultUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0f] p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3">
                <Rocket className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Deploy Website</h2>
                <p className="text-xs text-zinc-400">One-click instant deployment to global Edge CDN</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isDeploying}
              className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Target Platform Selector */}
          {!deployResultUrl && !isDeploying && !error && (
            <div className="mb-8">
              <label className="block text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
                Select Hosting Platform
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedTarget("vercel")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 transition ${
                    selectedTarget === "vercel"
                      ? "border-purple-500 bg-purple-500/10 text-white"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center border border-white/20">
                    <span className="text-xs font-bold font-mono">▲</span>
                  </div>
                  <span className="text-sm font-semibold">Vercel</span>
                  <span className="text-[11px] text-zinc-500">.vercel.app</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTarget("netlify")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 transition ${
                    selectedTarget === "netlify"
                      ? "border-cyan-500 bg-cyan-500/10 text-white"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-cyan-950 flex items-center justify-center border border-cyan-500/30">
                    <Globe size={16} className="text-cyan-400" />
                  </div>
                  <span className="text-sm font-semibold">Netlify</span>
                  <span className="text-[11px] text-zinc-500">.netlify.app</span>
                </button>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleStartDeploy}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3.5 font-semibold text-white transition hover:scale-105"
                >
                  <Rocket size={18} />
                  Deploy to {selectedTarget === "vercel" ? "Vercel" : "Netlify"}
                </button>
              </div>
            </div>
          )}

          {/* Progress / Terminal Logs View */}
          {(isDeploying || (logs.length > 0 && !deployResultUrl && !error)) && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>{DEPLOY_STEPS[stepIndex]}</span>
                <span className="text-purple-400">{Math.round(((stepIndex + 1) / DEPLOY_STEPS.length) * 100)}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden mb-6 border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  animate={{ width: `${((stepIndex + 1) / DEPLOY_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Live Terminal Window */}
              <div className="rounded-2xl border border-white/10 bg-black/80 p-4 font-mono text-xs text-zinc-300 h-44 overflow-y-auto space-y-1.5 shadow-inner">
                <div className="flex items-center gap-2 text-zinc-500 border-b border-white/10 pb-2 mb-2">
                  <Terminal size={14} />
                  <span>Deployment Logs</span>
                </div>
                {logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log.includes("Successful") || log.includes("Deployed") ? (
                      <span className="text-green-400 font-semibold">{log}</span>
                    ) : (
                      <span className="text-zinc-300">{log}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error View */}
          {error && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="mb-3 rounded-full border border-red-500/30 bg-red-500/10 p-3 text-red-400">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Deployment Error</h3>
              <p className="text-xs text-zinc-400 mb-6">{error}</p>
              <button
                onClick={handleStartDeploy}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 transition"
              >
                <RefreshCw size={14} />
                Retry Deployment
              </button>
            </div>
          )}

          {/* Success View */}
          {deployResultUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-2"
            >
              <div className="mb-4 rounded-full border border-green-500/30 bg-green-500/10 p-4 text-green-400">
                <CheckCircle2 size={40} />
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">Deployment Successful! ✅</h2>
              <p className="text-xs text-zinc-400 mb-6">
                Your website is now live and accessible globally on the Web.
              </p>

              {/* URL Display Box */}
              <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 mb-6 flex items-center justify-between gap-3">
                <span className="truncate font-mono text-sm text-purple-300">{deployResultUrl}</span>
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy URL"}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                <a
                  href={deployResultUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition"
                >
                  <ExternalLink size={16} />
                  Open Website
                </a>

                <button
                  onClick={handleStartDeploy}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  <RefreshCw size={16} />
                  Redeploy
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default DeployModal;
