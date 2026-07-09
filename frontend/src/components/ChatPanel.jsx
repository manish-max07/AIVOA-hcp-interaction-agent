import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { formStateUpdated, messageAdded } from "../redux/interactionSlice";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function ChatPanel() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.interaction);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput("");
    dispatch(messageAdded({ role: "user", text: userText }));
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/chat`, {
        message: userText,
        interaction_id: state.interaction_id,
        current_form_state: state,
      });
      dispatch(formStateUpdated(data.form_state));
      dispatch(
        messageAdded({
          role: "assistant",
          text: data.reply,
          tool: data.tool_used,
        })
      );
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee" }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>AI Assistant</h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {state.messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: 14,
                background: m.role === "user" ? "#2563eb" : "#f1f1f1",
                color: m.role === "user" ? "#fff" : "#111",
              }}
            >
              {m.text}
              {m.tool && (
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>tool: {m.tool}</div>
              )}
            </div>
          </div>
        ))}
        {loading && <div style={{ fontSize: 13, color: "#999" }}>Assistant is thinking...</div>}
      </div>

      <div style={{ padding: 16, borderTop: "1px solid #eee", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="e.g. Met Dr. Sharma today, discussed CardioPlus, she was positive"
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 14,
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
