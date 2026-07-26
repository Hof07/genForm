"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import "./Hero.css"
import { virgil } from "../../public/fonts/virgil";
import {
  Sparkles,
  Zap,
  Brain,
  Palette,
  CheckCircle2,
  ChevronRight,
  MousePointer2,
  Layout,
  ShieldCheck,
  BarChart3,
  Globe,
  Smartphone,
  Code2,
  Users,
  ArrowRight,
  Star,
  X,
  Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- STYLES & CONSTANTS ---
const AURA_GRADIENT =
  "bg-clip-text text-transparent bg-gradient-to-r from-[#8A2BE2] via-[#3b82f6] to-[#8A2BE2] animate-gradient-text bg-[length:200%_auto]";

const DEMO_SCENARIOS = [
  {
    prompt:
      "Create a registration form for a design workshop with 3 ticket tiers and a dietary preference section.",
    title: "Workshop RSVP",
    fields: [
      "Full Name",
      "Email Address",
      "Ticket Level (Select)",
      "Dietary Needs",
    ],
  },
  {
    prompt:
      "Make a customer feedback survey. If rating is below 3 stars, ask for specific improvements.",
    title: "Service Feedback",
    fields: ["Overall Rating", "What can we improve?", "May we contact you?"],
  },
];

// --- INTERACTIVE BACKGROUND ENGINE ---
const MovingBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(138, 43, 226, 0.15)";
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(138, 43, 226, ${0.1 * (1 - distance / 150)
              })`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawLines();
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-40"
    />
  );
};

const AuraLogicFlow = () => {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="px-4 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            AURA Engine v2.0
          </div>
          <h2 id="think" className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic  run dev
          ">
            How it <span className={AURA_GRADIENT}>Thinks.</span>
          </h2>
        </div>

        <div className="relative bg-gray-50/50 rounded-[4rem] p-8 md:p-16 border border-gray-100 overflow-hidden">


          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 1000 500"
            fill="none"
            preserveAspectRatio="none"
          >


            <defs>
              <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8A2BE2" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative z-10 grid lg:grid-cols-3 gap-12 items-center">

            {/* Input: The Prompt */}
            <div className="relative z-20">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50"
              >
                <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 mb-6">
                  <Code2 size={24} />
                </div>
                <h3 className="text-xl font-black mb-3 tracking-tight italic">RAW PROMPT</h3>
                <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                  "Create a lead gen form for a SaaS with a dark theme and email validation."
                </p>
              </motion.div>
            </div>

            {/* Center: The AURA Processor (Logo as Core) */}
            <div className="flex flex-col items-center justify-center relative z-20">
              {/* Animated Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-56 h-56 border border-dashed border-violet-200/50 rounded-full absolute"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-48 h-48 border border-blue-100/50 rounded-full absolute"
              />

              {/* Static Center Core (No Hover Scale) */}
              <div className="w-32 h-32 bg-black rounded-[2.5rem] flex items-center justify-center shadow-2xl relative z-10">
                <img
                  src="/logo.svg"
                  alt="AURA Core"
                  className="w-16 h-16 animate-pulse"
                />
                <div className="absolute -bottom-14 whitespace-nowrap text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-600">Central Brain</span>
                </div>
              </div>
            </div>

            {/* Output: Functional UI */}
            <div className="space-y-4 relative z-20">
              {[
                { label: "Logic", val: "Branching: IF-THEN", icon: <Brain size={14} /> },
                { label: "Theme", val: "Glassmorphism Dark", icon: <Palette size={14} /> },
                { label: "Security", val: "AES-256 Encryption", icon: <ShieldCheck size={14} /> },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm hover:border-violet-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                    <p className="text-xs font-black text-gray-900 uppercase italic">{item.val}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>

        {/* Bottom Metric Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
          {['99.9% Uptime', '0.2s Latency', 'SOC2 Compliant', 'Infinite Scaling'].map((text, i) => (
            <div key={i} className="text-center border-r border-gray-100 last:border-0">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function GenFormFull() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [demoStatus, setDemoStatus] = useState("typing");
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  // Parallax values for the gradient orbs behind the headline
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const runSimulation = async () => {
      if (!isMounted) return;
      setDemoStatus("typing");
      setDisplayedText("");
      await new Promise((r) => setTimeout(r, 1000));
      const targetPrompt = DEMO_SCENARIOS[currentScenario].prompt;
      for (let i = 0; i <= targetPrompt.length; i++) {
        if (!isMounted) return;
        setDisplayedText(targetPrompt.substring(0, i));
        await new Promise((r) => setTimeout(r, 35));
      }
      await new Promise((r) => setTimeout(r, 800));
      setDemoStatus("processing");
      await new Promise((r) => setTimeout(r, 2000));
      setDemoStatus("success");
      await new Promise((r) => setTimeout(r, 4000));
      if (isMounted) {
        setCurrentScenario((prev) => (prev + 1) % DEMO_SCENARIOS.length);
      }
    };
    runSimulation();
    return () => {
      isMounted = false;
    };
  }, [currentScenario]);

  return (
    <div className={`min-h-screen bg-white text-[#1d1d1f] selection:bg-violet-100 overflow-x-hidden relative `}
    >
      {/* --- PREMIUM BG ANIMATION --- */}
      <MovingBackground />

      {/* Grid Pattern Overlay */}
      <div
        className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* --- STICKY NAVBAR --- */}
      <nav
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 border-b ${isScrolled
          ? "h-16 bg-white/80 backdrop-blur-2xl border-gray-100 shadow-sm"
          : "h-20 bg-transparent border-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-7 h-7 transition-transform group-hover:scale-105"
            />

          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-12 text-[11px] font-black uppercase tracking-widest text-gray-400">
            {["Features", "AI Demo", "Comparison", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "")}`}
                className="relative group transition-colors hover:text-black"
              >
                {item}
                <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-black transition-all group-hover:w-full group-hover:left-0" />
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
           

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="bg-black text-white px-7 py-3 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:shadow-black/20 transition-all cursor-pointer"
            >
              Start Building
            </motion.button>
          </div>

        </div>
      </nav>


      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-44 pb-20 px-6 max-w-7xl mx-auto text-center bottom-[80px]">
        {/* --- DYNAMIC GRADIENT ANIMATION BEHIND TEXT --- */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] pointer-events-none -z-10">
          <motion.div
            style={{ y: yParallax }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-violet-200/40 via-blue-100/40 to-indigo-200/40 blur-[100px] rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-0 right-0 w-72 h-72 bg-purple-200/30 blur-[80px] rounded-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-violet-100 shadow-sm shadow-violet-100/50"
        >
          <Sparkles size={12} className="animate-pulse" /> The Future of Data
          Collection
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-[92px] font-black tracking-tighter leading-[0.95] mb-10"
        >
          {/*  */}
          <div className={virgil.className}>
            Don’t Build Forms. <br />
            <span className={AURA_GRADIENT}>Just Describe Them.</span>
          </div>

        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto text-gray-500 text-lg md:text-xl mb-12 leading-relaxed font-medium"
        >
          genForm is the world’s first "Prompt-to-Form" platform. Powered by
          **AURA AI**, it builds complex logic, multi-step flows, and beautiful
          UI from a single sentence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button className="bg-black cursor-pointer text-white px-10 py-5 rounded-full font-black text-lg flex items-center gap-3 hover:shadow-2xl hover:shadow-black/20 transition-all group tracking-tighter">
            Get Started{" "}
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <button className="bg-white border border-gray-200 text-gray-900 px-10 py-5 rounded-full font-black text-lg hover:bg-gray-50 transition-all hover:border-gray-300 tracking-tighter cursor-pointer">
            View Templates
          </button>
        </motion.div>

        <div className="mt-20 flex justify-center items-center gap-8 opacity-30 grayscale hover:opacity-100 transition-all duration-500">
          {["Te", "amo", "mi", "niña"].map((brand) => (
            <span
              key={brand}
              className="font-black text-xl tracking-tighter italic border-b-2 border-transparent hover:border-black cursor-default transition-colors"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>


      <AuraLogicFlow />
      {/* --- AI GENERATION COMPONENT --- */}
      <section
        id="aidemo"
        className="relative z-10 max-w-6xl mx-auto px-6 py-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            AURA AI in Action
          </h2>
          <p className="text-gray-500 font-medium">
            Zero manual input. Fully autonomous form generation.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-[3rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="grid lg:grid-cols-5 min-h-[600px]">
            {/* Left Column: AI Terminal */}
            <div className="lg:col-span-2 p-12 bg-gray-50/50 border-r border-gray-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-blue-500 opacity-50" />
              <div>
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-4">
                    AURA Terminal
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm relative group hover:border-violet-300 transition-colors">
                    <p className="text-[10px] font-black text-violet-600 mb-2 uppercase flex items-center gap-2 tracking-widest">
                      <MousePointer2 size={12} /> User Intent
                    </p>
                    <p className="text-xl font-semibold leading-relaxed text-gray-800">
                      {displayedText}
                      {demoStatus === "typing" && (
                        <span className="w-1.5 h-6 bg-violet-600 ml-1 inline-block animate-pulse rounded-full" />
                      )}
                    </p>
                  </div>

                  <AnimatePresence>
                    {demoStatus === "processing" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-5 bg-black text-white rounded-2xl flex items-center justify-between shadow-xl shadow-black/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span className="font-bold text-sm tracking-tight">
                            Building Component Tree...
                          </span>
                        </div>
                        <Sparkles size={16} className="text-violet-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <div
                  className="flex items-center gap-3 transition-opacity duration-500"
                  style={{ opacity: demoStatus !== "typing" ? 1 : 0.3 }}
                >
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span className="text-xs font-bold text-gray-600">
                    Natural Language Parsing
                  </span>
                </div>
                <div
                  className="flex items-center gap-3 transition-opacity duration-500"
                  style={{ opacity: demoStatus === "success" ? 1 : 0.3 }}
                >
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span className="text-xs font-bold text-gray-600">
                    Conditional Logic Mapping
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Preview */}
            <div className="lg:col-span-3 p-12 bg-white flex items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
              <AnimatePresence mode="wait">
                {demoStatus === "success" ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.12)] space-y-8 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                      <Sparkles size={100} />
                    </div>
                    <div className="flex justify-between items-center">
                      <h4 className="text-2xl font-black tracking-tighter">
                        {DEMO_SCENARIOS[currentScenario].title}
                      </h4>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
                        LIVE
                      </div>
                    </div>

                    <div className="space-y-5">
                      {DEMO_SCENARIOS[currentScenario].fields.map(
                        (field, idx) => (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                          >
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                              {field}
                            </label>
                            <div className="h-12 w-full bg-gray-50 border border-gray-100 rounded-2xl mt-1.5 focus-within:border-violet-200 transition-colors" />
                          </motion.div>
                        )
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-5 bg-black text-white font-bold rounded-2xl shadow-xl shadow-black/10"
                    >
                      Complete Registration
                    </motion.button>
                    <p className="text-[9px] text-center text-gray-400 uppercase font-black tracking-[0.3em]">
                      AURA ENGINE v2.0 • ENCRYPTED
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <Brain
                        size={80}
                        className="mx-auto text-gray-100 animate-pulse"
                      />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0 border-2 border-dashed border-violet-100 rounded-full scale-150 opacity-50"
                      />
                    </div>
                    <p className="text-gray-300 font-black uppercase tracking-[0.4em] text-[10px] pt-8">
                      Awaiting Sequence
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Feature
            icon={<Zap />}
            title="Prompt-to-Form"
            desc="Stop dragging and dropping. Describe your form, get it in seconds."
          />
          <Feature
            icon={<Brain />}
            title="Logic Auto-Pilot"
            desc="AI understands 'if-then' branches naturally from your plain text instructions."
          />
          <Feature
            icon={<Palette />}
            title="Smart Styling"
            desc="Forms that look better than your custom CSS, optimized for every device."
          />
          <Feature
            icon={<BarChart3 />}
            title="AI Insights"
            desc="Don't just collect data. Get instant AI summaries and sentiment analysis."
          />
        </div>
      </section>

      {/* --- COMPARISON SECTION --- */}
      <section id="comparison" className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-[#f8f9fa] rounded-[4rem] p-12 md:p-20 overflow-hidden relative border border-gray-100">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
            <Globe size={500} />
          </div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 leading-[0.9]">
                The End of <br />
                Manual Forms.
              </h2>
              <p className="text-gray-500 mb-10 text-lg font-medium leading-relaxed max-w-md">
                Google Forms was built for a decade that didn't have AI. We
                built genForm for the future of the web.
              </p>

              <div className="space-y-5">
                <ComparisonRow text="Manual field creation" check={false} />
                <ComparisonRow text="Complex logic hurdles" check={false} />
                <ComparisonRow text="Rigid, dated UI templates" check={false} />
                <div className="pt-4 border-t border-gray-200 mt-6" />
                <ComparisonRow text="AI Prompt Generation" check={true} />
                <ComparisonRow text="Autonomous Branching" check={true} />
                <ComparisonRow
                  text="Modern Glassmorphism Design"
                  check={true}
                />
              </div>
            </div>

            {/* Right Side Visual Collage */}
            <div className="grid grid-cols-2 gap-6 relative">
              <motion.div
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-6 mt-12"
              >
                <div className="h-44 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 flex flex-col justify-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={12}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <div className="h-2 w-24 bg-gray-100 rounded-full" />
                  <div className="h-2 w-16 bg-gray-50 rounded-full" />
                </div>
                <div className="h-72 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 overflow-hidden group">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                      <Users size={20} />
                    </div>
                    <div className="h-2 w-20 bg-gray-100 rounded-full" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-10 w-full bg-gray-50 rounded-xl border border-gray-100" />
                    <div className="h-10 w-full bg-gray-50 rounded-xl border border-gray-100" />
                    <div className="h-10 w-full bg-indigo-600 rounded-xl opacity-20" />
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ y: -20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-6"
              >
                <div className="h-72 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 relative">
                  <div className="absolute top-8 right-8 text-violet-600 animate-bounce">
                    <Sparkles size={20} />
                  </div>
                  <div className="h-3 w-32 bg-gray-900 rounded-full mb-8" />
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="h-2 w-20 bg-gray-100 rounded-full" />
                      <div className="w-10 h-5 bg-emerald-500 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center opacity-40">
                      <div className="h-2 w-16 bg-gray-100 rounded-full" />
                      <div className="w-10 h-5 bg-gray-200 rounded-full" />
                    </div>
                    <div className="h-20 w-full border-2 border-dashed border-gray-100 rounded-3xl" />
                  </div>
                </div>
                <div className="h-44 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings2 size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase">
                      Configuration
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-1/2 h-full bg-gradient-to-r from-transparent via-violet-500 to-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <footer className="relative py-40 px-6 text-center border-t border-gray-100 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
        <h2 id="bot" className="text-6xl md:text-[120px] font-black tracking-tighter mb-8 leading-none italic uppercase">
          Build <span className={AURA_GRADIENT}>Fast.</span>
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-black text-white px-16 py-7 rounded-full font-black text-2xl hover:shadow-2xl transition-all shadow-black/20 cursor-pointer"
        >
          GENERATE NOW
        </motion.button>
        <div className="mt-20 text-[10px] font-black text-gray-300 tracking-[0.4em] uppercase">
          © 2025 GENFORM LABS INC.
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient-text {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-text {
          animation: gradient-text 5s linear infinite;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

// --- SMALL HELPER COMPONENTS ---
function Feature({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-12 rounded-[3rem] bg-white border border-gray-100 hover:border-violet-200 transition-all hover:shadow-2xl hover:shadow-gray-100 group relative overflow-hidden"
    >
      <div className="mb-8 w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all duration-300">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h3 className="text-2xl font-black mb-3 tracking-tighter uppercase italic">
        {title}
      </h3>
      <p className="text-gray-400 text-sm font-bold uppercase leading-relaxed tracking-tight">
        {desc}
      </p>
    </motion.div>
  );
}

function ComparisonRow({ text, check }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`p-1 rounded-full ${check ? "bg-emerald-100" : "bg-red-50"}`}
      >
        {check ? (
          <CheckCircle2 size={16} className="text-emerald-600" />
        ) : (
          <X size={16} className="text-red-400" />
        )}
      </div>
      <span
        className={`text-xs font-black uppercase tracking-widest ${check ? "text-gray-900" : "text-gray-400"
          }`}
      >
        {text}
      </span>
    </div>
  );
}
