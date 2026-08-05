import { AnimatePresence, motion } from "framer-motion";
import Footer from "../components/Footer";
import FeatureSection from "../components/FeatureSection ";
import useAuth from "../hook/useAuth.js";
import { useState } from "react";
import LoginModal from "../components/LoginModal";
import { useSelector } from "react-redux";
import { FiLogOut, FiLayout } from "react-icons/fi";
import { useNavigate } from "react-router";
import About from "./About.jsx";
import UserCreditBadge from "../components/UserCreditBadge.jsx";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [openLogin, setOpenLogin] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const { handleLogout } = useAuth();

  const submitLogOut = async () => {
    try {
      await handleLogout();
      navigate("/");
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040404] text-white">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="text-xl font-semibold tracking-wide cursor-pointer"
          >
            GenWeb.ai
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {!user ? (
              <span
                onClick={() => setOpenLogin(true)}
                className="hidden cursor-pointer text-sm text-zinc-400 transition-colors hover:text-white md:block"
              >
                Pricing
              </span>
            ) : (
              <UserCreditBadge
                credit={user.credit}
                plan={user.plan}
                onClick={() => navigate("/pricing")}
                className="hidden md:inline-flex"
              />
            )}

            {!user ? (
              <button
                onClick={() => setOpenLogin(true)}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-white/10 cursor-pointer"
              >
                Get Started
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setOpenProfile(!openProfile)}
                  className="flex items-center cursor-pointer"
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name || "User"
                      )}`
                    }
                    className="h-9 w-9 rounded-full border border-white/20 object-cover"
                    alt="User avatar"
                  />
                </button>

                <AnimatePresence>
                  {openProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b]/95 shadow-2xl backdrop-blur-xl"
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-4 border-b border-white/10 p-5">
                        <img
                          src={
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name || "User"
                            )}`
                          }
                          alt={user.name}
                          className="h-14 w-14 rounded-full border border-white/20 object-cover"
                        />

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-white">
                            {user.name}
                          </h3>

                          <p className="truncate text-sm text-zinc-400">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Credits & Plan */}
                      <div className="px-5 py-4 flex justify-center border-b border-white/10">
                        <UserCreditBadge
                          credit={user.credit}
                          plan={user.plan}
                          onClick={() => {
                            setOpenProfile(false);
                            navigate("/pricing");
                          }}
                          className="w-full justify-center text-sm py-2"
                        />
                      </div>

                      {/* Menu */}
                      <div className="p-3">
                        <button
                          onClick={() => {
                            setOpenProfile(false);
                            navigate("/dashboard");
                          }}
                          className="cursor-pointer flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-zinc-300 transition hover:bg-white/10 hover:text-white"
                        >
                          <FiLayout className="text-lg" />
                          Dashboard
                        </button>

                        <button
                          onClick={submitLogOut}
                          className="cursor-pointer flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-400 transition hover:bg-red-500/10"
                        >
                          <FiLogOut className="text-lg" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="px-6 pt-44 pb-32 text-center">
        <div className="mx-auto max-w-5xl">
          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold tracking-tight md:text-7xl"
          >
            Build Stunning Websites <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              with AI
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-400"
          >
            Describe your idea and let AI generate a modern, responsive,
            production-ready website in seconds.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button
              className="rounded-lg bg-white px-6 py-3 font-medium text-black transition-all duration-300 hover:scale-105 hover:bg-zinc-200 cursor-pointer"
              onClick={() => {
                if (user) {
                  navigate("/dashboard");
                } else {
                  setOpenLogin(true);
                }
              }}
            >
              {user ? "Go to dashboard" : "Get started"}
            </button>

            <button
              onClick={() => navigate("/pricing")}
              className="rounded-lg border border-white/20 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-white/10 cursor-pointer"
            >
              View Pricing
            </button>
          </motion.div>
        </div>
      </section>

      <FeatureSection />
      <About />
      <Footer />

      {openLogin && (
        <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      )}
    </div>
  );
};

export default Home;
