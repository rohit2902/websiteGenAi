import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  PlusCircle,
  Globe,
  ExternalLink,
  Zap,
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  Search,
  Sparkles,
} from "lucide-react";
import useWebsite from "../hook/useWebsite";
import UserCreditBadge from "../../../components/UserCreditBadge";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    websites,
    loading,
    userCredits,
    handleGetUserWebsites,
    handleRenameWebsite,
    handleDeleteWebsite,
    handleDuplicateWebsite,
  } = useWebsite();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [renamingProject, setRenamingProject] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    handleGetUserWebsites();
  }, []);

  const handleOpenRename = (project) => {
    setRenamingProject(project);
    setNewTitle(project.title);
    setActiveMenuId(null);
  };

  const handleConfirmRename = async () => {
    if (!newTitle.trim() || !renamingProject) return;
    try {
      await handleRenameWebsite(renamingProject._id || renamingProject.id, newTitle);
      setRenamingProject(null);
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  const handleDuplicate = async (id) => {
    setActiveMenuId(null);
    try {
      await handleDuplicateWebsite(id);
    } catch (err) {
      console.error("Duplicate error:", err);
    }
  };

  const handleDelete = async (id) => {
    setActiveMenuId(null);
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await handleDeleteWebsite(id);
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const filteredProjects = websites?.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navbar */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="rounded-lg p-2 transition hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>

            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              Dashboard
            </h1>
          </div>

          

          <div className="flex items-center gap-4">
             
            <UserCreditBadge
              credit={user?.credit ?? userCredits ?? 0}
              plan={user?.plan}
              onClick={() => navigate("/pricing")}
            />

            <button
              onClick={() => navigate("/generate")}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2 font-semibold text-black transition hover:bg-zinc-200 hover:scale-105"
            >
              <PlusCircle size={18} />
              New Website
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-zinc-400">Welcome Back 👋</p>
            <h1 className="mt-1 text-4xl font-bold">{user?.name || "Developer"}</h1>
          </motion.div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              placeholder="Search websites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        {/* Project Grid */}
        {loading && (!websites || websites.length === 0) ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          </div>
        ) : !filteredProjects || filteredProjects.length === 0 ? (
          <div className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5">
            <Globe size={48} className="mb-4 text-zinc-600" />
            <h2 className="text-xl font-semibold">No Websites Found</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {searchQuery
                ? "No website matches your search."
                : "Create your first AI generated website in seconds."}
            </p>
            <button
              onClick={() => navigate("/generate")}
              className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-500 transition"
            >
              Create Website
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const projectId = project._id || project.id;
              return (
                <motion.div
                  whileHover={{ y: -4 }}
                  key={projectId}
                  className="relative rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 transition hover:border-purple-500/40"
                >
                  {/* Card Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe size={20} className="text-purple-400" />
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 border border-green-500/20">
                        {project.status || "Active"}
                      </span>
                    </div>

                    {/* Menu Button */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === projectId ? null : projectId)
                        }
                        className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Options Dropdown */}
                      {activeMenuId === projectId && (
                        <div className="absolute right-0 top-8 z-50 w-44 rounded-2xl border border-white/10 bg-[#111116] p-1.5 shadow-2xl backdrop-blur-xl">
                          <button
                            onClick={() => handleOpenRename(project)}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 transition"
                          >
                            <Edit3 size={14} />
                            Rename Project
                          </button>
                          <button
                            onClick={() => handleDuplicate(projectId)}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 transition"
                          >
                            <Copy size={14} />
                            Duplicate Project
                          </button>
                          <button
                            onClick={() => handleDelete(projectId)}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition"
                          >
                            <Trash2 size={14} />
                            Delete Project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <h2 className="mb-2 truncate text-xl font-semibold">{project.title}</h2>
                  <p className="mb-6 line-clamp-2 text-xs text-zinc-400">
                    {project.prompt || "No prompt description"}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/workspace/${projectId}`)}
                      className="flex-1 rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white transition hover:bg-purple-600"
                    >
                      Open Workspace
                    </button>

                    {project.deployed && (
                      <a
                        href={project.deployUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-white/10 p-2.5 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      <AnimatePresence>
        {renamingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0e0e12] p-6 shadow-2xl"
            >
              <h2 className="mb-4 text-lg font-semibold">Rename Project</h2>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter project name..."
                className="mb-6 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm outline-none transition focus:border-purple-500/50"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRenamingProject(null)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRename}
                  className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 transition"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;