from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class HCP(Base):
    __tablename__ = "hcps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    specialty = Column(String(255), nullable=True)
    hospital = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    interactions = relationship("Interaction", back_populates="hcp")


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"), nullable=True)
    hcp_name = Column(String(255), nullable=True)  # denormalized copy for quick display/search
    interaction_date = Column(DateTime, nullable=True)
    interaction_type = Column(String(100), nullable=True)
    products_discussed = Column(String(500), nullable=True)
    materials_shared = Column(String(500), nullable=True)
    sentiment = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    compliance_flag = Column(Boolean, default=False)
    compliance_reason = Column(Text, nullable=True)
    followup_date = Column(DateTime, nullable=True)
    followup_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hcp = relationship("HCP", back_populates="interactions")