"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  Power,
  Users,
  Calendar,
  Sparkles,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function ResponsesClient({ form, initialSubmissions }) {
  const router = useRouter();
  const [submissions] = useState(initialSubmissions);
  const [status, setStatus] = useState(form.status);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  const fields = form.schema || [];
  const isActive = status === "active";

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/forms/${form.id}` : "";

  async function handleToggleStatus() {
    setTogglingStatus(true);
    const newStatus = isActive ? "inactive" : "active";
    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    } finally {
      setTogglingStatus(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExportExcel() {
    const rows = submissions.map((sub) => {
      const row = {};
      fields.forEach((f) => {
        row[f.label] = sub.data[f.name] ?? "";
      });
      row["Submitted At"] = new Date(sub.submitted_at).toLocaleString();
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
    XLSX.writeFile(workbook, `${form.title.replace(/[^a-z0-9]+/gi, "-")}-responses.xlsx`);
  }

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <div
        className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto p-6 sm:p-10">
        {/* Back button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition mb-8 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3 border border-violet-100">
              <Sparkles size={11} /> AURA Form
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-sm text-gray-500 font-medium mt-2 max-w-xl">{form.description}</p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleToggleStatus}
            disabled={togglingStatus}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 flex-shrink-0 ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
            }`}
          >
            {togglingStatus ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Power size={14} />
            )}
            {isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
          </motion.button>
        </div>

        {/* Share link */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-3xl p-5 flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
              }`}
            />
            <p className="text-xs font-mono text-gray-600 truncate">{shareUrl}</p>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-700 hover:border-violet-300 transition cursor-pointer flex-shrink-0"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>

        {!isActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-8">
            <p className="text-xs font-bold text-amber-700">
              This form is deactivated — the link above will not accept new responses until you reactivate it.
            </p>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Users size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Responses</span>
            </div>
            <p className="text-3xl font-black tracking-tight">{submissions.length}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Calendar size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Created</span>
            </div>
            <p className="text-sm font-bold mt-1.5">
              {new Date(form.created_at).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Responses table */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black tracking-tight uppercase italic">Submitted Data</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportExcel}
              disabled={submissions.length === 0}
              className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              <Download size={13} /> Export to Excel
            </motion.button>
          </div>

          {submissions.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                No responses yet
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                Share the link above to start collecting data.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {fields.map((f) => (
                      <th
                        key={f.name}
                        className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap"
                      >
                        {f.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      {fields.map((f) => (
                        <td key={f.name} className="px-4 py-3.5 text-xs font-medium text-gray-700 max-w-[200px] truncate">
                          {typeof sub.data[f.name] === "boolean"
                            ? sub.data[f.name]
                              ? "Yes"
                              : "No"
                            : sub.data[f.name]?.toString() || "—"}
                        </td>
                      ))}
                      <td className="px-4 py-3.5 text-[11px] font-medium text-gray-400 whitespace-nowrap">
                        {new Date(sub.submitted_at).toLocaleString(undefined, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}