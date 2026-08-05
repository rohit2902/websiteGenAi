import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Monitor, Tablet, Smartphone, RotateCw, Globe } from "lucide-react";

function FullscreenPreviewModal({ isOpen, onClose, code, title }) {
  const [viewportMode, setViewportMode] = useState("desktop");
  const iframeRef = useRef(null);

  if (!isOpen) return null;

  const handleRefresh = () => {
    if (iframeRef.current && code) {
      iframeRef.current.srcdoc = code;
    }
  };

  const viewportWidths = {
    desktop: "w-full h-full",
    tablet: "w-[768px] h-[92%] rounded-2xl border border-white/20 shadow-2xl overflow-hidden my-auto",
    mobile: "w-[375px] h-[88%] rounded-3xl border border-white/20 shadow-2xl overflow-hidden my-auto",
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-[#050507] text-white overflow-hidden">
        {/* Fullscreen Top Bar */}
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-6 bg-black/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-purple-400" />
            <h2 className="text-sm font-semibold truncate max-w-xs">{title || "Live Website Preview"}</h2>
            <span className="rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-[11px] font-medium text-green-400">
              Live Interactive
            </span>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
            <button
              onClick={() => setViewportMode("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition ${
                viewportMode === "desktop" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Monitor size={14} />
              Desktop
            </button>
            <button
              onClick={() => setViewportMode("tablet")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition ${
                viewportMode === "tablet" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Tablet size={14} />
              Tablet
            </button>
            <button
              onClick={() => setViewportMode("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition ${
                viewportMode === "mobile" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Smartphone size={14} />
              Mobile
            </button>
          </div>

          {/* Refresh & Close */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition"
            >
              <RotateCw size={14} />
              Refresh
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 p-2 text-zinc-400 hover:bg-white/20 hover:text-white transition"
              title="Exit Fullscreen"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Fullscreen Canvas Container */}
        <div className="flex-1 flex items-center justify-center p-4 bg-[#08080c] overflow-hidden relative">
          <div className={`transition-all duration-300 ease-in-out flex items-center justify-center ${viewportWidths[viewportMode]}`}>
            <iframe
              ref={iframeRef}
              srcDoc={code || "<html><body></body></html>"}
              title="Fullscreen Preview"
              className="h-full w-full border-none bg-white rounded-lg shadow-2xl"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default FullscreenPreviewModal;
