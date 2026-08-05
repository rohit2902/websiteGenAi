import React from "react";
import { useNavigate } from "react-router";
import {
  Sparkles,
  Target,
  Eye,
  Rocket,
  Users,
  Code2,
  ArrowRight,
} from "lucide-react";

const About = () => {
    const navigate = useNavigate()
  const values = [
    {
      icon: <Rocket size={28} />,
      title: "Innovation",
      description:
        "We use AI to simplify website creation and help anyone build modern websites in minutes.",
    },
    {
      icon: <Users size={28} />,
      title: "Accessibility",
      description:
        "Our platform is designed for beginners, freelancers, startups, and businesses alike.",
    },
    {
      icon: <Code2 size={28} />,
      title: "Developer Friendly",
      description:
        "Generate clean, editable code that you can customize and deploy anywhere.",
    },
  ];

  return (
    <div className="min-h-screen  bg-[#040404] text-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
          <Sparkles size={16} />
          About GenWeb.ai
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mt-8">
          Building the Future of
          <span className="block bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            AI Website Creation
          </span>
        </h1>

        <p className="max-w-3xl mx-auto mt-6 text-lg text-zinc-400">
          GenWeb.ai empowers creators, developers, startups, and businesses to
          build professional websites using the power of Artificial
          Intelligence. Simply describe your idea, and our AI generates a
          beautiful, responsive website in seconds.
        </p>
      </section>

      {/* Our Story */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
          <h2 className="text-4xl font-bold mb-6">Our Story</h2>

          <p className="text-zinc-400 leading-8">
            Building websites traditionally takes time, technical knowledge, and
            design experience. We created <span className="text-white font-semibold">GenWeb.ai</span> to
            remove those barriers. Whether you're launching a startup, building
            a portfolio, creating a landing page, or experimenting with ideas,
            GenWeb.ai helps you transform simple text prompts into production-ready
            websites instantly.
          </p>

          <p className="text-zinc-400 leading-8 mt-6">
            Our mission is to make website creation as easy as having a
            conversation with AI while still giving developers complete access
            to clean source code for customization.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <Target className="text-indigo-400" size={36} />

          <h2 className="text-3xl font-bold mt-6">Our Mission</h2>

          <p className="text-zinc-400 mt-4 leading-8">
            To make professional website development accessible to everyone
            through AI-powered automation, allowing creators to focus on their
            ideas instead of complex coding.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <Eye className="text-purple-400" size={36} />

          <h2 className="text-3xl font-bold mt-6">Our Vision</h2>

          <p className="text-zinc-400 mt-4 leading-8">
            To become the world's most trusted AI platform for designing,
            developing, editing, and deploying websites within minutes.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-14">
          Our Core Values
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 hover:border-indigo-500 transition"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                {value.icon}
              </div>

              <h3 className="text-2xl font-semibold mt-6">
                {value.title}
              </h3>

              <p className="text-zinc-400 mt-4 leading-7">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-12 text-center">
          <h2 className="text-4xl font-bold">
            Ready to Build Your Website?
          </h2>

          <p className="text-zinc-400 mt-5 max-w-2xl mx-auto">
            Join thousands of creators who are building faster with AI. Generate,
            customize, and deploy modern websites with GenWeb.ai.
          </p>

          <button
           onClick={()=>navigate("/dashboard")}
            className="inline-flex items-center gap-2 mt-8 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold hover:scale-105 transition"
          >
            Get Started
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;