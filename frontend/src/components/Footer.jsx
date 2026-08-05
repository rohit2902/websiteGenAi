import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#040404]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-12 md:flex-row">
        {/* Left */}
        <div>
          <h2 className="text-2xl font-bold text-white">GenWeb.ai</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
            Build stunning websites with AI. Generate responsive,
            production-ready websites in seconds.
          </p>
        </div>

        {/* Center */}
        <div className="flex gap-8 text-sm text-zinc-400">
          <a href="#" className="transition hover:text-white">
            Home
          </a>
          <a href="#" className="transition hover:text-white">
            Features
          </a>
          <a href="#" className="transition hover:text-white">
            Pricing
          </a>
          <a href="#" className="transition hover:text-white">
            Contact
          </a>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5 text-xl text-zinc-400">
          <a href="#" className="transition hover:text-white">
            <FaGithub />
          </a>
          <a href="#" className="transition hover:text-white">
            <FaLinkedin />
          </a>
          <a href="#" className="transition hover:text-white">
            <FaTwitter />
          </a>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 py-5 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} GenWeb.ai. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;