"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  Settings,
  LogOut,
  Code2,
  BarChart3,
  Bell,
  ChevronRight,
  Wand2,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Calendar,
} from "lucide-react";
import { virgil } from "../../public/fonts/virgil";

const AURA_GRADIENT =
  "bg-clip-text text-transparent bg-gradient-to-r from-[#8A2BE2] via-[#3b82f6] to-[#8A2BE2] animate-gradient-text bg-[length:200%_auto]";

const NAV_ITEMS = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "forms", label: "My Forms", icon: Code2 },
  { id: "analytics", label: "AI Insights", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const LOADING_STEPS = [
  "Reading your prompt…",
  "Mapping fields…",
  "Structuring conditional logic…",
  "Finalizing schema…",
];

function formatCreatedDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardClient({ user }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [quickPrompt, setQuickPrompt] = useState("");
  const [forms, setForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isPromptFocused, setIsPromptFocused] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    async function fetchUserForms() {
      try {
        const res = await fetch("/api/forms");
        if (res.ok) {
          const data = await res.json();
          setForms(data.forms || []);
        }
      } catch (err) {
        console.error("Failed to fetch forms", err);
      } finally {
        setLoadingForms(false);
      }
    }
    fetchUserForms();
  }, []);

  useEffect(() => {
    if (!generating) return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((s) => (s + 1) % LOADING_STEPS.length);
    }, 1100);
    return () => clearInterval(interval);
  }, [generating]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      router.push("/sign-in");
      setSigningOut(false);
    }
  }

  async function handleGenerate() {
    if (!quickPrompt.trim() || generating) return;
    setGenerating(true);
    setResult(null);

    const promptSnapshot = quickPrompt;

    try {
      const genRes = await fetch("/api/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptSnapshot }),
      });

      const genData = await genRes.json();

      if (!genRes.ok || !genData.success) {
        setResult({ ok: false, error: genData.error || "Generation failed", prompt: promptSnapshot });
        setGenerating(false);
        return;
      }

      const saveRes = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: genData.data.title,
          description: genData.data.description,
          fields: genData.data.fields,
        }),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        setResult({ ok: false, error: saveData.error || "Failed to save form", prompt: promptSnapshot });
        setGenerating(false);
        return;
      }

      setResult({ ok: true, data: saveData.form, prompt: promptSnapshot });
      setQuickPrompt("");

      router.push(`/forms/${saveData.form.id}`);
    } catch (e) {
      console.error("Failed to generate form", e);
      setResult({ ok: false, error: "Network error — could not reach the server", prompt: promptSnapshot });
      setGenerating(false);
    }
  }

  function goToResponses(formId) {
    router.push(`/forms/${formId}/responses`);
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.avatarUrl || "/icon/pile_1.webp";

  return (
    <div className="h-screen w-screen overflow-hidden grid lg:grid-cols-[280px_1fr] bg-white text-[#1d1d1f] relative">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* --- SIDEBAR NAVIGATION --- */}
      <div className="relative z-20 border-r border-gray-100 bg-gray-50/50 p-6 flex-col justify-between hidden lg:flex">
        <div>
          <div className="flex items-center gap-3 cursor-pointer group mb-10" onClick={() => router.push("/")}>
            <img src="/logo.svg" alt="genForm Logo" className="w-6 h-6 transition-transform group-hover:scale-105" />
          </div>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    isActive ? "text-white" : "text-gray-500 hover:text-black hover:bg-gray-100/60"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-black rounded-2xl shadow-lg shadow-black/10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-3">
                    <Icon size={16} />
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Profile Card */}
        <div className="pt-6 border-t border-gray-200/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-100 border border-violet-200 overflow-hidden flex-shrink-0">
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tight">{displayName}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 cursor-pointer disabled:opacity-50"
            title="Sign Out"
          >
            {signingOut ? (
              <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
            ) : (
              <LogOut size={16} />
            )}
          </button>
        </div>
      </div>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <div className="relative z-10 flex flex-col h-full overflow-y-auto">
        <header className="h-20 border-b border-gray-100 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 relative cursor-pointer hover:border-violet-300 transition">
              <Bell size={16} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-violet-600 rounded-full animate-pulse" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-8 space-y-6 max-w-7xl mx-auto w-full"
            >
              {/* --- SINGLE PROMPT BOX --- */}
              <div
                className={`relative rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                  isPromptFocused ? "border-violet-300 shadow-xl shadow-violet-500/10" : "border-gray-100 shadow-sm"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-blue-50 transition-opacity duration-500 ${
                    isPromptFocused ? "opacity-100" : "opacity-0"
                  }`}
                />

                <div className="relative p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-[0.2em] border border-violet-100">
                      <Sparkles size={12} className="animate-pulse" /> AURA Prompt Engine
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    value={quickPrompt}
                    onChange={(e) => setQuickPrompt(e.target.value)}
                    onFocus={() => setIsPromptFocused(true)}
                    onBlur={() => setIsPromptFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    disabled={generating}
                    placeholder="Describe your form in plain language — e.g. 'Customer feedback survey with a 5-star rating and a conditional text box if rating is under 3'"
                    className="w-full bg-transparent text-lg sm:text-xl font-medium text-gray-900 placeholder:text-gray-400 outline-none resize-none leading-snug disabled:opacity-50"
                  />

                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Wand2 size={12} />
                      {generating ? "Building your form…" : "⌘ + Enter to deploy"}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerate}
                      disabled={!quickPrompt.trim() || generating}
                      className="bg-black text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-black/10 flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                    >
                      {generating ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Generate Form <ArrowRight size={14} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* --- OUTPUT / LOADING / RESULT PANEL --- */}
              <AnimatePresence mode="wait">
                {generating && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-[2rem] border border-gray-100 bg-gray-50/60 p-8"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <motion.div
                          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 to-blue-500"
                        />
                        <div className="absolute inset-[3px] rounded-full bg-gray-50/60 flex items-center justify-center">
                          <Sparkles size={14} className="text-violet-600" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={loadingStep}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="text-xs font-black uppercase tracking-widest text-gray-700"
                          >
                            {LOADING_STEPS[loadingStep]}
                          </motion.p>
                        </AnimatePresence>

                        <div className="flex gap-1.5 mt-3">
                          {LOADING_STEPS.map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 rounded-full transition-all duration-300 ${
                                i <= loadingStep ? "bg-violet-500 w-8" : "bg-gray-200 w-4"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!generating && result?.ok && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-[2rem] border border-emerald-100 bg-emerald-50/50 overflow-hidden"
                  >
                    <div className="p-6 flex items-start gap-3 border-b border-emerald-100/80">
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
                          Form generated
                        </p>
                        <p className="text-[11px] text-emerald-700/70 font-medium mt-1">"{result.prompt}"</p>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <FileJson size={13} className="text-gray-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Response
                        </span>
                      </div>
                      <pre className="bg-white border border-gray-100 rounded-2xl p-4 text-[11px] font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap break-words max-h-64">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}

                {!generating && result && !result.ok && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-[2rem] border border-red-100 bg-red-50/50 p-6 flex items-start gap-3"
                  >
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-red-600">
                        Generation failed
                      </p>
                      <p className="text-[11px] text-red-600/70 font-medium mt-1">{result.error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recent forms preview on overview */}
              {forms.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black tracking-tight uppercase italic">Recent Form Deployments</h3>
                    <button
                      onClick={() => setActiveTab("forms")}
                      className="text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-black transition"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {forms.slice(0, 4).map((form) => {
                      const createdLabel = formatCreatedDate(form.created_at);
                      return (
                        <div
                          key={form.id}
                          onClick={() => goToResponses(form.id)}
                          className="flex items-center justify-between p-4 bg-gray-50/80 border border-gray-100 rounded-2xl hover:border-violet-200 transition group cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center font-black text-xs">
                              AI
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight group-hover:text-violet-600 transition">
                                {form.title}
                              </h4>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                {form.description || "No description"}
                              </p>
                              {createdLabel && (
                                <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1 mt-1">
                                  <Calendar size={10} /> Created {createdLabel}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                form.status === "active"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : "bg-gray-100 text-gray-500 border-gray-200"
                              }`}
                            >
                              {form.status === "active" ? "Active" : "Inactive"}
                            </span>
                            <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "forms" && (
            <motion.div
              key="forms"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-8 max-w-7xl mx-auto w-full"
            >
              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="text-lg font-black tracking-tight uppercase italic mb-6">All Forms</h3>
                {loadingForms ? (
                  <div className="py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Loading deployment records...
                  </div>
                ) : forms.length === 0 ? (
                  <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                      No active forms found
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Head to Dashboard and describe your first form.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {forms.map((form) => {
                      const createdLabel = formatCreatedDate(form.created_at);
                      return (
                        <div
                          key={form.id}
                          onClick={() => goToResponses(form.id)}
                          className="flex items-center justify-between p-4 bg-gray-50/80 border border-gray-100 rounded-2xl hover:border-violet-200 transition group cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center font-black text-xs">
                              AI
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight group-hover:text-violet-600 transition">
                                {form.title}
                              </h4>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                {form.description || "No description"}
                              </p>
                              {createdLabel && (
                                <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1 mt-1">
                                  <Calendar size={10} /> Created {createdLabel}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                form.status === "active"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : "bg-gray-100 text-gray-500 border-gray-200"
                              }`}
                            >
                              {form.status === "active" ? "Active" : "Inactive"}
                            </span>
                            <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-8 max-w-7xl mx-auto w-full"
            >
              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm min-h-[300px] flex items-center justify-center">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  AI Insights will appear once your forms start collecting responses.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-8 max-w-7xl mx-auto w-full"
            >
              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-black tracking-tight uppercase italic">Account Settings</h3>
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">Email</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">Name</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">{displayName}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes gradient-text {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-text {
          animation: gradient-text 5s linear infinite;
        }
      `}</style>
    </div>
  );
}