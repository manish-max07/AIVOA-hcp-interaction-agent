import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  interaction_id: null,
  hcp_name: "",
  interaction_date: "",
  interaction_type: "",
  products_discussed: "",
  sentiment: "",
  notes: "",
  compliance_flag: false,
  compliance_reason: "",
  followup_date: "",
  followup_notes: "",
  messages: [
    {
      role: "assistant",
      text: "Hi! Tell me about your HCP interaction and I'll fill out the form for you.",
    },
  ],
};

const interactionSlice = createSlice({
  name: "interaction",
  initialState,
  reducers: {
    formStateUpdated(state, action) {
      if (action.payload) {
        const { messages, ...formFields } = action.payload;
        Object.assign(state, formFields);
      }
    },
    messageAdded(state, action) {
      state.messages.push(action.payload);
    },
    formReset() {
      return initialState;
    },
  },
});

export const { formStateUpdated, messageAdded, formReset } = interactionSlice.actions;
export default interactionSlice.reducer;
