import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, ArrowLeft, Zap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import useWebsite from "../hook/useWebsite";
import GenerationProgressModal from "../../../components/GenerationProgressModal";
import UserCreditBadge from "../../../components/UserCreditBadge";

function Generate() {
  const navigate = useNavigate();
  const { handleGenerateWebsite, loading, userCredits } = useWebsite();
  const { user } = useSelector((state) => state.auth);
  const [prompt, setPrompt] = useState("");
  const [generationError, setGenerationError] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [targetWebsiteId, setTargetWebsiteId] = useState(null);

  const handleGenerate = async () => {
    if (isGenerating || loading) return;
    setGenerationError("");

    if (!prompt.trim()) {
      return alert("Please enter a website prompt description");
    }

    if (userCredits < 50) {
      setGenerationError("Insufficient Credits! You need at least 50 credits to create a website.");
      return;
    }

    // Open Progress Modal immediately
    setIsGenerating(true);
    setIsSuccess(false);

    try {
      const data = await handleGenerateWebsite(prompt);
      if (data && (data.websiteId || data.website?._id || data.website?.id)) {
        const id = data.websiteId || data.website?._id || data.website?.id;
        setTargetWebsiteId(id);
        setIsSuccess(true); // Triggers progress bar completion to 100%
      } else {
        throw new Error("Invalid response received from website generator");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setGenerationError(err.message || "Failed to generate website. Please try again.");
      setIsSuccess(false);
    }
  };

  const handleCompleteProgress = () => {
    setIsGenerating(false);
    if (targetWebsiteId) {
      navigate(`/workspace/${targetWebsiteId}`);
    }
  };

  const handleRetry = () => {
    setGenerationError("");
    setIsGenerating(false);
    setTimeout(() => {
      handleGenerate();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0b0b0b] to-[#050505] text-white">
      {/* Full Screen AI Generation Progress Modal */}
      <GenerationProgressModal
        isOpen={isGenerating}
        error={generationError}
        isSuccess={isSuccess}
        onComplete={handleCompleteProgress}
        onRetry={handleRetry}
      />

      {/* Navbar */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              disabled={isGenerating}
              className="rounded-lg p-2 transition hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-50"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              GenWeb.ai
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <UserCreditBadge
              credit={user?.credit ?? userCredits ?? 0}
              plan={user?.plan}
              onClick={() => navigate("/pricing")}
            />

            <button
              onClick={() => navigate("/dashboard")}
              disabled={isGenerating}
              className="rounded-xl border border-white/10 px-5 py-2 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="rounded-full border border-purple-500/20 bg-purple-500/10 p-4">
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <h1 className="text-5xl font-bold leading-tight md:text-6xl">
            Build Websites with
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Real AI Power
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Describe your idea in detail and let AI generate a modern, responsive, production-ready
            website in seconds.
          </p>
        </motion.div>

        {/* Prompt Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold">Describe your website</h2>
            <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Cost: 50 Credits
            </span>
          </div>

          <p className="mb-6 text-sm text-zinc-400">
            Be as detailed as possible for better results.
          </p>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading || isGenerating}
            placeholder="Example: Create a modern portfolio website for a full-stack developer with dark theme, hero section, projects, skills, contact form and smooth animations..."
            className="h-56 w-full resize-none rounded-2xl border border-white/10 bg-[#111111] p-6 text-base leading-7 outline-none transition focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
          />

          {generationError && !isGenerating && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {generationError}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <motion.button
              whileHover={{ scale: loading || isGenerating ? 1 : 1.04 }}
              whileTap={{ scale: loading || isGenerating ? 1 : 0.96 }}
              onClick={handleGenerate}
              disabled={loading || isGenerating || !prompt.trim()}
              className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-40"
            >
              {loading || isGenerating ? (
                <>
                  <Loader2 size={22} className="animate-spin text-purple-600" />
                  Generating Website...
                </>
              ) : (
                <>
                  <Wand2 size={22} />
                  Generate Website
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Tips */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 font-semibold">🎨 Design</h3>
            <p className="text-sm text-zinc-400">Mention colors, layout, fonts and animations.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 font-semibold">📄 Sections</h3>
            <p className="text-sm text-zinc-400">
              Include Hero, About, Services, Pricing, Contact or anything you need.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 font-semibold">⚡ Features</h3>
            <p className="text-sm text-zinc-400">
              Add responsive layout, forms, animations, and SPA navigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Generate;