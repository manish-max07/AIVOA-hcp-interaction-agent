import React from "react";
import { useSelector } from "react-redux";

const Field = ({ label, value }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>
      {label}
    </label>
    <div
      style={{
        padding: "10px 12px",
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        background: "#fafafa",
        minHeight: 20,
        fontSize: 14,
        color: value ? "#111" : "#aaa",
      }}
    >
      {value || "Not set yet"}
    </div>
  </div>
);

export default function InteractionForm() {
  const state = useSelector((s) => s.interaction);

  return (
    <div style={{ padding: 24, fontFamily: "'Inter', sans-serif", overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: 18, marginBottom: 4 }}>Log Interaction</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
        Filled automatically by the AI assistant &rarr;
      </p>

      {state.interaction_id && (
        <div style={{ fontSize: 12, color: "#2e7d32", marginBottom: 12 }}>
          Interaction #{state.interaction_id}
        </div>
      )}

      <Field label="HCP Name" value={state.hcp_name} />
      <Field label="Date" value={state.interaction_date} />
      <Field label="Type" value={state.interaction_type} />
      <Field label="Products Discussed" value={state.products_discussed} />
      <Field label="Materials Shared" value={state.materials_shared} />
      <Field label="Sentiment" value={state.sentiment} />
      <Field label="Notes" value={state.notes} />
      <Field label="Follow-up Date" value={state.followup_date} />
      <Field label="Follow-up Notes" value={state.followup_notes} />

      {state.compliance_flag && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#fff3e0",
            border: "1px solid #ffb74d",
            borderRadius: 8,
            fontSize: 13,
            color: "#e65100",
          }}
        >
          ⚠️ Compliance flag: {state.compliance_reason}
        </div>
      )}
    </div>
  );
}
