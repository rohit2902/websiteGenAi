import React from "react";
import {
  Sparkles,
  Wand2,
  Code2,
  Monitor,
  Rocket,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useSelector } from "react-redux";
import LoginModal from "../components/LoginModal";


const features = [
  {
    icon: <Sparkles size={28} />,
    title: "AI Website Generation",
    description:
      "Generate beautiful, production-ready websites from a simple text prompt within seconds.",
  },
  {
    icon: <Code2 size={28} />,
    title: "Clean Source Code",
    description:
      "Receive well-structured HTML, CSS, and JavaScript that you can edit and deploy.",
  },
  {
    icon: <Monitor size={28} />,
    title: "Live Preview",
    description:
      "Preview every generated website instantly before downloading or deploying.",
  },
  {
    icon: <Rocket size={28} />,
    title: "One-Click Deployment",
    description:
      "Deploy your generated website directly from the platform with minimal effort.",
  },
  {
    icon: <Wand2 size={28} />,
    title: "AI Regeneration",
    description:
      "Describe the changes you want and let AI update your website automatically.",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Secure Platform",
    description:
      "Your projects and account remain protected with secure authentication and cloud storage.",
  },
];

const steps = [
  {
    step: "01",
    title: "Describe Your Website",
    description:
      "Tell the AI what type of website you want to create.",
  },
  {
    step: "02",
    title: "Generate Instantly",
    description:
      "GenWeb.ai creates a responsive website with modern UI and animations.",
  },
  {
    step: "03",
    title: "Customize",
    description:
      "Edit the generated website using AI or manually update the source code.",
  },
  {
    step: "04",
    title: "Deploy",
    description:
      "Publish your website with one click and share it with the world.",
  },
];

const LearnMore = () => {
    const navigate = useNavigate()
     const { user } = useSelector((state) => state.auth);
  const [openLogin, setOpenLogin] = useState(false);
  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Sparkles size={16} />
          Learn More
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mt-8 leading-tight">
          Build Stunning Websites
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Powered by AI
          </span>
        </h1>

        <p className="max-w-3xl mx-auto mt-6 text-zinc-400 text-lg">
          GenWeb.ai transforms simple text prompts into modern, responsive,
          production-ready websites with live preview, editable source code,
          and one-click deployment.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <button

            onClick={() => {
                if (user) {
                   navigate("/pricing");
                } else {
                  setOpenLogin(true);
                }
              }}

            
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold hover:scale-105 transition"
          >
            View Pricing
          </button>

          <button
              onClick={() => {
                if (user) {
                   navigate("/dashboard");
                } else {

                    setOpenLogin(true);
                    if(setOpenLogin(true)){
                         navigate("/dashboard");
                    }
                  
                }
              }}
            
            className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            Start Building
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-4xl font-bold text-center mb-12">
          Everything You Need
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 hover:border-indigo-500 transition"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-semibold mt-6">
                {feature.title}
              </h3>

              <p className="text-zinc-400 mt-4">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-14">
          How It Works
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item) => (
            <div
              key={item.step}
              className="rounded-3xl bg-white/5 border border-white/10 p-8"
            >
              <span className="text-indigo-400 text-5xl font-bold">
                {item.step}
              </span>

              <h3 className="text-xl font-semibold mt-6">
                {item.title}
              </h3>

              <p className="text-zinc-400 mt-3">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-12 text-center">
          <h2 className="text-4xl font-bold">
            Ready to Build Your Next Website?
          </h2>

          <p className="text-zinc-400 mt-5 max-w-2xl mx-auto">
            Start generating beautiful AI-powered websites today. Create,
            customize, preview, and deploy—all from one platform.
          </p>

          <button
            onClick={()=>navigate("/dashboard")}
            className="inline-flex items-center gap-2 mt-8 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold hover:scale-105 transition"
          >
            Start Now
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
        {openLogin && (
        <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      )}
    </div>
  );
};

export default LearnMore;