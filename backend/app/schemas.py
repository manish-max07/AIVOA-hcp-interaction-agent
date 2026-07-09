from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class ChatRequest(BaseModel):
    message: str
    interaction_id: Optional[int] = None  # if editing an existing draft
    current_form_state: Optional[Dict[str, Any]] = None  # what the frontend currently shows


class ChatResponse(BaseModel):
    reply: str
    form_state: Dict[str, Any]
    interaction_id: Optional[int] = None
    tool_used: Optional[str] = None


class InteractionOut(BaseModel):
    id: int
    hcp_name: Optional[str] = None
    interaction_date: Optional[datetime] = None
    interaction_type: Optional[str] = None
    products_discussed: Optional[str] = None
    sentiment: Optional[str] = None
    notes: Optional[str] = None
    compliance_flag: Optional[bool] = False
    compliance_reason: Optional[str] = None
    followup_date: Optional[datetime] = None
    followup_notes: Optional[str] = None

    class Config:
        from_attributes = True
