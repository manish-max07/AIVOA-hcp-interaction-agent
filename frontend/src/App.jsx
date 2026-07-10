import React from "react";
import InteractionForm from "./components/InteractionForm";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f0fdf4 100%)" }}>
      {/* Left panel — interaction form */}
      <div className="w-[44%] flex flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-sm overflow-hidden shadow-sm">
        <InteractionForm />
      </div>

      {/* Right panel — AI chat */}
      <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm overflow-hidden">
        <ChatPanel />
      </div>
    </div>
  );
}
