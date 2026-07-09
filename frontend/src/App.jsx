import React from "react";
import InteractionForm from "./components/InteractionForm";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div style={{ width: "45%", borderRight: "1px solid #eee" }}>
        <InteractionForm />
      </div>
      <div style={{ width: "55%" }}>
        <ChatPanel />
      </div>
    </div>
  );
}
