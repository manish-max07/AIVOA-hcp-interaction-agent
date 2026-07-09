from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime
from .database import Base


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String(255), nullable=True)
    interaction_date = Column(DateTime, nullable=True)
    interaction_type = Column(String(100), nullable=True)  # call, visit, email
    products_discussed = Column(String(500), nullable=True)
    sentiment = Column(String(50), nullable=True)  # positive, neutral, negative
    notes = Column(Text, nullable=True)
    compliance_flag = Column(Boolean, default=False)
    compliance_reason = Column(Text, nullable=True)
    followup_date = Column(DateTime, nullable=True)
    followup_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
