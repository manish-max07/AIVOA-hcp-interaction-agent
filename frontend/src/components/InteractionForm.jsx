import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  LuUser,
  LuCalendar,
  LuCalendarCheck,
  LuLayoutList,
  LuPill,
  LuPaperclip,
  LuSmile,
  LuNotebookPen,
  LuArrowRight,
  LuShieldAlert,
  LuBadgeCheck,
  LuHash,
  LuClock,
} from "react-icons/lu";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const sentimentConfig = {
  positive: {
    label: "Positive",
    face: "😊",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm",
    dot: "bg-emerald-400",
  },
  neutral: {
    label: "Neutral",
    face: "😐",
    active: "bg-amber-50 text-amber-700 border-amber-200 shadow-sm",
    dot: "bg-amber-400",
  },
  negative: {
    label: "Negative",
    face: "😞",
    active: "bg-rose-50 text-rose-700 border-rose-200 shadow-sm",
    dot: "bg-rose-400",
  },
};

function Field({ label, value, Icon, className = "" }) {
  return (
    <div className={className}>
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
        {Icon && <Icon className="w-3 h-3 shrink-0" />}
        {label}
      </label>
      <div
        className={`px-3.5 py-2.5 rounded-xl text-sm border transition-all duration-200 ${
          value
            ? "bg-slate-50 text-slate-800 border-slate-200 font-medium"
            : "bg-slate-50/40 text-slate-300 border-dashed border-slate-200 italic"
        }`}
      >
        {value || "Not yet captured"}
      </div>
    </div>
  );
}

function SentimentField({ value }) {
  const options = ["positive", "neutral", "negative"];
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
        <LuSmile className="w-3 h-3 shrink-0" />
        Sentiment
      </label>
      <div className="flex gap-2">
        {options.map((opt) => {
          const cfg = sentimentConfig[opt];
          const active = value === opt;
          return (
            <div
              key={opt}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                active
                  ? cfg.active
                  : "bg-slate-50/50 text-slate-300 border-slate-100 border-dashed"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${active ? cfg.dot : "bg-slate-200"}`} />
              <span>{cfg.face}</span>
              {cfg.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MaterialsField({ value }) {
  const items = value
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
        <LuPaperclip className="w-3 h-3 shrink-0" />
        Materials Shared
      </label>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[42px]">
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
            >
              <span className="w-1 h-1 rounded-full bg-indigo-400 inline-block" />
              {item}
            </span>
          ))}
        </div>
      ) : (
        <div className="px-3.5 py-2.5 rounded-xl text-sm border border-dashed border-slate-200 bg-slate-50/40 text-slate-300 italic min-h-[42px]">
          Not yet captured
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <button
          disabled
          className="mt-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-400 cursor-not-allowed flex items-center gap-1.5"
          title="Materials are added automatically by the AI assistant"
        >
          <span>🔍</span> Search/Add
        </button>
        <button
          disabled
          className="mt-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-400 cursor-not-allowed flex items-center gap-1.5"
          title="Samples are added automatically by the AI assistant"
        >
          <span>+</span> Add Sample
        </button>
      </div>
    </div>
  );
}

function Section({ title, Icon, children }) {
  return (
    <div className="mt-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {title}
        </span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      <div className="space-y-3.5">{children}</div>
    </div>
  );
}

export default function InteractionForm() {
  const state = useSelector((s) => s.interaction);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/interactions`)
      .then((res) => setRecent(res.data.slice(0, 5)))
      .catch(() => setRecent([]));
  }, [state.interaction_id]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-7 pt-7 pb-5 border-b border-slate-100">
        <div className="flex flex-col items-start gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Log Interaction
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Auto-filled by AI · talk to the assistant →
            </p>
          </div>

          {state.interaction_id ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <LuBadgeCheck className="w-3.5 h-3.5" />
              Interaction #{state.interaction_id}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
              <LuHash className="w-3.5 h-3.5" />
              New Interaction
            </div>
          )}
        </div>

        {recent.length > 0 && (
          <div className="mt-5 mb-1">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <LuClock className="w-3 h-3" /> Recent
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-600 whitespace-nowrap hover:bg-indigo-100 transition-colors cursor-default"
                >
                  #{r.id} · {r.hcp_name || "Unnamed"}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-7 py-2">
        <Section title="People & Date" Icon={LuUser}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="HCP Name" value={state.hcp_name} Icon={LuUser} />
            <Field label="Type" value={state.interaction_type} Icon={LuLayoutList} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" value={state.interaction_date} Icon={LuCalendar} />
            <Field label="Follow-up Date" value={state.followup_date} Icon={LuCalendarCheck} />
          </div>
        </Section>

        <Section title="Discussion" Icon={LuPill}>
          <Field label="Products Discussed" value={state.products_discussed} Icon={LuPill} />
          <MaterialsField value={state.materials_shared} />
          <SentimentField value={state.sentiment} />
        </Section>

        <Section title="Notes" Icon={LuNotebookPen}>
          <div>
            <Field label="Interaction Notes" value={state.notes} Icon={LuNotebookPen} />
            <button
              disabled
              className="mt-1 text-xs font-medium text-gray-300 cursor-not-allowed flex items-center gap-1.5"
              title="Voice note summarization is not implemented in this build -- notes are extracted from typed chat messages instead"
            >
              <span>🎙️</span> Summarize from Voice Note
            </button>
          </div>
          <Field label="Follow-up Notes" value={state.followup_notes} Icon={LuArrowRight} />
        </Section>

        {state.compliance_flag && (
          <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 fade-in">
            <LuShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 text-xs uppercase tracking-wide mb-0.5">
                Compliance Flag
              </p>
              <p className="text-sm">{state.compliance_reason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
