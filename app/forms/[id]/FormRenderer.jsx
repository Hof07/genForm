"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles, UploadCloud, Check, X } from "lucide-react";

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function FormRenderer({ form }) {
  const fields = form.schema || [];
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState(null);

  function handleChange(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errorField === name) {
      setError("");
      setErrorField(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setErrorField(null);

    const missing = fields.find((f) => f.required && !values[f.name]?.toString().trim());
    if (missing) {
      setError(`${missing.label} is required`);
      setErrorField(missing.name);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${form.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-md w-full text-center bg-white border border-gray-100 rounded-[2.5rem] p-12 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)]"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
            className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6 text-emerald-600"
          >
            <CheckCircle2 size={30} strokeWidth={2} />
          </motion.div>
          <h1 className="text-2xl font-black uppercase tracking-tight italic mb-2">Response recorded</h1>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            Thanks — your submission for <span className="text-gray-800">"{form.title}"</span> was received.
          </p>
        </motion.div>
      </div>
    );
  }

  if (form.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full text-center bg-gray-50/50 border border-gray-100 rounded-[2.5rem] p-12">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-6 text-gray-400">
            <X size={26} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight italic mb-2 text-gray-800">
            Form no longer accepting responses
          </h1>
          <p className="text-xs text-gray-500 font-semibold">
            The owner has turned this form off. Reach out to them if you think this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 py-16 relative overflow-x-hidden">
      <div
        className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Soft ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-100/40 blur-[120px] rounded-full pointer-events-none" />

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-xl bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)] p-8 sm:p-12"
      >
        

        <h1 className="text-3xl sm:text-4xl font-black text-gray-700 tracking-tighter uppercase italic mb-2 leading-[1.05]">
          {form.title}
        </h1>
        {form.description && (
          <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-3">{form.description}</p>
        )}

        <div className="h-px bg-gray-100 my-8" />

        <div className="space-y-5">
          {fields.map((field, i) => {
            const hasError = errorField === field.name;
            return (
              <motion.div
                key={field.name}
                custom={i}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                className="space-y-1.5"
              >
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-violet-400">•</span>}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={values[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}…`}
                    className={`w-full bg-gray-50 border rounded-2xl p-4 text-sm font-medium text-gray-900 outline-none focus:bg-white transition-all resize-none placeholder:text-gray-400 placeholder:font-normal ${
                      hasError ? "border-red-300" : "border-gray-200 focus:border-violet-400"
                    }`}
                  />
                ) : field.type === "select" ? (
                  <div className="relative">
                    <select
                      value={values[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={`w-full h-12 bg-gray-50 border rounded-2xl px-4 text-sm font-medium text-gray-900 outline-none focus:bg-white transition-all appearance-none cursor-pointer ${
                        hasError ? "border-red-300" : "border-gray-200 focus:border-violet-400"
                      }`}
                    >
                      <option value="">Select an option…</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-r-2 border-b-2 border-gray-400 rotate-45" />
                  </div>
                ) : field.type === "checkbox" ? (
                  <label
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                      values[field.name] ? "bg-violet-50/60 border-violet-300" : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                        values[field.name] ? "bg-black border-black text-white" : "bg-white border-gray-300"
                      }`}
                    >
                      {values[field.name] && <Check size={12} strokeWidth={3} />}
                    </div>
                    <input
                      type="checkbox"
                      checked={!!values[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="hidden"
                    />
                    <span className="text-xs font-bold text-gray-700">{field.label}</span>
                  </label>
                ) : field.type === "radio" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(field.options || []).map((opt) => {
                      const isSelected = values[field.name] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleChange(field.name, opt)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-black text-white border-black shadow-lg shadow-black/10"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-xs font-bold">{opt}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "border-white" : "border-gray-300"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : field.type === "date" ? (
                  <input
                    type="date"
                    value={values[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={`w-full h-12 bg-gray-50 border rounded-2xl px-4 text-sm font-medium text-gray-900 outline-none focus:bg-white transition-all ${
                      hasError ? "border-red-300" : "border-gray-200 focus:border-violet-400"
                    }`}
                  />
                ) : field.type === "file" ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50 hover:bg-violet-50/30 hover:border-violet-300 transition cursor-pointer text-center group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-violet-600 shadow-sm mb-2.5 transition-colors">
                      <UploadCloud size={17} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      {values[field.name] ? values[field.name].name : "Click to upload a file"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium mt-1">SVG, PNG, JPG or PDF, up to 10MB</span>
                    <input type="file" onChange={(e) => handleChange(field.name, e.target.files[0])} className="hidden" />
                  </label>
                ) : (
                  <input
                    type={field.type || "text"}
                    value={values[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}…`}
                    className={`w-full h-12 text-gray-900 bg-gray-50 border rounded-2xl px-4 text-sm font-medium outline-none focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal ${
                      hasError ? "border-red-300" : "border-gray-200 focus:border-violet-400"
                    }`}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="flex items-center gap-1.5 text-red-500 text-xs font-bold pl-1 mt-4">
                <X size={13} strokeWidth={3} /> {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={submitting}
          className="w-full h-13 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/10 flex items-center justify-center gap-2 hover:shadow-black/20 transition-all disabled:opacity-50 cursor-pointer mt-8"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Submit Response <ArrowRight size={15} />
            </>
          )}
        </motion.button>

        <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-5">
          Secured by AURA Engine
        </p>
      </motion.form>
    </div>
  );
}