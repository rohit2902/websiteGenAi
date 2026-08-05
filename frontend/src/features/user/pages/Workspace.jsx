import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  Code2,
  Eye,
  Sparkles,
  Zap,
  Edit2,
  Check,
  X,
  FileCode,
  Copy,
  ExternalLink,
  Rocket,
  Download,
  Maximize2,
  Save,
  Search,
  Folder,
} from "lucide-react";
import useWebsite from "../hook/useWebsite";
import DeployModal from "../../../components/DeployModal";
import FullscreenPreviewModal from "../../../components/FullscreenPreviewModal";
import UserCreditBadge from "../../../components/UserCreditBadge";
import { useSelector } from "react-redux";

function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    currentWebsite,
    conversation,
    loading,
    isEditing,
    error,
    userCredits,
    handleGetWebsite,
    handleEditWebsite,
    handleRenameWebsite,
    handleDeployWebsite,
    handleDownloadZip,
    handleUpdateFile,
  } = useWebsite();

  const [prompt, setPrompt] = useState("");
  const [viewportMode, setViewportMode] = useState("desktop"); // 'desktop' | 'tablet' | 'mobile'
  const [viewMode, setViewMode] = useState("preview"); // 'preview' | 'code'
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [editedFileContent, setEditedFileContent] = useState("");
  const [isSavingFile, setIsSavingFile] = useState(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [copied, setCopied] = useState(false);

  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  const iframeRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (id) {
      handleGetWebsite(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentWebsite?.latestCode) {
      setIframeLoading(true);
    }
  }, [currentWebsite?.latestCode]);

  useEffect(() => {
    if (currentWebsite?.title) {
      setTitleInput(currentWebsite.title);
    }
  }, [currentWebsite?.title]);

  useEffect(() => {
    if (currentWebsite?.files && currentWebsite.files[activeFileIndex]) {
      setEditedFileContent(currentWebsite.files[activeFileIndex].content || "");
    }
  }, [currentWebsite?.files, activeFileIndex]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isEditing]);

  const handleSendPrompt = async () => {
    if (!prompt.trim() || isEditing) return;

    if (userCredits < 25) {
      alert("Insufficient Credits! You need at least 25 credits to modify the website.");
      return;
    }

    const currentPrompt = prompt;
    setPrompt("");

    try {
      await handleEditWebsite(id, currentPrompt);
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const handleSaveTitle = async () => {
    if (!titleInput.trim() || titleInput === currentWebsite?.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await handleRenameWebsite(id, titleInput);
    } catch (err) {
      console.error("Rename error:", err);
    } finally {
      setIsEditingTitle(false);
    }
  };

  const handleRefreshPreview = () => {
    if (iframeRef.current && currentWebsite?.latestCode) {
      iframeRef.current.srcdoc = currentWebsite.latestCode;
    }
  };

  const handleCopyCode = () => {
    const codeToCopy =
      currentWebsite?.files?.[activeFileIndex]?.content ||
      currentWebsite?.latestCode ||
      "";
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveCodeEdit = async () => {
    const activeFile = currentWebsite?.files?.[activeFileIndex];
    if (!activeFile) return;

    try {
      setIsSavingFile(true);
      await handleUpdateFile(id, activeFile.path, editedFileContent);
      handleRefreshPreview();
    } catch (err) {
      console.error("Save file error:", err);
      alert("Failed to save file changes");
    } finally {
      setIsSavingFile(false);
    }
  };

  const viewportWidths = {
    desktop: "w-full h-full",
    tablet: "w-[768px] h-[90%] rounded-2xl border border-white/20 shadow-2xl overflow-hidden my-auto",
    mobile: "w-[375px] h-[85%] rounded-3xl border border-white/20 shadow-2xl overflow-hidden my-auto",
  };

  const filteredFiles = currentWebsite?.files?.filter((f) =>
    f.path?.toLowerCase().includes(fileSearchQuery.toLowerCase())
  );

  if (loading && !currentWebsite) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050505] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-zinc-400">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505] text-white">
      {/* Deploy Modal */}
      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onDeploy={(target) => handleDeployWebsite(id, target)}
        website={currentWebsite}
      />

      {/* Fullscreen Preview Modal */}
      <FullscreenPreviewModal
        isOpen={isFullscreenModalOpen}
        onClose={() => setIsFullscreenModalOpen(false)}
        code={currentWebsite?.latestCode}
        title={currentWebsite?.title}
      />

      {/* LEFT PANEL: 30% AI CHAT & CONTROL */}
      <div className="flex w-full md:w-[350px] lg:w-[400px] xl:w-[420px] flex-col border-r border-white/10 bg-[#0b0b0b]">
        {/* Workspace Top Header */}
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-4 bg-black/40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-lg p-2 transition hover:bg-white/10 text-zinc-400 hover:text-white"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>

            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="rounded border border-purple-500/50 bg-black/60 px-2 py-1 text-sm font-semibold outline-none text-white"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="rounded p-1 hover:bg-green-500/20 text-green-400"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="rounded p-1 hover:bg-red-500/20 text-red-400"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 max-w-[180px]">
                <h1 className="truncate text-sm font-semibold">
                  {currentWebsite?.title || "Untitled Website"}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-zinc-500 hover:text-zinc-300 transition"
                  title="Rename"
                >
                  <Edit2 size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Credit Badge */}
          <UserCreditBadge
            credit={user?.credit ?? userCredits ?? 0}
            plan={user?.plan}
            onClick={() => navigate("/pricing")}
          />
        </div>

        {/* Chat History Area (ChatGPT Style) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(!conversation || conversation.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-zinc-500">
              <Sparkles size={32} className="mb-2 text-purple-400/60" />
              <p className="text-sm font-medium">Start editing your website</p>
              <p className="text-xs text-zinc-600 mt-1">
                Type instructions below like "Add a dark mode navbar" or "Change theme color to cyan".
              </p>
            </div>
          )}

          {conversation?.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={index}
                className={`flex gap-3 max-w-[90%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {!isUser && (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="text-white" />
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-white/5 border border-white/10 text-zinc-200 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            );
          })}

          {isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 max-w-[90%]"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-white animate-spin" />
              </div>
              <div className="rounded-2xl rounded-bl-none bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-zinc-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
                Updating website files...
              </div>
            </motion.div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Prompt Input Box */}
        <div className="p-3 border-t border-white/10 bg-black/60">
          <div className="relative flex items-center">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe edits (e.g., Change header color to teal)..."
              disabled={isEditing}
              className="w-full resize-none rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 pr-12"
            />
            <button
              onClick={handleSendPrompt}
              disabled={!prompt.trim() || isEditing}
              className="absolute right-3 p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition disabled:opacity-30"
              title="Send prompt (Costs 25 credits)"
            >
              <Send size={16} />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 px-1">
            <span>Press Enter to send</span>
            <span className="text-purple-400 font-medium">Cost: 25 Credits / Edit</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: 70% LIVE PREVIEW & CODE INSPECTOR */}
      <div className="flex flex-1 flex-col bg-[#050505] overflow-hidden">
        {/* Toolbar Header */}
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-6 bg-black/40">
          {/* Viewport Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
            <button
              onClick={() => setViewportMode("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewportMode === "desktop"
                  ? "bg-purple-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Monitor size={15} />
              Desktop
            </button>

            <button
              onClick={() => setViewportMode("tablet")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewportMode === "tablet"
                  ? "bg-purple-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Tablet size={15} />
              Tablet
            </button>

            <button
              onClick={() => setViewportMode("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewportMode === "mobile"
                  ? "bg-purple-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Smartphone size={15} />
              Mobile
            </button>
          </div>

          {/* Controls: Deploy, Download ZIP, Fullscreen, Refresh, View Mode, Copy */}
          <div className="flex items-center gap-2.5">
            {/* Deploy Button */}
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:scale-105"
            >
              <Rocket size={14} />
              Deploy
            </button>

            {/* Download ZIP */}
            <button
              onClick={() => handleDownloadZip(id, currentWebsite?.title)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition"
              title="Download Project ZIP"
            >
              <Download size={14} />
              Export ZIP
            </button>

            {/* Fullscreen Preview Toggle */}
            <button
              onClick={() => setIsFullscreenModalOpen(true)}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
              title="Fullscreen Preview"
            >
              <Maximize2 size={15} />
            </button>

            <button
              onClick={handleRefreshPreview}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition"
              title="Refresh Preview"
            >
              <RotateCw size={14} />
              Refresh
            </button>

            {/* Toggle Preview / Code view */}
            <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition ${
                  viewMode === "preview"
                    ? "bg-white/20 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Eye size={14} />
                Preview
              </button>
              <button
                onClick={() => setViewMode("code")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition ${
                  viewMode === "code"
                    ? "bg-white/20 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Code2 size={14} />
                Editor
              </button>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Main Canvas Container */}
        <div className="flex-1 overflow-hidden p-6 flex items-center justify-center bg-[#070709] relative">
          {viewMode === "preview" ? (
            <div
              className={`transition-all duration-300 ease-in-out flex items-center justify-center relative ${viewportWidths[viewportMode]}`}
            >
              {iframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0e0e14] p-8 text-center rounded-lg border border-white/10">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mb-4" />
                  <p className="text-sm font-semibold text-white mb-1">Rendering Website Preview...</p>
                  <p className="text-xs text-zinc-500">Loading styles, assets & responsive layout</p>
                </div>
              )}
              <iframe
                ref={iframeRef}
                srcDoc={currentWebsite?.latestCode || "<html><body></body></html>"}
                title="Live Website Preview"
                onLoad={() => setIframeLoading(false)}
                className="h-full w-full border-none bg-white rounded-lg shadow-2xl"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            /* Interactive Code Editor with File Explorer */
            <div className="h-full w-full rounded-2xl border border-white/10 bg-[#0e0e12] flex overflow-hidden shadow-2xl">
              {/* File Explorer Sidebar */}
              <div className="w-64 border-r border-white/10 bg-black/40 flex flex-col shrink-0">
                <div className="p-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                    <Folder size={14} className="text-purple-400" />
                    <span>File Explorer</span>
                  </div>
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={fileSearchQuery}
                      onChange={(e) => setFileSearchQuery(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-purple-500/40"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredFiles?.map((file, idx) => {
                    const originalIndex = currentWebsite?.files?.findIndex(
                      (f) => f.path === file.path
                    );
                    const isActive = activeFileIndex === originalIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveFileIndex(originalIndex)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-mono transition ${
                          isActive
                            ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                            : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <FileCode size={14} className={isActive ? "text-purple-400" : "text-zinc-500"} />
                        <span className="truncate">{file.path}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code Editor Area */}
              <div className="flex-1 flex flex-col bg-[#0a0a0f] overflow-hidden">
                {/* Active File Header */}
                <div className="flex h-12 items-center justify-between border-b border-white/10 px-4 bg-black/60">
                  <div className="flex items-center gap-2 font-mono text-xs text-purple-300">
                    <FileCode size={15} />
                    <span>{currentWebsite?.files?.[activeFileIndex]?.path || "index.html"}</span>
                  </div>

                  <button
                    onClick={handleSaveCodeEdit}
                    disabled={isSavingFile}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition disabled:opacity-50"
                  >
                    <Save size={14} />
                    {isSavingFile ? "Saving..." : "Save Changes"}
                  </button>
                </div>

                {/* Editor Textarea with Line Numbers */}
                <div className="flex-1 flex overflow-hidden">
                  <div className="select-none py-4 px-3 text-right font-mono text-xs text-zinc-600 bg-black/40 border-r border-white/5 leading-relaxed">
                    {editedFileContent.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  <textarea
                    value={editedFileContent}
                    onChange={(e) => setEditedFileContent(e.target.value)}
                    className="flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-zinc-200 outline-none overflow-auto"
                    spellCheck="false"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Workspace;
