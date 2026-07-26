"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Scissors } from "lucide-react";
import { virgil } from "../../../public/fonts/virgil";

const AURA_GRADIENT =
  "bg-clip-text text-transparent bg-gradient-to-r from-[#8A2BE2] via-[#3b82f6] to-[#8A2BE2] animate-gradient-text bg-[length:200%_auto]";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTorn, setIsTorn] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const editableRef = useRef(null);

  const placeholder =
    "Type what form you need... e.g. 'Event registration with name, email, dietary preference and ticket type'";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Signup failed");
      return;
    }

    router.push("/dashboard");
  }

  function handleNoteInput(e) {
    setNoteText(e.currentTarget.textContent);
  }

  function handleNoteKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (noteText.trim()) {
        // Hook this up to your AI form-generation flow
        console.log("User wants:", noteText.trim());
      }
    }
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

      {/* --- LEFT SIDE: SIGN UP FORM --- */}
      <div className="relative z-10 flex flex-col justify-between p-6 sm:p-10 lg:p-12 h-full">
        {/* Form Container */}
        <div className="w-full max-w-md mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3 border border-violet-100">
              <Sparkles size={12} className="animate-pulse" /> Get Started
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic">
              Create <span className={AURA_GRADIENT}>Account.</span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">
              Enter the ecosystem of prompt-to-form data collection.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Alex Rivera"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-11 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-xs font-medium outline-none focus:border-violet-500 transition-colors"
              />
            </div>

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
                className="w-full h-11 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-xs font-medium outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-11 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-xs font-medium outline-none focus:border-violet-500 transition-colors"
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
                  Initialize Account <ArrowRight size={16} />
                </>
              )}
            </motion.button>

            <p className="text-center text-xs text-gray-400 font-medium pt-2">
              Already have an ecosystem account?{" "}
              <a href="/sign-in" className="text-black font-bold underline underline-offset-4">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* --- RIGHT SIDE: EDITABLE STICKY NOTE WITH OVERLAPPING PIN & TEAR ACTION --- */}
      <div className="hidden lg:flex relative bg-gray-50/50 border-l border-gray-100 p-12 items-center justify-center overflow-hidden h-full">
        {/* Decorative background blurs */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-violet-200/30 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-blue-200/30 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative w-full max-w-md flex flex-col items-center">
          <AnimatePresence>
            {!isTorn && (
              <motion.div
                initial={{ rotate: 1, scale: 0.95 }}
                animate={{ rotate: isNoteFocused ? 0 : 1.5, scale: 1 }}
                exit={{
                  y: 450,
                  rotate: 50,
                  opacity: 0,
                  transition: { duration: 0.6, ease: "easeInOut" },
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative w-full bg-gradient-to-br from-[#FFF7D6] via-[#FEF3C7] to-[#FDE8A8] backdrop-blur-sm border-t border-l border-amber-200/80 rounded-[4px] p-8 flex flex-col justify-between min-h-[380px]"
                style={{
                  boxShadow: isNoteFocused
                    ? "3px 14px 32px rgba(217, 119, 6, 0.28), 10px 32px 56px -10px rgba(180, 90, 10, 0.35), inset 0 0 60px rgba(251, 191, 36, 0.15)"
                    : "2px 8px 30px rgba(217, 119, 6, 0.18), inset 0 0 50px rgba(251, 191, 36, 0.12)",
                  clipPath:
                    "polygon(0% 0%, 100% 0%, 100% 98%, 98% 100%, 95% 98%, 92% 100%, 90% 98%, 85% 100%, 82% 98%, 80% 100%, 75% 98%, 70% 100%, 65% 98%, 60% 100%, 55% 98%, 50% 100%, 45% 98%, 40% 100%, 35% 98%, 30% 100%, 25% 98%, 20% 100%, 15% 98%, 10% 100%, 5% 98%, 0% 100%)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-5 border-b border-amber-300/60 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-800 flex items-center gap-1.5">
                      <Zap size={12} /> Pro-Tip Note
                    </span>
                    <span className="text-[10px] font-mono text-amber-700/60">SYS_LOG_09</span>
                  </div>

                  {/* Editable area — click directly on the note to type */}
                  <div
                    ref={editableRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleNoteInput}
                    onKeyDown={handleNoteKeyDown}
                    onFocus={() => setIsNoteFocused(true)}
                    onBlur={() => setIsNoteFocused(false)}
                    data-placeholder={placeholder}
                    className={`
                      empty:before:content-[attr(data-placeholder)]
                      empty:before:text-amber-900/40 empty:before:font-semibold empty:before:not-italic
                      text-xl sm:text-2xl font-bold tracking-tight text-amber-950 leading-snug mb-5
                      outline-none min-h-[110px] max-h-[140px] overflow-y-auto cursor-text
                      ${virgil.className}
                    `}
                  />

                  <p className="text-amber-900/90 text-xs font-semibold leading-relaxed uppercase tracking-wider">
                    {isNoteFocused
                      ? "Press Enter to generate ↵"
                      : "Click note to write your form idea"}
                  </p>
                </div>

                <div className="pt-4 border-t border-amber-300/60 flex items-center justify-between text-amber-900 mt-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      AES-256 Secured
                    </span>
                  </div>

                  {/* Tear Button */}
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

          {/* --- REALISTIC STAINLESS STEEL & PLASTIC PUSH-PIN --- */}
          {!isTorn && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-900 via-red-600 to-red-400 shadow-[0_8px_16px_rgba(0,0,0,0.5)] border border-red-950/80 relative flex items-center justify-center">
                <div className="absolute top-1 left-1.5 w-3 h-2 bg-gradient-to-b from-white to-transparent rounded-full opacity-90 blur-[0.3px]" />
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-950 to-red-700 shadow-inner border border-red-900/50" />
              </div>
              <div className="w-[2px] h-4 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 -mt-1 shadow-md" />
              <div className="w-6 h-2 bg-black/40 rounded-full blur-[2px] -mt-0.5" />
            </div>
          )}

          {/* Reset Note State if Torn */}
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