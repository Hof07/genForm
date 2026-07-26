"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Lock, Scissors } from "lucide-react";
import { virgil } from "../../../public/fonts/virgil";

const AURA_GRADIENT =
  "bg-clip-text text-transparent bg-gradient-to-r from-[#8A2BE2] via-[#3b82f6] to-[#8A2BE2] animate-gradient-text bg-[length:200%_auto]";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTorn, setIsTorn] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Signin failed");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="h-screen w-screen overflow-hidden grid lg:grid-cols-2 bg-white text-[#1d1d1f] relative">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* --- LEFT SIDE: STICKY NOTE (swapped to left for sign-in, mirrors sign-up layout) --- */}
      <div className="hidden lg:flex relative bg-gray-50/50 border-r border-gray-100 p-12 items-center justify-center overflow-hidden h-full order-1">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/30 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-200/30 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative w-full max-w-md flex flex-col items-center">
          <AnimatePresence>
            {!isTorn && (
              <motion.div
                initial={{ rotate: -1, scale: 0.95 }}
                animate={{ rotate: -1.5, scale: 1 }}
                whileHover={{ rotate: 0, scale: 1.015, y: -3 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                exit={{
                  y: 450,
                  rotate: -50,
                  opacity: 0,
                  transition: { duration: 0.6, ease: "easeInOut" },
                }}
                className="relative w-full bg-gradient-to-br from-[#FFF7D6] via-[#FEF3C7] to-[#FDE8A8] border-t border-r border-amber-200/80 rounded-[4px] p-8 flex flex-col justify-between min-h-[380px]"
                style={{
                  boxShadow:
                    "-3px 10px 24px rgba(217, 119, 6, 0.20), -10px 28px 48px -10px rgba(180, 90, 10, 0.28), inset 0 0 60px rgba(251, 191, 36, 0.15)",
                  clipPath:
                    "polygon(0% 0%, 100% 0%, 100% 98%, 95% 100%, 92% 98%, 90% 100%, 85% 98%, 82% 100%, 80% 98%, 75% 100%, 70% 98%, 65% 100%, 60% 98%, 55% 100%, 50% 98%, 45% 100%, 40% 98%, 35% 100%, 30% 98%, 25% 100%, 20% 98%, 15% 100%, 10% 98%, 5% 100%, 0% 98%, 0% 0%)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-5 border-b border-amber-300/60 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-800 flex items-center gap-1.5">
                      <Lock size={12} /> Welcome Back Note
                    </span>
                    <span className="text-[10px] font-mono text-amber-700/50">SYS_LOG_10</span>
                  </div>

                  <div
                    className={`text-2xl sm:text-3xl font-bold tracking-tight text-amber-950 leading-snug mb-5 ${virgil.className}`}
                  >
                    &ldquo;Your forms, your data, your flows &mdash; right where you left them.&rdquo;
                  </div>

                  <p className="text-amber-900/90 text-xs font-semibold leading-relaxed uppercase tracking-wider">
                    Sign back in to pick up your intake flows, review submissions, and keep building with AURA Engine.
                  </p>
                </div>

                <div className="pt-4 border-t border-amber-300/60 flex items-center justify-between text-amber-900 mt-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest">AES-256 Secured</span>
                  </div>

                  <button
                    onClick={() => setIsTorn(true)}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-amber-200/90 hover:bg-amber-300 active:scale-95 text-amber-950 px-3 py-1.5 rounded-full shadow-sm transition-all cursor-pointer"
                  >
                    <Scissors size={12} /> Tear Note
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Push-pin */}
          {!isTorn && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-900 via-blue-600 to-blue-400 shadow-[0_8px_16px_rgba(0,0,0,0.5)] border border-blue-950/80 relative flex items-center justify-center">
                <div className="absolute top-1 left-1.5 w-3 h-2 bg-gradient-to-b from-white to-transparent rounded-full opacity-90 blur-[0.3px]" />
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-950 to-blue-700 shadow-inner border border-blue-900/50" />
              </div>
              <div className="w-[2px] h-4 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 -mt-1 shadow-md" />
              <div className="w-6 h-2 bg-black/40 rounded-full blur-[2px] -mt-0.5" />
            </div>
          )}

          {isTorn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                Note was discarded
              </p>
              <button
                onClick={() => setIsTorn(false)}
                className="bg-black text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-md hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
              >
                Restore Sticky Note
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* --- RIGHT SIDE: SIGN IN FORM --- */}
      <div className="relative z-10 flex flex-col justify-center p-6 sm:p-10 lg:p-12 h-full order-2">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3 border border-blue-100">
              <Sparkles size={12} className="animate-pulse" /> Welcome Back
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic">
              Sign <span className={AURA_GRADIENT}>In.</span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">
              Continue where you left off in the ecosystem.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">
                Email Address
              </label>
              <input
                type="email"
                placeholder="alex@company.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-11 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-xs font-medium outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between ml-1 mb-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Password
                </label>
                <a href="/forgot-password" className="text-[10px] font-bold text-blue-600 hover:underline">
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••••••"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-11 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-xs font-medium outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs font-bold pl-1"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/10 flex items-center justify-center gap-2 hover:shadow-black/20 transition-all disabled:opacity-50 cursor-pointer mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Account <ArrowRight size={16} />
                </>
              )}
            </motion.button>

            <p className="text-center text-xs text-gray-400 font-medium pt-2">
              New to the ecosystem?{" "}
              <a href="/sign-up" className="text-black font-bold underline underline-offset-4">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>

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
      `}</style>
    </div>
  );
}