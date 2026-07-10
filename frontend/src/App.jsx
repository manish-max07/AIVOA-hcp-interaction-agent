import React, { useState } from "react";
import InteractionForm from "./components/InteractionForm";
import ChatPanel from "./components/ChatPanel";
import { LuBot, LuX } from "react-icons/lu";

export default function App() {
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans relative" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f0fdf4 100%)" }}>
      {/* Left panel — interaction form (Full width on mobile, 44% on desktop) */}
      <div className="w-full md:w-[44%] flex flex-col md:border-r border-slate-200/80 bg-white/80 backdrop-blur-sm overflow-hidden shadow-sm">
        <InteractionForm />
      </div>

      {/* Right panel — AI chat (Slide-in drawer on mobile, static split panel on desktop) */}
      <div
        className={`
          flex-1 flex flex-col bg-white/95 md:bg-white/60 md:backdrop-blur-sm overflow-hidden transition-transform duration-300 ease-in-out
          fixed inset-0 z-40 md:relative md:z-auto md:flex md:transform-none
          ${isMobileChatOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
      >
        <ChatPanel onMobileClose={() => setIsMobileChatOpen(false)} />
      </div>

      {/* Floating launcher button for mobile devices */}
      <button
        onClick={() => setIsMobileChatOpen(!isMobileChatOpen)}
        className="
          fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-full 
          flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 md:hidden
        "
        title={isMobileChatOpen ? "Close chat" : "Chat with assistant"}
      >
        {isMobileChatOpen ? <LuX className="w-6 h-6" /> : <LuBot className="w-6 h-6" />}
      </button>
    </div>
  );
}
