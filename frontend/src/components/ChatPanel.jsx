import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { formStateUpdated, messageAdded } from "../redux/interactionSlice";
import {
  LuSend,
  LuBot,
  LuUser,
  LuWrench,
  LuSparkles,
  LuWifi,
  LuX,
} from "react-icons/lu";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const SUGGESTIONS = [
  "Met Dr. Sharma today, discussed CardioPlus, she was very positive",
  "Phone call with Dr. Patel — needs a follow-up next Monday",
  "Shared the NeuroCare brochure with Dr. Anand, neutral reaction",
];

function UserAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-sm">
      <LuUser className="w-3.5 h-3.5" />
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white shrink-0 shadow-sm">
      <LuBot className="w-3.5 h-3.5" />
    </div>
  );
}

function Message({ m, showAvatar, marginClass }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex items-end gap-2 fade-in ${marginClass} ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {isUser ? (
        <UserAvatar />
      ) : (
        showAvatar ? <BotAvatar /> : <div className="w-7 shrink-0" />
      )}
      <div className={`max-w-[76%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-blue-600 text-white rounded-br-sm shadow-md"
              : "bg-slate-100/95 text-slate-800 border border-slate-200/60 rounded-bl-sm shadow-sm"
          }`}
        >
          {m.text}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({ showAvatar }) {
  return (
    <div className="flex items-end gap-2 mb-4 fade-in">
      {showAvatar ? <BotAvatar /> : <div className="w-7 shrink-0" />}
      <div className="bg-slate-100/95 border border-slate-200/60 shadow-sm px-4 py-3.5 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce-dot animate-bounce-dot-1" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce-dot animate-bounce-dot-2" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce-dot animate-bounce-dot-3" />
      </div>
    </div>
  );
}

function EmptyState({ suggestions, onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-10">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-4 shadow-sm">
        <LuSparkles className="w-6 h-6 text-indigo-500" />
      </div>
      <h3 className="text-base font-bold text-slate-700 mb-1">AI HCP Assistant</h3>
      <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-7">
        Describe your interaction and I'll fill the form for you automatically.
      </p>

      <div className="w-full flex flex-col gap-2">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">
          Try an example
        </p>
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="text-left w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-150 shadow-sm font-medium"
          >
            "{s}"
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatPanel({ onMobileClose }) {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.interaction);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, loading]);

  const sendMessage = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    dispatch(messageAdded({ role: "user", text: msgText }));
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/chat`, {
        message: msgText,
        interaction_id: state.interaction_id,
        current_form_state: state,
      });
      dispatch(formStateUpdated(data.form_state));
      dispatch(messageAdded({ role: "assistant", text: data.reply, tool: data.tool_used }));
    } catch (err) {
      dispatch(
        messageAdded({
          role: "assistant",
          text: "Sorry, something went wrong reaching the agent.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const hasMessages = state.messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center text-white shadow-sm">
            <LuBot className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">
              AI Assistant
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
              HCP Interaction Agent
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <LuWifi className="w-3 h-3" />
            Online
          </div>
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 md:hidden transition-colors"
              title="Close chat"
            >
              <LuX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-6 py-5"
        style={{ background: "linear-gradient(180deg, #f8faff 0%, #f9fafb 100%)" }}
      >
        {!hasMessages ? (
          <EmptyState suggestions={SUGGESTIONS} onSelect={sendMessage} />
        ) : (
          <>
            {state.messages.map((m, i) => {
              const isUser = m.role === "user";
              const showAvatar = !isUser && (i === 0 || state.messages[i - 1].role !== "assistant");
              const isNextSameSender = i < state.messages.length - 1
                ? state.messages[i + 1].role === m.role
                : (loading && m.role === "assistant");
              const marginClass = isNextSameSender ? "mb-2" : "mb-4";
              return (
                <Message
                  key={i}
                  m={m}
                  showAvatar={showAvatar}
                  marginClass={marginClass}
                />
              );
            })}
            {loading && (
              <TypingIndicator
                showAvatar={
                  state.messages.length === 0 ||
                  state.messages[state.messages.length - 1].role !== "assistant"
                }
              />
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex gap-2 items-end bg-white border border-slate-300 rounded-2xl px-4 py-2.5 shadow-md focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100/50 transition-all duration-200">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Describe the interaction… (Enter to send)"
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none resize-none py-1.5 leading-relaxed"
            style={{ minHeight: "24px", maxHeight: "120px" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-200 ${
              loading || !input.trim()
                ? "bg-slate-200 cursor-not-allowed"
                : "bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-100 cursor-pointer hover:scale-105 active:scale-95"
            }`}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            ) : (
              <LuSend className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
