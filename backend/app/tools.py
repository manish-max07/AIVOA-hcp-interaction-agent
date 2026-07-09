import json
import os
from datetime import datetime
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from sqlalchemy.orm import Session
from .models import Interaction


def _get_extraction_llm():
    return ChatGroq(model="openai/gpt-oss-20b", temperature=0, api_key=os.getenv("GROQ_API_KEY"))


def _llm_extract_json(prompt: str) -> dict:
    resp = _get_extraction_llm().invoke(prompt)
    text = resp.content.strip().replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}


def make_tools(db: Session, form_state: dict):
    @tool
    def log_interaction(user_message: str) -> str:
        """Use this when the user describes a NEW HCP interaction that
        hasn't been logged yet. Extracts HCP name, date, interaction type,
        products discussed, sentiment, and notes, then creates the record."""
        prompt = f"""Extract structured data from this field rep's message about
an HCP interaction. Return ONLY valid JSON, no prose.

Message: "{user_message}"

JSON schema:
{{
  "hcp_name": string or null,
  "interaction_date": "YYYY-MM-DD" or null (use today {datetime.utcnow().date()} if 'today' is mentioned or no date given),
  "interaction_type": one of ["call","visit","email"] or null,
  "products_discussed": string or null (comma separated),
  "sentiment": one of ["positive","neutral","negative"] or null,
  "materials_shared": string or null (e.g. "brochures", "samples", comma separated if multiple, null if none mentioned),
  "notes": a short 1-2 sentence summary of what was discussed
}}"""
        extracted = _llm_extract_json(prompt)

        record = Interaction(
            hcp_name=extracted.get("hcp_name"),
            interaction_date=_safe_date(extracted.get("interaction_date")),
            interaction_type=extracted.get("interaction_type"),
            products_discussed=extracted.get("products_discussed"),
            sentiment=extracted.get("sentiment"),
            materials_shared=extracted.get("materials_shared"),
            notes=extracted.get("notes"),
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        form_state.update(extracted)
        form_state["interaction_id"] = record.id
        return f"Logged interaction #{record.id} for {extracted.get('hcp_name', 'the HCP')}."

    @tool
    def edit_interaction(user_message: str) -> str:
        """Use this when the user wants to CORRECT a field on an already-
        logged interaction. Updates only the mentioned field(s)."""
        interaction_id = form_state.get("interaction_id")
        if not interaction_id:
            return "There's no logged interaction yet to edit. Please log one first."

        prompt = f"""The user wants to correct one or more fields of an existing
CRM interaction record. Return ONLY valid JSON containing just the fields
that should change.

Message: "{user_message}"

Possible fields: hcp_name, interaction_date (YYYY-MM-DD), interaction_type
(call/visit/email), products_discussed, sentiment (positive/neutral/negative),
materials_shared, notes."""
        changes = _llm_extract_json(prompt)
        if not changes:
            return "I couldn't figure out what to change. Could you rephrase?"

        record = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not record:
            return "Couldn't find that interaction in the database."

        for field, value in changes.items():
            if field == "interaction_date":
                value = _safe_date(value)
            if hasattr(record, field) and value is not None:
                setattr(record, field, value)
        record.updated_at = datetime.utcnow()
        db.commit()

        form_state.update(changes)
        return f"Updated {', '.join(changes.keys())} for interaction #{interaction_id}."

    @tool
    def schedule_followup(user_message: str) -> str:
        """Use this when the user wants to schedule a follow-up visit, call,
        or reminder for this HCP."""
        prompt = f"""Extract a follow-up date and short note from this message.
Return ONLY JSON: {{"followup_date": "YYYY-MM-DD" or null, "followup_notes": string or null}}.
Today's date is {datetime.utcnow().date()}.

Message: "{user_message}\""""
        extracted = _llm_extract_json(prompt)
        interaction_id = form_state.get("interaction_id")
        if interaction_id:
            record = db.query(Interaction).filter(Interaction.id == interaction_id).first()
            if record:
                record.followup_date = _safe_date(extracted.get("followup_date"))
                record.followup_notes = extracted.get("followup_notes")
                db.commit()
        form_state.update(extracted)
        return f"Follow-up scheduled for {extracted.get('followup_date', 'a later date')}."

    @tool
    def compliance_flag(user_message: str) -> str:
        """Use this to check the conversation for compliance-sensitive
        language, such as off-label claims or gift promises, and flag it."""
        prompt = f"""You are a pharma compliance reviewer. Does this message
contain any compliance risk (off-label claims, gifts/kickbacks, unapproved
efficacy claims, guarantees)? Return ONLY JSON:
{{"flag": true/false, "reason": string or null}}.

Message: "{user_message}\""""
        result = _llm_extract_json(prompt)
        interaction_id = form_state.get("interaction_id")
        flag = bool(result.get("flag"))
        reason = result.get("reason")
        if interaction_id:
            record = db.query(Interaction).filter(Interaction.id == interaction_id).first()
            if record:
                record.compliance_flag = flag
                record.compliance_reason = reason
                db.commit()
        form_state["compliance_flag"] = flag
        form_state["compliance_reason"] = reason
        return f"⚠️ Compliance concern flagged: {reason}" if flag else "No compliance concerns detected."

    @tool
    def suggest_next_best_action(user_message: str) -> str:
        """Use this when the user asks what to do or discuss next with this HCP."""
        history_notes = form_state.get("notes", "") or ""
        prompt = f"""You are a life-sciences sales strategist. Suggest ONE concise,
specific next-best-action for the rep's next visit (max 2 sentences, no JSON).

Interaction summary: "{history_notes}"
Sentiment: {form_state.get('sentiment')}
Products discussed: {form_state.get('products_discussed')}
Latest message: "{user_message}\""""
        resp = _get_extraction_llm().invoke(prompt)
        return resp.content.strip()

    return [log_interaction, edit_interaction, schedule_followup, compliance_flag, suggest_next_best_action]


def _safe_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except (ValueError, TypeError):
        return None