"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
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
  Calendar,
  Copy,
  Check,
  ExternalLink,
  Lightbulb,
  TrendingUp,
  RefreshCw,
  Hash,
  Smile,
} from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const AURA_GRADIENT =
  "bg-clip-text text-transparent bg-gradient-to-r from-[#8A2BE2] via-[#3b82f6] to-[#8A2BE2] animate-gradient-text bg-[length:200%_auto]";

const NAV_ITEMS = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "forms", label: "My Forms", icon: Code2 },
  { id: "analytics", label: "AI Insights", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const LOADING_STEPS = [
  "Reading your prompt",
  "Mapping fields",
  "Structuring conditional logic",
  "Finalizing schema",
];

const CHART_COLORS = ["#8A2BE2", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

const CHART_FONT = {
  family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  size: 10,
  weight: "700",
};

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

function formatDayLabel(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
  const [copied, setCopied] = useState(false);

  // AI Insights: per-form selection + cache
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [insightsCache, setInsightsCache] = useState({}); // { [formId]: responseData }
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState("");

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

  async function fetchInsights(formId) {
    setLoadingInsights(true);
    setInsightsError("");
    try {
      const res = await fetch(`/api/insights?formId=${formId}`);
      const data = await res.json();

      if (!res.ok) {
        setInsightsError(data.error || "Failed to load insights");
        return;
      }

      setInsightsCache((prev) => ({ ...prev, [formId]: data }));
    } catch (err) {
      console.error("Failed to fetch insights", err);
      setInsightsError("Network error - could not reach the server");
    } finally {
      setLoadingInsights(false);
    }
  }

  function handleSelectForm(formId) {
    setSelectedFormId(formId);
    setInsightsError("");
    if (!insightsCache[formId]) {
      fetchInsights(formId);
    }
  }

  function handleBackToFormList() {
    setSelectedFormId(null);
    setInsightsError("");
  }

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
      setForms((prev) => [saveData.form, ...prev]);
    } catch (e) {
      console.error("Failed to generate form", e);
      setResult({ ok: false, error: "Network error - could not reach the server", prompt: promptSnapshot });
    } finally {
      setGenerating(false);
    }
  }

  function goToResponses(formId) {
    router.push("/forms/" + formId + "/responses");
  }

  function handleCopyLink(formId) {
    const url = window.location.origin + "/forms/" + formId;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getShareUrl(formId) {
    if (typeof window === "undefined") return "";
    return window.location.origin + "/forms/" + formId;
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.avatarUrl || "/icon/pile_1.webp";

  // ---- Chart data builders ----

  function buildTimelineChartData(timeline) {
    return {
      labels: timeline.labels.map(formatDayLabel),
      datasets: [
        {
          label: "Responses",
          data: timeline.data,
          borderColor: "#8A2BE2",
          backgroundColor: "rgba(138, 43, 226, 0.08)",
          pointBackgroundColor: "#8A2BE2",
          pointBorderColor: "#fff",
          pointBorderWidth: 1.5,
          pointRadius: 3,
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }

  const timelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111",
        titleFont: CHART_FONT,
        bodyFont: CHART_FONT,
        padding: 10,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: CHART_FONT, color: "#9ca3af" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f3f4f6" },
        border: { display: false },
        ticks: { font: CHART_FONT, color: "#9ca3af", precision: 0 },
      },
    },
  };

  function buildFieldBarData(field) {
    return {
      labels: field.labels,
      datasets: [
        {
          label: field.label,
          data: field.data,
          backgroundColor: field.labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderRadius: 8,
          maxBarThickness: 36,
        },
      ],
    };
  }

  const fieldBarOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111",
        titleFont: CHART_FONT,
        bodyFont: CHART_FONT,
        padding: 10,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "#f3f4f6" },
        border: { display: false },
        ticks: { font: CHART_FONT, color: "#9ca3af", precision: 0 },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: CHART_FONT, color: "#374151" },
      },
    },
  };

  function buildSentimentData(sentiment) {
    return {
      labels: ["Positive", "Neutral", "Negative"],
      datasets: [
        {
          data: [sentiment.positive || 0, sentiment.neutral || 0, sentiment.negative || 0],
          backgroundColor: ["#10b981", "#9ca3af", "#ef4444"],
          borderWidth: 0,
        },
      ],
    };
  }

  const sentimentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: CHART_FONT, color: "#374151", boxWidth: 10, padding: 14 },
      },
      tooltip: {
        backgroundColor: "#111",
        titleFont: CHART_FONT,
        bodyFont: CHART_FONT,
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  return (
    <div className="h-screen w-screen overflow-hidden grid lg:grid-cols-[280px_1fr] bg-white text-[#1d1d1f] relative">
      <div
        className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

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
                  className={
                    "relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer " +
                    (isActive ? "text-white" : "text-gray-500 hover:text-black hover:bg-gray-100/60")
                  }
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
              <div
                className={
                  "relative rounded-[2rem] border transition-all duration-300 overflow-hidden " +
                  (isPromptFocused
                    ? "border-violet-300 shadow-xl shadow-violet-500/10"
                    : "border-gray-100 shadow-sm")
                }
              >
                <div
                  className={
                    "absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-blue-50 transition-opacity duration-500 " +
                    (isPromptFocused ? "opacity-100" : "opacity-0")
                  }
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
                    placeholder="Describe your form in plain language, e.g. Customer feedback survey with a 5-star rating and a conditional text box if rating is under 3"
                    className="w-full bg-transparent text-lg sm:text-xl font-medium text-gray-900 placeholder:text-gray-400 outline-none resize-none leading-snug disabled:opacity-50"
                  />

                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Wand2 size={12} />
                      {generating ? "Building your form" : "Cmd + Enter to deploy"}
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
                              className={
                                "h-1 rounded-full transition-all duration-300 " +
                                (i <= loadingStep ? "bg-violet-500 w-8" : "bg-gray-200 w-4")
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!generating && result && result.ok && (
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
                          Form generated, ready to share
                        </p>
                        <p className="text-[11px] text-emerald-700/70 font-medium mt-1">{result.prompt}</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <p className="text-xs font-black text-gray-800 uppercase tracking-tight mb-1">
                          {result.data.title}
                        </p>
                        {result.data.description && (
                          <p className="text-[11px] text-gray-500 font-medium">{result.data.description}</p>
                        )}
                      </div>

                      <div className="bg-white border border-emerald-200/60 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                          <p className="text-xs font-mono text-gray-600 truncate">
                            {getShareUrl(result.data.id)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleCopyLink(result.data.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-700 hover:border-violet-300 transition cursor-pointer"
                          >
                            {copied ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                            {copied ? "Copied" : "Copy Link"}
                          </button>
                          <a
                            href={"/forms/" + result.data.id}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition cursor-pointer"
                          >
                            <ExternalLink size={12} />
                            <span>Open Form</span>
                          </a>
                        </div>
                      </div>

                      <button
                        onClick={() => goToResponses(result.data.id)}
                        className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition cursor-pointer"
                      >
                        View responses and manage form
                      </button>
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
                              className={
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border " +
                                (form.status === "active"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : "bg-gray-100 text-gray-500 border-gray-200")
                              }
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
                    Loading deployment records
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
                              className={
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border " +
                                (form.status === "active"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : "bg-gray-100 text-gray-500 border-gray-200")
                              }
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
              {!selectedFormId ? (
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                  <h3 className="text-lg font-black tracking-tight uppercase italic mb-2">AI Insights</h3>
                  <p className="text-[11px] text-gray-500 font-medium mb-6">
                    Select a form to analyze its responses.
                  </p>

                  {loadingForms ? (
                    <div className="py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Loading forms
                    </div>
                  ) : forms.length === 0 ? (
                    <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                        No forms yet
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Create a form on the Dashboard first.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {forms.map((form) => (
                        <div
                          key={form.id}
                          onClick={() => handleSelectForm(form.id)}
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
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <button
                        onClick={handleBackToFormList}
                        className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition cursor-pointer mb-2"
                      >
                        ← All forms
                      </button>
                      <h3 className="text-lg font-black tracking-tight uppercase italic">
                        {insightsCache[selectedFormId]?.formTitle || "AI Insights"}
                      </h3>
                      {insightsCache[selectedFormId]?.hasData && (
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          Based on {insightsCache[selectedFormId].responseCount} responses
                        </p>
                      )}
                    </div>
                    {insightsCache[selectedFormId]?.hasData && (
                      <button
                        onClick={() => fetchInsights(selectedFormId)}
                        disabled={loadingInsights}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-600 hover:border-violet-300 transition cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={loadingInsights ? "animate-spin" : ""} />
                        Refresh
                      </button>
                    )}
                  </div>

                  {loadingInsights && (
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm min-h-[300px] flex flex-col items-center justify-center gap-4">
                      <div className="relative w-10 h-10">
                        <motion.div
                          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 to-blue-500"
                        />
                        <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center">
                          <Sparkles size={14} className="text-violet-600" />
                        </div>
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                        Analyzing your response data
                      </p>
                    </div>
                  )}

                  {!loadingInsights && insightsError && (
                    <div className="bg-red-50/50 border border-red-100 rounded-[2.5rem] p-8 flex items-start gap-3">
                      <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-red-600">
                          Could not load insights
                        </p>
                        <p className="text-[11px] text-red-600/70 font-medium mt-1">{insightsError}</p>
                      </div>
                    </div>
                  )}

                  {!loadingInsights &&
                    !insightsError &&
                    insightsCache[selectedFormId] &&
                    !insightsCache[selectedFormId].hasData && (
                      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm min-h-[300px] flex items-center justify-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                          AI Insights will appear once this form starts collecting responses.
                        </p>
                      </div>
                    )}

                  {!loadingInsights && !insightsError && insightsCache[selectedFormId]?.hasData && (() => {
                    const cached = insightsCache[selectedFormId];
                    const { timeline, fieldBreakdowns } = cached.charts || { timeline: null, fieldBreakdowns: [] };
                    const sentiment = cached.insights.sentiment;
                    const topics = cached.insights.topics || [];
                    const hasSentimentData =
                      sentiment && (sentiment.positive > 0 || sentiment.negative > 0);

                    return (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-violet-50 via-white to-blue-50 border border-violet-100 rounded-[2.5rem] p-8">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-violet-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-violet-100">
                            <Sparkles size={11} /> Summary
                          </span>
                          <p className="text-sm font-medium text-gray-700 leading-relaxed">
                            {cached.insights.summary}
                          </p>
                        </div>

                        {timeline && timeline.labels.length > 1 && (
                          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                <TrendingUp size={14} />
                              </div>
                              <h4 className="text-xs font-black uppercase tracking-widest text-gray-800">
                                Responses over time
                              </h4>
                            </div>
                            <div className="h-64">
                              <Line data={buildTimelineChartData(timeline)} options={timelineOptions} />
                            </div>
                          </div>
                        )}

                        <div className="grid lg:grid-cols-2 gap-6">
                          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <TrendingUp size={14} />
                              </div>
                              <h4 className="text-xs font-black uppercase tracking-widest text-gray-800">
                                Patterns found
                              </h4>
                            </div>
                            <div className="space-y-4">
                              {cached.insights.insights &&
                                cached.insights.insights.map((item, i) => (
                                  <div key={i} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <p className="text-xs font-black text-gray-900 mb-1">{item.title}</p>
                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                      {item.detail}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Lightbulb size={14} />
                              </div>
                              <h4 className="text-xs font-black uppercase tracking-widest text-gray-800">
                                Suggestions
                              </h4>
                            </div>
                            <div className="space-y-4">
                              {cached.insights.suggestions &&
                                cached.insights.suggestions.map((item, i) => (
                                  <div key={i} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <p className="text-xs font-black text-gray-900 mb-1">{item.title}</p>
                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                      {item.detail}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>

                        {(hasSentimentData || topics.length > 0) && (
                          <div className="grid lg:grid-cols-2 gap-6">
                            {hasSentimentData && (
                              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Smile size={14} />
                                  </div>
                                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-800">
                                    Response sentiment
                                  </h4>
                                </div>
                                <div className="h-56">
                                  <Doughnut data={buildSentimentData(sentiment)} options={sentimentOptions} />
                                </div>
                              </div>
                            )}

                            {topics.length > 0 && (
                              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                                    <Hash size={14} />
                                  </div>
                                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-800">
                                    Recurring topics
                                  </h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {topics.map((t, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 border border-gray-100 rounded-full text-[11px] font-bold text-gray-700"
                                    >
                                      {t.topic}
                                      <span className="text-gray-400 font-black">{t.count}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {fieldBreakdowns.length > 0 && (
                          <div className="grid lg:grid-cols-2 gap-6">
                            {fieldBreakdowns.map((field, i) => (
                              <div key={i} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                                <h4 className="text-xs font-black uppercase tracking-widest text-gray-800 mb-6">
                                  {field.label}
                                </h4>
                                <div style={{ height: Math.max(120, field.labels.length * 44) }}>
                                  <Bar data={buildFieldBarData(field)} options={fieldBarOptions} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
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