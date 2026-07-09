from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from langchain_core.messages import HumanMessage, AIMessage

from .database import Base, engine, get_db
from . import models
from .schemas import ChatRequest, ChatResponse, InteractionOut
from .agent import build_agent

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HCP CRM - Log Interaction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    form_state = dict(req.current_form_state or {})
    if req.interaction_id:
        form_state["interaction_id"] = req.interaction_id

    agent = build_agent(db, form_state)
    result = agent.invoke({"messages": [HumanMessage(content=req.message)]})

    # Last AI message is the natural-language reply to show in the chat panel
    final_message = result["messages"][-1]
    tool_used = None
    for msg in result["messages"]:
        if isinstance(msg, AIMessage) and getattr(msg, "tool_calls", None):
            tool_used = msg.tool_calls[0]["name"]

    return ChatResponse(
        reply=final_message.content,
        form_state=form_state,
        interaction_id=form_state.get("interaction_id"),
        tool_used=tool_used,
    )


@app.get("/interactions/{interaction_id}", response_model=InteractionOut)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    return db.query(models.Interaction).filter(models.Interaction.id == interaction_id).first()


@app.get("/interactions", response_model=list[InteractionOut])
def list_interactions(db: Session = Depends(get_db)):
    return db.query(models.Interaction).order_by(models.Interaction.created_at.desc()).all()
