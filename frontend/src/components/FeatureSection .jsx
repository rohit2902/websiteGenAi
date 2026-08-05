import React from 'react'

const FeatureSection  = () => {
    const features = [
  {
    title: "AI Website Generation",
    description:
      "Describe your idea in simple words and let AI generate a beautiful, responsive website in seconds.",
  },
  {
    title: "Modern UI Design",
    description:
      "Create clean, elegant, and professional interfaces with responsive layouts and smooth animations.",
  },
  {
    title: "Production Ready Code",
    description:
      "Get optimized React and Tailwind CSS code that is easy to customize and deploy.",
  },
];
  return (
          <section className="bg-[#040404] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold md:text-5xl">
            Why Choose <span className="text-purple-400">GenWeb.ai?</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Build modern, responsive, and production-ready websites faster than
            ever with the power of AI.
          </p>
        </div>
           {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/50 hover:bg-white/10"
            >
              <h3 className="mb-4 text-2xl font-semibold">
                {feature.title}
              </h3>

              <p className="leading-7 text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

  


export default FeatureSection 
