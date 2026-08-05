import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { RxCross2 } from "react-icons/rx";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../service/fireBase";

import { useSelector } from "react-redux";
import useAuth from "../hook/useAuth.js";

const LoginModal = ({ open, onClose }) => {
  
  const {handleLogin} = useAuth()
 

   const googleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
        await handleLogin({
          name:result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL

        })

     console.log(result.user.displayName)
     console.log(result.user.email)
  } catch (error) {
    console.log(error.message);
  }
};

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ duration: 0.35 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0b0b] p-8 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <RxCross2  size={20} />
            </button>

            {/* Heading */}
            <h2 className="text-center text-3xl font-bold text-white">
              Welcome Back
            </h2>

            <p className="mt-3 text-center text-zinc-400">
              Sign in to continue building amazing websites with AI.
            </p>

            {/* Google Button */}
            <button
            onClick={googleLogin}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-5 py-3 font-medium text-black transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-100"
            >
              <FcGoogle size={24} />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="px-4 text-sm text-zinc-500">or</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-zinc-500">
              By continuing, you agree to our{" "}
              <span className="cursor-pointer text-purple-400 hover:underline">
                Terms
              </span>{" "}
              and{" "}
              <span className="cursor-pointer text-purple-400 hover:underline">
                Privacy Policy
              </span>.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;